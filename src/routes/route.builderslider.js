import express from "express";
import upload from "../config/multer.js";
import {
  getBuilders,
  getBuilderById,
  createBuilder,
  updateBuilder,
  deleteBuilder,
  deleteAllBuilders,
} from "../controllers/controller.buliderslider.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createBuilderValidator,
  updateBuilderValidator,
} from "../validators/buildersliderValidator.js";

const builderRoutes = express.Router();

// Protected routes
builderRoutes.use(protectRoute);
builderRoutes.use(isAdministrator);

builderRoutes.get("/", getBuilders);
builderRoutes.get("/:id", getBuilderById);

builderRoutes.post(
  "/",
  upload.fields([{ name: "Image", maxCount: 5 }]),
  validate(createBuilderValidator),
  createBuilder
);

builderRoutes.put(
  "/:id",
  upload.fields([{ name: "Image", maxCount: 5 }]),
  validate(updateBuilderValidator),
  updateBuilder
);

builderRoutes.delete("/:id", deleteBuilder);
builderRoutes.delete("/", deleteAllBuilders);

export default builderRoutes;
