import express from "express";
import {
  createConFollowAdd,
  deleteConFollowAdd,
  getConFollowAdd,
  getConFollowAddById,
  updateConFollowAdd,
} from "../controllers/controller.confollowadd.js";

import { validate } from "../middlewares/validate.js";
import {
  createConFollowAddValidator,
  updateConFollowAddValidator,
} from "../validators/confollowaddvalidator.js";

const confollowaddRoutes = express.Router();

confollowaddRoutes.get("/", getConFollowAdd);
confollowaddRoutes.get("/:id", getConFollowAddById);
confollowaddRoutes.post(
  "/",
  validate(createConFollowAddValidator),
  createConFollowAdd
);
confollowaddRoutes.put(
  "/:id",
  validate(updateConFollowAddValidator),
  updateConFollowAdd
);
confollowaddRoutes.delete("/:id", deleteConFollowAdd);

export default confollowaddRoutes;
