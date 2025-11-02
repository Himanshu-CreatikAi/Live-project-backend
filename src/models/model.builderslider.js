import mongoose from "mongoose";

const buliderSchema = new mongoose.Schema(
  {
    Image: { type: [String], default: [] },
    Status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Builder = mongoose.model("Builder", buliderSchema);

export default Builder;
