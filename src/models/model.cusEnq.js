import mongoose from "mongoose";

let cusEnqschema = new mongoose.Schema(
  {
    UserName: {
      type: String,
      default: "",
    },
    PropertyName: {
      type: String,
      default: "",
    },
    Description: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const CusEnq = mongoose.model("CusEnq", cusEnqschema);

export default CusEnq;
