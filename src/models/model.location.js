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
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
  },
  { timestamps: true }
);

const Location = mongoose.model("Location", locationschema);

export default Location;
