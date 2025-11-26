import mongoose from "mongoose";

let statustypeschema = new mongoose.Schema(
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

const Statustype = mongoose.model("ContactStatus", statustypeschema);

export default Statustype;
