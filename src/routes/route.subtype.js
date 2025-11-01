import express from "express";
import {
  createSubType,
  deleteSubType,
  deleteSubTypebyId,
  getSubType,
  getSubTypeById,
  updateSubType,
} from "../controllers/controller.subtype.js";

import { validate } from "../middlewares/validate.js";
import {
  createSubTypeValidator,
  updateSubTypeValidator,
} from "../validators/subtypevalidator.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";

const subtypeRoutes = express.Router();

subtypeRoutes.use(protectRoute);
subtypeRoutes.use(isAdministrator);

subtypeRoutes.get("/", getSubType);
subtypeRoutes.get("/:id", getSubTypeById);
subtypeRoutes.post("/", validate(createSubTypeValidator), createSubType);
subtypeRoutes.put("/:id", validate(updateSubTypeValidator), updateSubType);
subtypeRoutes.delete("/", deleteSubType);
subtypeRoutes.delete("/:id", deleteSubTypebyId);

export default subtypeRoutes;
