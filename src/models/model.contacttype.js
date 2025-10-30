import mongoose from "mongoose";

let contactTypeschema = new mongoose.Schema(
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

const ContactType = mongoose.model("ContactType", contactTypeschema);

export default ContactType;
