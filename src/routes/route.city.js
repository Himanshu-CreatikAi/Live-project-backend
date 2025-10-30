import express from "express";
import {
  createCity,
  deleteCity,
  getCity,
  getCityById,
  updateCity,
} from "../controllers/controller.city.js";

import { validate } from "../middlewares/validate.js";
import {
  createCityValidator,
  updateCityValidator,
} from "../validators/cityvalidator.js";

const cityRoutes = express.Router();

cityRoutes.get("/", getCity);
cityRoutes.get("/:id", getCityById);
cityRoutes.post("/", validate(createCityValidator), createCity);
cityRoutes.put("/:id", validate(updateCityValidator), updateCity);
cityRoutes.delete("/:id", deleteCity);

export default cityRoutes;
