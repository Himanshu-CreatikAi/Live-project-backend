import express from "express";
import {
  createContactCampaign,
  deleteContactCampaign,
  getContactCampaign,
  getContactCampaignById,
  updateContactCampaign,
} from "../controllers/controller.contactcampaign.js";

import { validate } from "../middlewares/validate.js";
import {
  createContactCampaignValidator,
  updateContactCampaignValidator,
} from "../validators/contactcampaignvalidator.js";

const contactCampaignRoutes = express.Router();

contactCampaignRoutes.get("/", getContactCampaign);
contactCampaignRoutes.get("/:id", getContactCampaignById);
contactCampaignRoutes.post("/", validate(createContactCampaignValidator), createContactCampaign);
contactCampaignRoutes.put("/:id", validate(updateContactCampaignValidator), updateContactCampaign);
contactCampaignRoutes.delete("/:id", deleteContactCampaign);

export default contactCampaignRoutes;
