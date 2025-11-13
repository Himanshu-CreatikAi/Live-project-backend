import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Contact from "../models/model.contact.js";
import ApiError from "../utils/ApiError.js";

// For saving summary files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Default key mapping (auto map fallback)
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

// ✅ Helper: normalize Excel headers using both auto + manual maps
const normalizeKeys = (row, manualMap = {}) => {
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    const lowerKey = key.trim().toLowerCase();

    // 1️⃣ Manual map (highest priority)
    const manualKey = manualMap[lowerKey];

    // 2️⃣ Auto key map (fallback)
    const normalizedKey = manualKey || keyMap[lowerKey] || key;

    normalized[normalizedKey] = value;
  }
  return normalized;
};

// ✅ Controller: Import Contacts (manual + auto mapping)
export const importContacts = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { Campaign, ContactType, Range, fieldMapping } = req.body;

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

    // 2️⃣ Parse manual mapping if provided
    let manualMap = {};
    if (fieldMapping) {
      try {
        manualMap = JSON.parse(fieldMapping);
      } catch (err) {
        return next(new ApiError(400, "Invalid fieldMapping JSON format"));
      }
    }

    // 3️⃣ Read Excel/CSV
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData.length) {
      fs.unlink(req.file.path, () => {});
      return next(new ApiError(400, "Excel file is empty"));
    }

    // 4️⃣ Normalize headers (auto + manual)
    const normalizedData = sheetData.map((row) =>
      normalizeKeys(row, manualMap)
    );

    // 5️⃣ Filter & format valid contacts
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

    // 6️⃣ Prevent duplicates by ContactNo
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

    // 7️⃣ Insert unique contacts
    const inserted = uniqueContacts.length
      ? await Contact.insertMany(uniqueContacts, { ordered: false })
      : [];

    // 8️⃣ Generate summary Excel
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

    // 9️⃣ Cleanup uploaded file
    fs.unlink(req.file.path, () => {});

    // 🔟 Response
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

// ✅ Controller: Read Headers (for manual mapping)
export const readContactHeaders = async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError(400, "No file uploaded"));

    // Read Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Extract headers
    const headers = data[0] || [];

    // Delete file
    fs.unlink(req.file.path, () => {});

    if (!headers.length)
      return next(new ApiError(400, "No headers found in file"));

    res.status(200).json({
      success: true,
      message: "Headers extracted successfully",
      headers,
    });
  } catch (error) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    next(new ApiError(500, error.message));
  }
};
