import mongoose from "mongoose";

let campaignschema = new mongoose.Schema(
  {
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

const Campaign = mongoose.model("Campaign", campaignschema);

export default Campaign;
