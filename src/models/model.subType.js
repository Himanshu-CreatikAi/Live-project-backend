import mongoose from "mongoose";

let subtypeschema = new mongoose.Schema(
  {
    Campaign: {
      type: String,
      default: "",
    },
    CustomerType: {
      type: String,
      default: "",
    },
    Name: {
      type: String,
      default: "",
    },
    Status: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const SubType = mongoose.model("SubType", subtypeschema);

export default SubType;
