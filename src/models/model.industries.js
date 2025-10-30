import mongoose from "mongoose";

let industryschema = new mongoose.Schema(
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

const Industry = mongoose.model("Industry", industryschema);

export default Industry;
