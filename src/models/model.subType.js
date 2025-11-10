import mongoose from "mongoose";

let subtypeschema = new mongoose.Schema(
  {
    Campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    CustomerType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
      required: true,
    },
    Name: {
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

const SubType = mongoose.model("SubType", subtypeschema);

export default SubType;
