import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Contact from "../models/model.contact.js";
import ApiError from "../utils/ApiError.js";

// Get __dirname for saving summary files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Helper: normalize Excel headers to schema keys
const normalizeKeys = (row) => {
  const keyMap = {
    "contact no": "ContactNo",
    contactno: "ContactNo",
    mobile: "ContactNo",
    "mobile number": "ContactNo",
    phone: "ContactNo",
    "phone number": "ContactNo",
    fullname: "Name",
    "full name": "Name",
    "contact name": "Name",
    "person name": "Name",
    email: "Email",
    "e-mail": "Email",
    mail: "Email",
    city: "City",
    location: "Location",
    address: "Address",
    company: "CompanyName",
    "company name": "CompanyName",
    industry: "ContactIndustry",
    "functional area": "ContactFunctionalArea",
    notes: "Notes",
    facilities: "Facilities",
    "reference id": "ReferenceId",
    range: "Range",
    status: "Status",
  };

  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = keyMap[key.trim().toLowerCase()] || key;
    normalized[normalizedKey] = value;
  }
  return normalized;
};

// ✅ Controller: Import Contacts
export const importContacts = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { Campaign, ContactType, Range } = req.body;

    // 1️⃣ Validate required fields
    if (!Campaign || !ContactType || !Range) {
      if (req.file?.path) fs.unlink(req.file.path, () => {});
      return next(
        new ApiError(400, "Campaign, ContactType, and Range are required")
      );
    }

    if (!req.file) {
      return next(new ApiError(400, "No file uploaded"));
    }

    // 2️⃣ Read Excel/CSV file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData.length) {
      fs.unlink(req.file.path, () => {});
      return next(new ApiError(400, "Excel file is empty"));
    }

    // 3️⃣ Normalize headers
    const normalizedData = sheetData.map((row) => normalizeKeys(row));

    // 4️⃣ Filter and format valid contacts
    const formattedContacts = normalizedData
      .filter((row) => row.ContactNo && row.Name)
      .map((row) => ({
        ...row,
        Campaign,
        ContactType,
        Range,
        CreatedBy: admin._id,
        City: admin.city || row.City || "",
        isImported: true,
      }));

    if (!formattedContacts.length) {
      fs.unlink(req.file.path, () => {});
      return next(new ApiError(400, "No valid contact records found"));
    }

    // 5️⃣ Prevent duplicates by ContactNo
    const contactNumbers = formattedContacts
      .map((c) => c.ContactNo)
      .filter(Boolean);

    const existingContacts = await Contact.find({
      ContactNo: { $in: contactNumbers },
    }).select("ContactNo");

    const existingNumbers = new Set(existingContacts.map((c) => c.ContactNo));

    const uniqueContacts = formattedContacts.filter(
      (c) => !existingNumbers.has(c.ContactNo)
    );

    const duplicateContacts = formattedContacts.filter((c) =>
      existingNumbers.has(c.ContactNo)
    );

    // 6️⃣ Insert unique contacts
    const inserted = uniqueContacts.length
      ? await Contact.insertMany(uniqueContacts, { ordered: false })
      : [];

    // 7️⃣ Generate Summary Excel (imported + duplicates)
    const summaryDir = path.join(__dirname, "../uploads/contact_summaries");
    if (!fs.existsSync(summaryDir))
      fs.mkdirSync(summaryDir, { recursive: true });

    const summaryFile = path.join(
      summaryDir,
      `contact-import-summary-${Date.now()}.xlsx`
    );

    const summaryWorkbook = xlsx.utils.book_new();

    if (inserted.length)
      xlsx.utils.book_append_sheet(
        summaryWorkbook,
        xlsx.utils.json_to_sheet(inserted.map((i) => i.toObject())),
        "Imported_Contacts"
      );

    if (duplicateContacts.length)
      xlsx.utils.book_append_sheet(
        summaryWorkbook,
        xlsx.utils.json_to_sheet(duplicateContacts),
        "Duplicate_Contacts"
      );

    xlsx.writeFile(summaryWorkbook, summaryFile);

    // 8️⃣ Cleanup uploaded file
    fs.unlink(req.file.path, () => {});

    // 9️⃣ Response with summary link
    res.status(200).json({
      success: true,
      message: `${inserted.length} contacts imported successfully. ${duplicateContacts.length} duplicates skipped.`,
      totalRecords: formattedContacts.length,
      importedCount: inserted.length,
      skippedCount: duplicateContacts.length,
      summaryFile: `/uploads/contact_summaries/${path.basename(summaryFile)}`,
    });
  } catch (error) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    next(new ApiError(500, error.message));
  }
};
