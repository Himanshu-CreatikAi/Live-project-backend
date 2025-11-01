import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Customer from "../models/model.customer.js";
import ApiError from "../utils/ApiError.js";

// For saving summary files in same folder as uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Helper: normalize Excel headers to schema keys
const normalizeKeys = (row) => {
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

  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = keyMap[key.trim().toLowerCase()] || key;
    normalized[normalizedKey] = value;
  }
  return normalized;
};

export const importCustomers = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { Campaign, CustomerType, CustomerSubType } = req.body;

    // ✅ 1️⃣ Validate required fields
    if (!Campaign || !CustomerType || !CustomerSubType) {
      if (req.file?.path) fs.unlink(req.file.path, () => {});
      return next(
        new ApiError(
          400,
          "Campaign, CustomerType, and CustomerSubType are required"
        )
      );
    }

    if (!req.file) {
      return next(new ApiError(400, "No file uploaded"));
    }

    // ✅ 2️⃣ Read Excel/CSV file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData.length) {
      fs.unlink(req.file.path, () => {});
      return next(new ApiError(400, "Excel file is empty"));
    }

    // ✅ 3️⃣ Normalize headers
    const normalizedData = sheetData.map((row) => normalizeKeys(row));

    // ✅ 4️⃣ Filter and format valid customers
    const formattedCustomers = normalizedData
      .filter((row) => row.ContactNumber && row.customerName)
      .map((row) => ({
        ...row,
        Campaign,
        CustomerType,
        CustomerSubType,
        CreatedBy: admin._id,
        City: admin.city || row.City || "",
        isImported: true,
      }));

    if (!formattedCustomers.length) {
      fs.unlink(req.file.path, () => {});
      return next(new ApiError(400, "No valid customer records found"));
    }

    // ✅ 5️⃣ Prevent duplicates
    const contactNumbers = formattedCustomers
      .map((c) => c.ContactNumber)
      .filter(Boolean);

    const existingCustomers = await Customer.find({
      ContactNumber: { $in: contactNumbers },
    }).select("ContactNumber");

    const existingNumbers = new Set(
      existingCustomers.map((c) => c.ContactNumber)
    );

    const uniqueCustomers = formattedCustomers.filter(
      (c) => !existingNumbers.has(c.ContactNumber)
    );

    const duplicateCustomers = formattedCustomers.filter((c) =>
      existingNumbers.has(c.ContactNumber)
    );

    // ✅ 6️⃣ Insert unique customers
    const inserted = uniqueCustomers.length
      ? await Customer.insertMany(uniqueCustomers, { ordered: false })
      : [];

    // ✅ 7️⃣ Generate Summary CSV (imported + duplicates)
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

    // ✅ 8️⃣ Cleanup uploaded file
    fs.unlink(req.file.path, () => {});

    // ✅ 9️⃣ Response with summary file link
    res.status(200).json({
      success: true,
      message: `${inserted.length} customers imported successfully. ${duplicateCustomers.length} duplicates skipped.`,
      totalRecords: formattedCustomers.length,
      importedCount: inserted.length,
      skippedCount: duplicateCustomers.length,
      summaryFile: `/uploads/summaries/${path.basename(summaryFile)}`, // you can expose this via static route
    });
  } catch (error) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    next(new ApiError(500, error.message));
  }
};
