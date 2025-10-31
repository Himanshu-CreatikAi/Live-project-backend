import express from "express";
import {
  createContactType,
  deleteContactType,
  getContactType,
  getContactTypeById,
  updateContactType,
} from "../controllers/controller.contactType.js";

import { validate } from "../middlewares/validate.js";
import {
  createContactTypeValidator,
  updateContactTypeValidator,
} from "../validators/contacttypevalidator.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";

const contactTypeRoutes = express.Router();
contactTypeRoutes.use(protectRoute);
contactTypeRoutes.use(isAdministrator);

contactTypeRoutes.get("/", getContactType);
contactTypeRoutes.get("/:id", getContactTypeById);
contactTypeRoutes.post(
  "/",
  validate(createContactTypeValidator),
  createContactType
);
contactTypeRoutes.put(
  "/:id",
  validate(updateContactTypeValidator),
  updateContactType
);
contactTypeRoutes.delete("/:id", deleteContactType);

export default contactTypeRoutes;
