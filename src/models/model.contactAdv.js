import mongoose from "mongoose";

let contactAdvschema = new mongoose.Schema(
  {
    StatusAssign: {
      type: String,
      default: "",
    },
    Campaign: {
      type: String,
      default: "",
    },
    ContactType: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    Location: {
      type: String,
      default: "",
    },
    User: {
      type: String,
      default: "",
    },
    Keyword: {
      type: String,
      default: "",
    },
    Limit: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ContactAdv = mongoose.model("ContactAdv", contactAdvschema);

export default ContactAdv;
