import mongoose from "mongoose";

let conFollowSearchchema = new mongoose.Schema(
  {
    Campaign: {
      type: String,
      default: "",
    },
    ContactType: {
      type: String,
      default: "",
    },
    PropertyType: {
      type: String,
      default: "",
    },
    StatusType: {
      type: String,
      default: "",
    },
    City: {
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

const ConFollowSearch = mongoose.model("ConFollowSearch", conFollowSearchchema);

export default ConFollowSearch;
