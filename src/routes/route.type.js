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

const typeRoutes = express.Router();

typeRoutes.get("/", getType);
typeRoutes.get("/:id", getTypeById);
typeRoutes.post("/", validate(createTypeValidator), createType);
typeRoutes.put("/:id", validate(updateTypeValidator), updateType);
typeRoutes.delete("/", deleteType);
typeRoutes.delete("/:id", deleteTypebyId);

export default typeRoutes;
