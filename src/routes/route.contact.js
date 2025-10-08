import express from "express";
import {
  createContact,
  deleteContact,
  getContact,
  getContactById,
  updateContact,
  deleteContactbyId,
} from "../controllers/controller.contact.js";

import { validate } from "../middlewares/validate.js";
import {
  createContactValidator,
  updateContactValidator,
} from "../validators/contactvalidator.js";

const contactRoutes = express.Router();

contactRoutes.get("/", getContact);
contactRoutes.get("/:id", getContactById);
contactRoutes.post("/", validate(createContactValidator), createContact);
contactRoutes.put("/:id", validate(updateContactValidator), updateContact);
contactRoutes.delete("/", deleteContact);
contactRoutes.delete("/:id", deleteContactbyId);

export default contactRoutes;
