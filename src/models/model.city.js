import mongoose from "mongoose";

let cityschema = new mongoose.Schema(
  {
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

const City = mongoose.model("City", cityschema);

export default City;
