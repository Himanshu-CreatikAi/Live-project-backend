import mongoose from "mongoose";

let contactschema = new mongoose.Schema(
  {
    Campaign: {
      type: String,
      default: "",
    },
    Range: {
      type: String,
      default: "",
    },
    ContactNo: {
      type: String,
      default: "",
    },
    Location: {
      type: String,
      default: "",
    },
    ContactType: {
      type: String,
      default: "",
    },
    Name: {
      type: String,
      require: true,
    },
    City: {
      type: String,
      default: "",
    },
    Address: {
      type: String,
      default: "",
    },
    ContactIndustry: {
      type: String,
      default: "",
    },
    ContactFunctionalArea: {
      type: String,
      default: "",
    },
    ReferenceId: {
      type: String,
      default: "",
    },
    Notes: {
      type: String,
      default: "",
    },
    Facilities: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      default: "",
    },
    Email: {
      type: String,
      require: true,
    },
    CompanyName: {
      type: String,
      default: "",
    },
    Website: {
      type: String,
      default: "",
    },
    Status: {
      type: String,
      default: "",
    },
    Qualifications: {
      type: String,
      default: "",
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    AssignTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    isImported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactschema);

export default Contact;
