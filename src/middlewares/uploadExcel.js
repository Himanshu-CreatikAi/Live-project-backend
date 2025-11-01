// middleware/uploadExcel.js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/excel/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/csv", // .csv
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only .xlsx, .xls, or .csv files are allowed"));
};

export const uploadExcel = multer({ storage, fileFilter });
