import mongoose from "mongoose";

let smsschema = new mongoose.Schema(
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

const Sms = mongoose.model("Sms", smsschema);

export default Sms;
