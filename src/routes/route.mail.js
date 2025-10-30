import express from "express";
import {
  createMail,
  deleteMail,
  getMail,
  getMailById,
  updateMail,
} from "../controllers/controller.mail.js";

import { validate } from "../middlewares/validate.js";
import {
  createMailValidator,
  updateMailValidator,
} from "../validators/mailvalidator.js";

const mailRoutes = express.Router();

mailRoutes.get("/", getMail);
mailRoutes.get("/:id", getMailById);
mailRoutes.post("/", validate(createMailValidator), createMail);
mailRoutes.put("/:id", validate(updateMailValidator), updateMail);
mailRoutes.delete("/:id", deleteMail);

export default mailRoutes;
