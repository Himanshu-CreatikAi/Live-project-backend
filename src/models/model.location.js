import mongoose from "mongoose";

let locationschema = new mongoose.Schema(
  {
    Name: {
      type: String,
      default: "",
    },
    Status: {
      type: String,
      default: "",
    },
    City: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Location = mongoose.model("Location", locationschema);

export default Location;
