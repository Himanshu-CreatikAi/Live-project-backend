import express from "express";
import {
  createLocation,
  deleteLocation,
  getLocation,
  getLocationById,
  updateLocation,
} from "../controllers/controller.location.js";

import { validate } from "../middlewares/validate.js";
import {
  createLocationValidator,
  updateLocationValidator,
} from "../validators/locationvalidator.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";

const locationRoutes = express.Router();
locationRoutes.use(protectRoute);
locationRoutes.use(isAdministrator);

locationRoutes.get("/", getLocation);
locationRoutes.get("/:id", getLocationById);
locationRoutes.post("/", validate(createLocationValidator), createLocation);
locationRoutes.put("/:id", validate(updateLocationValidator), updateLocation);
locationRoutes.delete("/:id", deleteLocation);

export default locationRoutes;
