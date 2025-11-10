import express from "express";
import {
  createType,
  deleteType,
  deleteTypebyId,
  getType,
  getTypeById,
  updateType,
} from "../controllers/controller.type.js";

import { validate } from "../middlewares/validate.js";
import {
  createTypeValidator,
  updateTypeValidator,
} from "../validators/typevalidator.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";

const typeRoutes = express.Router();

typeRoutes.use(protectRoute);

typeRoutes.get("/", getType);
typeRoutes.get("/:id", isAdministrator, getTypeById);
typeRoutes.post(
  "/",
  isAdministrator,
  validate(createTypeValidator),
  createType
);
typeRoutes.put(
  "/:id",
  isAdministrator,
  validate(updateTypeValidator),
  updateType
);
typeRoutes.delete("/", isAdministrator, deleteType);
typeRoutes.delete("/:id", isAdministrator, deleteTypebyId);

export default typeRoutes;
