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

// ✅ Clean one number
const cleanNumber = (num) => {
  if (!num) return "";
  return String(num)
    .replace(/[^\d]/g, "") // keep digits only
    .replace(/^91/, "") // remove India code
    .replace(/^0+/, "") // remove leading zeroes
    .trim();
};

// ✅ Extract, split, clean & merge multiple phone numbers
const extractNumbers = (raw) => {
  if (!raw) return "";

  const nums = String(raw)
    .split(/[,/|;:-]/) // split on all separators
    .map((n) => cleanNumber(n))
    .filter((n) => n.length >= 10); // valid numbers only

  const unique = [...new Set(nums)]; // remove duplicates

  return unique.join(","); // return comma-separated list
};

// Normalize headers
const normalizeKeys = (row, manualMap = {}) => {
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    const lowerKey = key.trim().toLowerCase();

    const manualKey = manualMap[lowerKey];
    const normalizedKey = manualKey || keyMap[lowerKey] || key;

    let finalValue = value;

    // ⭐ Auto-clean mobile related fields
    if (
      [
        "contactno",
        "contact number",
        "mobile",
        "mobile number",
        "phone",
        "phone number",
      ].includes(lowerKey)
    ) {
      finalValue = extractNumbers(value); // ⭐ extract multiple numbers
    }

    normalized[normalizedKey] = finalValue;
  }
  return normalized;
};

// Import Contacts Controller
export const importContacts = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { fieldMapping } = req.body;

    // 1️⃣ Field mapping is required (same as customer import)
    if (!fieldMapping) {
      return next(new ApiError(400, "fieldMapping is required"));
    }

    // ⭐ Convert fieldMapping keys to lowercase
    let manualMap = {};
    try {
      const parsed = JSON.parse(fieldMapping);
      manualMap = {};

      Object.keys(parsed).forEach((key) => {
        manualMap[key.trim().toLowerCase()] = parsed[key];
      });
    } catch (err) {
      return next(new ApiError(400, "Invalid fieldMapping JSON"));
    }

    // 2️⃣ File required
    if (!req.file) {
      return next(new ApiError(400, "No file uploaded"));
    }

    // 3️⃣ Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData.length) {
      fs.unlink(req.file.path, () => {});
      return next(new ApiError(400, "Excel file is empty"));
    }

    // 4️⃣ Normalize using manualMap + keyMap
    const normalizedData = sheetData.map((row) =>
      normalizeKeys(row, manualMap)
    );

    // 5️⃣ Build formatted contacts (Campaign, ContactType, Range come from Excel)
    const formattedContacts = normalizedData
      .filter((row) => row.ContactNo && row.Name)
      .map((row) => ({
        ...row,
        ContactNo: extractNumbers(row.ContactNo),

        // ⭐ From Excel, NOT req.body
        Campaign: row.Campaign || "",
        ContactType: row.ContactType || "",
        Range: row.Range || "", // optional

        CreatedBy: admin._id,
        City: admin.city || row.City || "",
        isImported: true,
      }));

    if (!formattedContacts.length) {
      fs.unlink(req.file.path, () => {});
      return next(new ApiError(400, "No valid contact records found"));
    }

    // 6️⃣ Duplicate check
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

    // 8️⃣ Summary CSV Export
    const summaryDir = path.join(__dirname, "../uploads/summaries");
    if (!fs.existsSync(summaryDir))
      fs.mkdirSync(summaryDir, { recursive: true });

    const summaryFile = path.join(
      summaryDir,
      `contact-import-summary-${Date.now()}.csv`
    );

    const summarySheet = xlsx.utils.book_new();

    if (inserted.length)
      xlsx.utils.book_append_sheet(
        summarySheet,
        xlsx.utils.json_to_sheet(inserted.map((i) => i.toObject())),
        "Imported_Contacts"
      );

    if (duplicateContacts.length)
      xlsx.utils.book_append_sheet(
        summarySheet,
        xlsx.utils.json_to_sheet(duplicateContacts),
        "Duplicate_Contacts"
      );

    xlsx.writeFile(summarySheet, summaryFile);

    // 9️⃣ Remove uploaded file
    fs.unlink(req.file.path, () => {});

    res.status(200).json({
      success: true,
      message: `${inserted.length} contacts imported successfully. ${duplicateContacts.length} duplicates skipped.`,
      totalRecords: formattedContacts.length,
      importedCount: inserted.length,
      skippedCount: duplicateContacts.length,
      summaryFile: `/uploads/summaries/${path.basename(summaryFile)}`,
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
