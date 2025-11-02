import mongoose from "mongoose";

let expenseMarketingschema = new mongoose.Schema(
  {
    Date: {
      type: String,
      default: "",
    },
    PartyName: {
      type: String,
      default: "",
    },
    User: {
      type: String,
      default: "",
    },
    Expense: {
      type: String,
      default: "",
    },
    Amount: {
      type: String,
      default: "",
    },
    DueAmount: {
      type: String,
      default: "",
    },
    PaymentMethode: {
      type: String,
      default: "",
    },
    Status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const ExpenseMarketing = mongoose.model(
  "ExpenseMarketing",
  expenseMarketingschema
);

export default ExpenseMarketing;
