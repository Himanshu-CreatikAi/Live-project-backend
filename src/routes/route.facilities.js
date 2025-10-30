import express from "express";
import {
  createFacility,
  deleteFacility,
  getFacility,
  getFacilityById,
  updateFacility,
} from "../controllers/controller.facilities.js";

import { validate } from "../middlewares/validate.js";
import {
  createFacilityValidator,
  updateFacilityValidator,
} from "../validators/facilitiesvalidator.js";

const facilitiesRoutes = express.Router();

facilitiesRoutes.get("/", getFacility);
facilitiesRoutes.get("/:id", getFacilityById);
facilitiesRoutes.post("/", validate(createFacilityValidator), createFacility);
facilitiesRoutes.put("/:id", validate(updateFacilityValidator), updateFacility);
facilitiesRoutes.delete("/:id", deleteFacility);

export default facilitiesRoutes;
