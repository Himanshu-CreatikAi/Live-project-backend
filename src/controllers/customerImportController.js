import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Customer from "../models/model.customer.js";
import ApiError from "../utils/ApiError.js";

// For saving summary files in same folder as uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Default normalization map (auto mapping)
const keyMap = {
  "customer name": "customerName",
  fullname: "customerName",
  "full name": "customerName",
  name: "customerName",
  contactnumber: "ContactNumber",
  contact: "ContactNumber",
  phone: "ContactNumber",
  "phone no.": "ContactNumber",
  mobile: "ContactNumber",
  "mobile number": "ContactNumber",
  email: "Email",
  "e-mail": "Email",
  mail: "Email",
  city: "City",
  location: "Location",
  area: "Area",
  address: "Adderess",
  facilities: "Facillities",
  facility: "Facillities",
  referenceid: "ReferenceId",
  "reference id": "ReferenceId",
  description: "Description",
};

// ✅ Helper: normalize Excel headers using auto + manual map
// 📌 Clean number function
const cleanNumber = (num) => {
  if (!num) return "";
  return String(num)
    .trim()
    .replace(/[^0-9]/g, "");
};

// 📌 Extract, split & clean multiple phone numbers
const extractNumbers = (raw) => {
  if (!raw) return "";

  const nums = String(raw)
    .split(/[,/|;-]/) // split by comma, slash, dash, semicolon, pipe
    .map((n) => cleanNumber(n))
    .filter((n) => n.length >= 10); // keep only valid numbers

  // remove duplicates
  const unique = [...new Set(nums)];

  return unique.join(","); // final comma list
};

const normalizeKeys = (row, manualMap = {}) => {
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    const lowerKey = key.trim().toLowerCase();

    const manualKey = manualMap[lowerKey];
    const normalizedKey = manualKey || keyMap[lowerKey] || key;

    normalized[normalizedKey] = value;
  }
  return normalized;
};

export const importCustomers = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { fieldMapping } = req.body;

    // 1️⃣ Manual field mapping is REQUIRED now
    if (!fieldMapping) {
      return next(new ApiError(400, "fieldMapping is required"));
    }

    // ⭐ Convert fieldMapping keys to lowercase to match Excel normalized keys
    let manualMap = {};
    try {
      const parsedMap = JSON.parse(fieldMapping);

      manualMap = {};
      Object.keys(parsedMap).forEach((key) => {
        manualMap[key.trim().toLowerCase()] = parsedMap[key];
      });
    } catch (err) {
      return next(new ApiError(400, "Invalid fieldMapping JSON format"));
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
      return next(new ApiError(400, "Excel file is empty"));
    }

    // 4️⃣ Normalize each row by manual map ONLY (auto-map removed)
    const normalizedData = sheetData.map((row) =>
      normalizeKeys(row, manualMap)
    );

    // 5️⃣ Extract fields from Excel after mapping
    const formattedCustomers = normalizedData
      .map((row) => {
        const cleanedList = extractNumbers(row.ContactNumber);

        return {
          ...row,
          ContactNumber: cleanedList,

          // ⭐ These now come from Excel through manualMap mapping
          Campaign: row.Campaign || "",
          CustomerType: row.CustomerType || "",
          CustomerSubType: row.CustomerSubType || "", // optional

          CreatedBy: admin._id,
          City: admin.city || row.City || "",
          isImported: true,
        };
      })
      .filter((row) => row.ContactNumber && row.customerName);

    if (!formattedCustomers.length) {
      return next(new ApiError(400, "No valid customer records found"));
    }

    // 6️⃣ Duplicate check
    const contactNumbers = formattedCustomers.map((c) => c.ContactNumber);
    const existing = await Customer.find({
      ContactNumber: { $in: contactNumbers },
    }).select("ContactNumber");

    const existingNumbers = new Set(existing.map((c) => c.ContactNumber));

    const uniqueCustomers = formattedCustomers.filter(
      (c) => !existingNumbers.has(c.ContactNumber)
    );

    const duplicateCustomers = formattedCustomers.filter((c) =>
      existingNumbers.has(c.ContactNumber)
    );

    // 7️⃣ Insert new customers
    const inserted = uniqueCustomers.length
      ? await Customer.insertMany(uniqueCustomers, { ordered: false })
      : [];

    // 8️⃣ Summary file
    const summaryDir = path.join(__dirname, "../uploads/summaries");
    if (!fs.existsSync(summaryDir))
      fs.mkdirSync(summaryDir, { recursive: true });

    const summaryFile = path.join(
      summaryDir,
      `import-summary-${Date.now()}.csv`
    );

    const summarySheet = xlsx.utils.book_new();

    if (inserted.length)
      xlsx.utils.book_append_sheet(
        summarySheet,
        xlsx.utils.json_to_sheet(inserted.map((i) => i.toObject())),
        "Imported_Customers"
      );

    if (duplicateCustomers.length)
      xlsx.utils.book_append_sheet(
        summarySheet,
        xlsx.utils.json_to_sheet(duplicateCustomers),
        "Duplicate_Customers"
      );

    xlsx.writeFile(summarySheet, summaryFile);

    // 9️⃣ Cleanup
    fs.unlink(req.file.path, () => {});

    res.status(200).json({
      success: true,
      message: `${inserted.length} customers imported successfully. ${duplicateCustomers.length} duplicates skipped.`,
      totalRecords: formattedCustomers.length,
      importedCount: inserted.length,
      skippedCount: duplicateCustomers.length,
      summaryFile: `/uploads/summaries/${path.basename(summaryFile)}`,
    });
  } catch (error) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    next(new ApiError(500, error.message));
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
