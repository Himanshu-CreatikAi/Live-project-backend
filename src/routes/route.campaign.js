import express from "express";
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  getCampaignById,
  updateCampaign,
} from "../controllers/controller.campaign.js";

import { validate } from "../middlewares/validate.js";
import {
  createCampaignValidator,
  updateCampaignValidator,
} from "../validators/campaignvalidator.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";

const campaignRoutes = express.Router();

campaignRoutes.use(protectRoute);
campaignRoutes.use(isAdministrator);

campaignRoutes.get("/", getCampaign);
campaignRoutes.get("/:id", getCampaignById);
campaignRoutes.post("/", validate(createCampaignValidator), createCampaign);
campaignRoutes.put("/:id", validate(updateCampaignValidator), updateCampaign);
campaignRoutes.delete("/:id", deleteCampaign);

export default campaignRoutes;
