import express from "express";
import {
  createReference,
  deleteReference,
  getReference,
  getReferenceById,
  updateReference,
} from "../controllers/controller.references.js";

import { validate } from "../middlewares/validate.js";
import {
  createReferenceValidator,
  updateReferenceValidator,
} from "../validators/referencesvalidator.js";

const referenceRoutes = express.Router();

referenceRoutes.get("/", getReference);
referenceRoutes.get("/:id", getReferenceById);
referenceRoutes.post("/", validate(createReferenceValidator), createReference);
referenceRoutes.put("/:id", validate(updateReferenceValidator), updateReference);
referenceRoutes.delete("/:id", deleteReference);

export default referenceRoutes;
