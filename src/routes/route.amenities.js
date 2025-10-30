import express from "express";
import {
  createAmenity,
  deleteAmenity,
  getAmenity,
  getAmenityById,
  updateAmenity,
} from "../controllers/controller.amenities.js";

import { validate } from "../middlewares/validate.js";
import {
  createAmenityValidator,
  updateAmenityValidator,
} from "../validators/amenitiesvalidator.js";

const amenityRoutes = express.Router();

amenityRoutes.get("/", getAmenity);
amenityRoutes.get("/:id", getAmenityById);
amenityRoutes.post("/", validate(createAmenityValidator), createAmenity);
amenityRoutes.put("/:id", validate(updateAmenityValidator), updateAmenity);
amenityRoutes.delete("/:id", deleteAmenity);

export default amenityRoutes;
