// routes/contact.routes.js
import express from "express";
import {
  getContact,
  getContactById,
  createContact,
  updateContact,
  deleteContactbyId,
  deleteAllContacts,
  assignContact,
  bulkAssignCityContacts,
  getFavouriteContacts,
} from "../controllers/controller.contact.js";

import { validate } from "../middlewares/validate.js";
import {
  createContactValidator,
  updateContactValidator,
} from "../validators/contactvalidator.js";

import { protectRoute } from "../middlewares/auth.js";

const contactRoutes = express.Router();

// ✅ All routes protected by auth
contactRoutes.use(protectRoute);

// 🧩 Core CRUD
contactRoutes.get("/", getContact);
contactRoutes.get("/:id", getContactById);
contactRoutes.post("/", validate(createContactValidator), createContact);
contactRoutes.put("/:id", validate(updateContactValidator), updateContact);
contactRoutes.delete("/:id", deleteContactbyId);
contactRoutes.delete("/delete/all", deleteAllContacts);

// 🧩 Role-based features
contactRoutes.post("/assign", assignContact);
contactRoutes.post("/bulk-assign", bulkAssignCityContacts);

// 🧩 Favourites
contactRoutes.get("/favourites/all", getFavouriteContacts);

export default contactRoutes;
