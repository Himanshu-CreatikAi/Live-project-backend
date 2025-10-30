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

const Statustype = mongoose.model("Status", statustypeschema);

export default Statustype;
