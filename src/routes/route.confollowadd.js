import express from "express";
import {
  createConFollowAdd,
  deleteConFollowAdd,
  deleteAllConFollowAdd,
  getConFollowAdd,
  getConFollowAddByContact,
  updateConFollowAdd,
} from "../controllers/controller.confollowadd.js";

import { validate } from "../middlewares/validate.js";
import {
  createConFollowAddValidator,
  updateConFollowAddValidator,
} from "../validators/confollowaddvalidator.js";

const confollowaddRoutes = express.Router();

confollowaddRoutes.get("/", getConFollowAdd);

confollowaddRoutes.get("/contact/:contactId", getConFollowAddByContact);

confollowaddRoutes.post(
  "/:contactId",
  validate(createConFollowAddValidator),
  createConFollowAdd
);

confollowaddRoutes.put(
  "/:id",
  validate(updateConFollowAddValidator),
  updateConFollowAdd
);

confollowaddRoutes.delete("/:id", deleteConFollowAdd);

confollowaddRoutes.delete("/", deleteAllConFollowAdd);

export default confollowaddRoutes;
