import mongoose from "mongoose";

let facilityschema = new mongoose.Schema(
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

const Facility = mongoose.model("Facility", facilityschema);

export default Facility;
