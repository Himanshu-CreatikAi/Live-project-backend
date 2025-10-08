import express from "express";
import {
  createConFollowup,
  deleteConFollowup,
  getConFollowup,
  getConFollowupById,
  updateConFollowup,
  deleteConFollowupbyId,
} from "../controllers/controller.confollowup.js";

import { validate } from "../middlewares/validate.js";
import {
  createConFollowupValidator,
  updateConFollowupValidator,
} from "../validators/confollowupvalidator.js";

const confollowupRoutes = express.Router();

confollowupRoutes.get("/", getConFollowup);
confollowupRoutes.get("/:id", getConFollowupById);
confollowupRoutes.post(
  "/",
  validate(createConFollowupValidator),
  createConFollowup
);
confollowupRoutes.put(
  "/:id",
  validate(updateConFollowupValidator),
  updateConFollowup
);
confollowupRoutes.delete("/:id", deleteConFollowupbyId);
confollowupRoutes.delete("/", deleteConFollowup);

export default confollowupRoutes;
