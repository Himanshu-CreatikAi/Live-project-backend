import mongoose from "mongoose";

let contactCampaignschema = new mongoose.Schema(
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

const ContactCampaign = mongoose.model(
  "Contact campaign",
  contactCampaignschema
);

export default ContactCampaign;
