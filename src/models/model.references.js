import mongoose from "mongoose";

let referenceschema = new mongoose.Schema(
  {
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

const Reference = mongoose.model("Reference", referenceschema);

export default Reference;
