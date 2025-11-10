import mongoose from "mongoose";

let typeschema = new mongoose.Schema(
  {
    Campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
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

const Type = mongoose.model("Type", typeschema);

export default Type;
