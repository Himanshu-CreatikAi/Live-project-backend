import express from "express";
import {
  createFunctionalArea,
  deleteFunctionalArea,
  getFunctionalArea,
  getFunctionalAreaById,
  updateFunctionalArea,
} from "../controllers/controller.functionalArea.js";

import { validate } from "../middlewares/validate.js";
import {
  createFunctionalAreaValidator,
  updateFunctionalAreaValidator,
} from "../validators/functionalAreavalidator.js";

const functionalAreaRoutes = express.Router();

functionalAreaRoutes.get("/", getFunctionalArea);
functionalAreaRoutes.get("/:id", getFunctionalAreaById);
functionalAreaRoutes.post("/", validate(createFunctionalAreaValidator), createFunctionalArea);
functionalAreaRoutes.put("/:id", validate(updateFunctionalAreaValidator), updateFunctionalArea);
functionalAreaRoutes.delete("/:id", deleteFunctionalArea);

export default functionalAreaRoutes;
