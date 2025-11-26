import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Contact from "../models/model.contact.js";
import ContactCampaign from "../models/model.contactcampaign.js";
import ContactType from "../models/model.contacttype.js";
import ApiError from "../utils/ApiError.js";

// File paths for saving summary
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Updated Key Mapping (added Campaign + ContactType support)
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
  status: "Status",

  // ⭐ FIX: These were missing → Campaign was never created
  campaign: "Campaign",
  "campaign name": "Campaign",
  "campaign title": "Campaign",

  // ⭐ FIX: Contact Type was also missing
  "contact type": "ContactType",
  "lead type": "ContactType",
  type: "ContactType",
};

// ------------------------------
// Utilities
// ------------------------------

const cleanNumber = (num) => {
  if (!num) return "";
  return String(num)
    .replace(/[^\d]/g, "")
    .replace(/^91/, "")
    .replace(/^0+/, "")
    .trim();
};

const extractNumbers = (raw) => {
  if (!raw) return "";
  const nums = String(raw)
    .split(/[,/|;:-]/)
    .map((n) => cleanNumber(n))
    .filter((n) => n.length >= 10);
  return [...new Set(nums)].join(",");
};

const normalizeKeys = (row, manualMap = {}) => {
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    const lowerKey = key.trim().toLowerCase();
    const manualKey = manualMap[lowerKey];
    const normalizedKey = manualKey || keyMap[lowerKey] || key;

    // Normalize contact numbers
    let finalValue = value;
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
      finalValue = extractNumbers(value);
    }

    normalized[normalizedKey] = finalValue;
  }
  return normalized;
};

// ------------------------------
// Auto Create Campaign + ContactType
// ------------------------------

const ensureCampaignAndType = async (campaignName, typeName) => {
  let campaign = null;
  let contactType = null;

  if (campaignName) {
    campaign = await ContactCampaign.findOne({ Name: campaignName.trim() });

    if (!campaign) {
      campaign = await ContactCampaign.create({
        Name: campaignName.trim(),
        Status: "Active",
      });
    }
  }

  if (campaign && typeName) {
    contactType = await ContactType.findOne({
      Name: typeName.trim(),
      Campaign: campaign._id,
    });

    if (!contactType) {
      contactType = await ContactType.create({
        Name: typeName.trim(),
        Campaign: campaign._id,
        Status: "Active",
      });
    }
  }

  return { campaign, contactType };
};

// ------------------------------
// Import Contacts Controller
// ------------------------------

export const importContacts = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { fieldMapping } = req.body;

    if (!fieldMapping)
      return next(new ApiError(400, "fieldMapping is required"));

    // Parse field mapping JSON from frontend
    let manualMap = {};
    try {
      const parsed = JSON.parse(fieldMapping);
      for (const key of Object.keys(parsed)) {
        manualMap[key.trim().toLowerCase()] = parsed[key];
      }
    } catch (err) {
      return next(new ApiError(400, "Invalid fieldMapping JSON"));
    }

    if (!req.file) return next(new ApiError(400, "No file uploaded"));

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData.length) {
      fs.unlink(req.file.path, () => {});
      return next(new ApiError(400, "Excel file is empty"));
    }

    const normalizedData = sheetData.map((row) =>
      normalizeKeys(row, manualMap)
    );

    const finalContacts = [];

    // ------------------------------
    // Loop → Normalize & Auto Create Campaign + Type
    // ------------------------------
    for (const row of normalizedData) {
      if (!row.ContactNo || !row.Name) continue;

      const { campaign, contactType } = await ensureCampaignAndType(
        row.Campaign,
        row.ContactType
      );

      finalContacts.push({
        ...row,
        ContactNo: extractNumbers(row.ContactNo),
        Campaign: campaign?.Name || "",
        ContactType: contactType?.Name || "",
        City: admin.city || row.City || "",
        CreatedBy: admin._id,
        isImported: true,
      });
    }

    if (!finalContacts.length) {
      fs.unlink(req.file.path, () => {});
      return next(
        new ApiError(400, "No valid contact records found in the file")
      );
    }

    // ------------------------------
    // Duplicate Filtering
    // ------------------------------
    const contactNumbers = finalContacts
      .map((c) => c.ContactNo)
      .filter(Boolean);

    const existingContacts = await Contact.find({
      ContactNo: { $in: contactNumbers },
    }).select("ContactNo");

    const existingNumbers = new Set(existingContacts.map((c) => c.ContactNo));

    const uniqueContacts = finalContacts.filter(
      (c) => !existingNumbers.has(c.ContactNo)
    );

    const duplicateContacts = finalContacts.filter((c) =>
      existingNumbers.has(c.ContactNo)
    );

    // Insert only non-duplicate contacts
    const inserted = uniqueContacts.length
      ? await Contact.insertMany(uniqueContacts, { ordered: false })
      : [];

    // ------------------------------
    // Create Summary File
    // ------------------------------

    const summaryDir = path.join(__dirname, "../uploads/summaries");
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
        xlsx.utils.json_to_sheet(inserted),
        "Imported_Contacts"
      );

    if (duplicateContacts.length)
      xlsx.utils.book_append_sheet(
        summaryWorkbook,
        xlsx.utils.json_to_sheet(duplicateContacts),
        "Duplicate_Contacts"
      );

    xlsx.writeFile(summaryWorkbook, summaryFile);

    // Delete temp uploaded Excel
    fs.unlink(req.file.path, () => {});

    // ------------------------------
    // Final Response
    // ------------------------------
    res.status(200).json({
      success: true,
      message: `${inserted.length} contacts imported successfully. ${duplicateContacts.length} duplicates skipped.`,
      totalRecords: finalContacts.length,
      importedCount: inserted.length,
      skippedCount: duplicateContacts.length,
      summaryFile: `/uploads/summaries/${path.basename(summaryFile)}`,
      importedContacts: inserted,
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
