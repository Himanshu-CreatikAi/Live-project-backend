import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["email", "whatsapp"],
      required: true,
    },
    subject: { type: String, default: "" }, // only used for email
    body: { type: String, required: true }, // HTML or plain text
    description: { type: String, default: "" }, // optional admin note
    createdBy: { type: String, default: "system" },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);

export default Template;
