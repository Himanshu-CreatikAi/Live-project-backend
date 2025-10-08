import mongoose from "mongoose";

let conFollowupschema = new mongoose.Schema(
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
    User: {
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
  },
  { timestamps: true }
);

const ConFollowups = mongoose.model("ConFollowup", conFollowupschema);

export default ConFollowups;
