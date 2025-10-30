import express from "express";
import {
  createWhatsapp,
  deleteWhatsapp,
  getWhatsapp,
  getWhatsappById,
  updateWhatsapp,
} from "../controllers/controller.whatsapptemplate.js";

import { validate } from "../middlewares/validate.js";
import {
  createWhatsappValidator,
  updateWhatsappValidator,
} from "../validators/whatsappvalidator.js";

const whatsappRoutes = express.Router();

whatsappRoutes.get("/", getWhatsapp);
whatsappRoutes.get("/:id", getWhatsappById);
whatsappRoutes.post("/", validate(createWhatsappValidator), createWhatsapp);
whatsappRoutes.put("/:id", validate(updateWhatsappValidator), updateWhatsapp);
whatsappRoutes.delete("/:id", deleteWhatsapp);

export default whatsappRoutes;
