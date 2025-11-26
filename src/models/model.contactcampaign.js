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
  "ContactCampaign",
  contactCampaignschema
);

export default ContactCampaign;
