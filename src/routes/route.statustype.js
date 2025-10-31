import express from "express";
import {
  createStatustype,
  deleteStatustype,
  getStatustype,
  getStatustypeById,
  updateStatustype,
} from "../controllers/controller.statustype.js";

import { validate } from "../middlewares/validate.js";
import {
  createStatustypeValidator,
  updateStatustypeValidator,
} from "../validators/statustypevalidator.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";

const statustypeRoutes = express.Router();

statustypeRoutes.use(protectRoute);
statustypeRoutes.use(isAdministrator);

statustypeRoutes.get("/", getStatustype);
statustypeRoutes.get("/:id", getStatustypeById);
statustypeRoutes.post(
  "/",
  validate(createStatustypeValidator),
  createStatustype
);
statustypeRoutes.put(
  "/:id",
  validate(updateStatustypeValidator),
  updateStatustype
);
statustypeRoutes.delete("/:id", deleteStatustype);

export default statustypeRoutes;
