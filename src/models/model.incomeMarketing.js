import mongoose from "mongoose";

let incomeMarketingschema = new mongoose.Schema(
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
    Income: {
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

const IncomeMareting = mongoose.model("incomeMareting", incomeMarketingschema);

export default IncomeMareting;
