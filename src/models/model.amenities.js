import mongoose from "mongoose";

let amenityschema = new mongoose.Schema(
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

const Amenity = mongoose.model("Amenity", amenityschema);

export default Amenity;
