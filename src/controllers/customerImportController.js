import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Customer from "../models/model.customer.js";
import ApiError from "../utils/ApiError.js";

// Campaign + Type + SubType Auto Creator
import Campaign from "../models/model.campaign.js";
import Type from "../models/model.types.js";
import SubType from "../models/model.subType.js";

// ------------------------------
// FIXED: Correct dirname / filename
// ------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default key map
const keyMap = {
  "customer name": "customerName",
  fullname: "customerName",
  name: "customerName",
  contactnumber: "ContactNumber",
  phone: "ContactNumber",
  mobile: "ContactNumber",
  "mobile number": "ContactNumber",
  email: "Email",
  city: "City",
  location: "Location",
  area: "Area",
  address: "Adderess",
  facilities: "Facillities",
  description: "Description",
};

// Number cleaners
const cleanNumber = (num) => {
  if (!num) return "";
  return String(num)
    .trim()
    .replace(/[^0-9]/g, "");
};

const extractNumbers = (raw) => {
  if (!raw) return "";
  const nums = String(raw)
    .split(/[,/;|-]/)
    .map((n) => cleanNumber(n))
    .filter((n) => n.length >= 10);

  return [...new Set(nums)].join(",");
};

// Normalize Excel keys
const normalizeKeys = (row, manualMap = {}) => {
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    const lower = key.trim().toLowerCase();
    const manual = manualMap[lower];
    const finalKey = manual || keyMap[lower] || key;
    normalized[finalKey] = value;
  }
  return normalized;
};

// AUTO CREATE → Campaign → Type → SubType
const ensureCampaignTree = async (campaignName, typeName, subTypeName) => {
  let campaign = null;
  let customerType = null;
  let customerSubType = null;

  if (campaignName) {
    campaign = await Campaign.findOne({ Name: campaignName.trim() });
    if (!campaign) {
      campaign = await Campaign.create({
        Name: campaignName.trim(),
        Status: "Active",
      });
    }
  }

  if (campaign && typeName) {
    customerType = await Type.findOne({
      Name: typeName.trim(),
      Campaign: campaign._id,
    });
    if (!customerType) {
      customerType = await Type.create({
        Name: typeName.trim(),
        Campaign: campaign._id,
        Status: "Active",
      });
    }
  }

  if (campaign && customerType && subTypeName) {
    customerSubType = await SubType.findOne({
      Name: subTypeName.trim(),
      Campaign: campaign._id,
      CustomerType: customerType._id,
    });
    if (!customerSubType) {
      customerSubType = await SubType.create({
        Name: subTypeName.trim(),
        Campaign: campaign._id,
        CustomerType: customerType._id,
        Status: "Active",
      });
    }
  }

  return {
    campaignName: campaign?.Name || "",
    typeName: customerType?.Name || "",
    subTypeName: customerSubType?.Name || "",
  };
};

// MAIN CONTROLLER
export const importCustomers = async (req, res, next) => {
  try {
    const admin = req.admin;

    // fieldMapping required
    if (!req.body.fieldMapping)
      return next(new ApiError(400, "fieldMapping is required"));

    let manualMap = {};
    try {
      const parsed = JSON.parse(req.body.fieldMapping);
      Object.keys(parsed).forEach((key) => {
        manualMap[key.toLowerCase()] = parsed[key];
      });
    } catch {
      return next(new ApiError(400, "Invalid fieldMapping JSON"));
    }

    if (!req.file) return next(new ApiError(400, "No file uploaded"));

    // Read Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData.length) return next(new ApiError(400, "Empty Excel file"));

    const normalizedRows = sheetData.map((row) =>
      normalizeKeys(row, manualMap)
    );

    const finalCustomers = [];

    for (const row of normalizedRows) {
      if (!row.customerName || !row.ContactNumber) continue;

      // CLEAN PHONE
      row.ContactNumber = extractNumbers(row.ContactNumber);

      // AUTO CREATE
      const tree = await ensureCampaignTree(
        row.Campaign,
        row.CustomerType,
        row.CustomerSubType
      );

      finalCustomers.push({
        ...row,
        Campaign: tree.campaignName,
        CustomerType: tree.typeName,
        CustomerSubType: tree.subTypeName,
        CreatedBy: admin._id,
        City: admin.city || row.City || "",
        isImported: true,
      });
    }

    if (!finalCustomers.length)
      return next(new ApiError(400, "No valid customers found"));

    // Duplicate check
    const nums = finalCustomers.map((c) => c.ContactNumber);
    const existing = await Customer.find({
      ContactNumber: { $in: nums },
    }).select("ContactNumber");

    const existingNums = new Set(existing.map((e) => e.ContactNumber));

    const unique = finalCustomers.filter(
      (c) => !existingNums.has(c.ContactNumber)
    );

    const duplicates = finalCustomers.filter((c) =>
      existingNums.has(c.ContactNumber)
    );

    const inserted = unique.length
      ? await Customer.insertMany(unique, { ordered: false })
      : [];

    // -------------------------
    // FIXED SUMMARY EXPORT CODE
    // -------------------------
    const summaryDir = path.join(__dirname, "../uploads/summaries");
    if (!fs.existsSync(summaryDir))
      fs.mkdirSync(summaryDir, { recursive: true });

    const summaryFile = path.join(
      summaryDir,
      `customer-summary-${Date.now()}.xlsx`
    );

    const summaryWB = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(
      summaryWB,
      xlsx.utils.json_to_sheet(inserted),
      "Imported_Customers"
    );
    xlsx.utils.book_append_sheet(
      summaryWB,
      xlsx.utils.json_to_sheet(duplicates),
      "Duplicate_Customers"
    );

    xlsx.writeFile(summaryWB, summaryFile);

    fs.unlink(req.file.path, () => {});

    // FIXED RESPONSE STRINGS
    res.status(200).json({
      success: true,
      message: `${inserted.length} imported, ${duplicates.length} duplicates.`,
      totalRecords: finalCustomers.length,
      imported: inserted.length,
      skipped: duplicates.length,
      file: `/uploads/summaries/${path.basename(summaryFile)}`,
    });
  } catch (err) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    next(new ApiError(500, err.message));
  }
};

export const readCustomerHeaders = async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError(400, "No file uploaded"));

    // Read Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Get first row as headers
    const headers = data[0] || [];

    // Delete the file (we only needed headers)
    fs.unlink(req.file.path, () => {});

    if (!headers.length)
      return next(new ApiError(400, "No headers found in file"));

    // Respond with headers
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
