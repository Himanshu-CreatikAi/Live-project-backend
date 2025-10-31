import express from "express";
import {
  createIndustry,
  deleteIndustry,
  getIndustry,
  getIndustryById,
  updateIndustry,
} from "../controllers/controller.industries.js";

import { validate } from "../middlewares/validate.js";
import {
  createIndustryValidator,
  updateIndustryValidator,
} from "../validators/industriesvalidator.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";

const industryRoutes = express.Router();

industryRoutes.use(protectRoute);
industryRoutes.use(isAdministrator);
industryRoutes.get("/", getIndustry);
industryRoutes.get("/:id", getIndustryById);
industryRoutes.post("/", validate(createIndustryValidator), createIndustry);
industryRoutes.put("/:id", validate(updateIndustryValidator), updateIndustry);
industryRoutes.delete("/:id", deleteIndustry);

export default industryRoutes;
