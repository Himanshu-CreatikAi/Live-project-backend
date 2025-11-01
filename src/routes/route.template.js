import express from "express";
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} from "../controllers/controller.template.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";

const templateRoute = express.Router();

templateRoute.use(protectRoute);
templateRoute.use(isAdministrator);

templateRoute.post("/", createTemplate);
templateRoute.get("/", getTemplates);
templateRoute.get("/:id", getTemplateById);
templateRoute.put("/:id", updateTemplate);
templateRoute.delete("/:id", deleteTemplate);

export default templateRoute;
