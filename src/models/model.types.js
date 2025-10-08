import mongoose from "mongoose";

let typeschema = new mongoose.Schema(
  {
    Campaign: {
      type: String,
      default: "",
    },
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

const Type = mongoose.model("Type", typeschema);

export default Type;
