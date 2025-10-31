import mongoose from "mongoose";

let incomeschema = new mongoose.Schema(
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

const Income = mongoose.model("Income", incomeschema);

export default Income;
