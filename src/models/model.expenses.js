import mongoose from "mongoose";

let expenseschema = new mongoose.Schema(
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

const Expense = mongoose.model("Expense", expenseschema);

export default Expense;
