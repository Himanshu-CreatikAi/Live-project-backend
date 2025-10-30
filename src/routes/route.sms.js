import express from "express";
import {
  createSms,
  deleteSms,
  getSms,
  getSmsById,
  updateSms,
} from "../controllers/controller.sms.js";

import { validate } from "../middlewares/validate.js";
import {
  createSmsValidator,
  updateSmsValidator,
} from "../validators/smsvalidator.js";

const smsRoutes = express.Router();

smsRoutes.get("/", getSms);
smsRoutes.get("/:id", getSmsById);
smsRoutes.post("/", validate(createSmsValidator), createSms);
smsRoutes.put("/:id", validate(updateSmsValidator), updateSms);
smsRoutes.delete("/:id", deleteSms);

export default smsRoutes;
