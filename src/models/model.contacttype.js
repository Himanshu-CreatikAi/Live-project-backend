import mongoose from "mongoose";

let contactTypeschema = new mongoose.Schema(
  {
    Campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
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
