import mongoose from "mongoose";

let mailschema = new mongoose.Schema(
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

const Mail = mongoose.model("Mail", mailschema);

export default Mail;
