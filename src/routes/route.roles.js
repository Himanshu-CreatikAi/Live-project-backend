import express from "express";
import {
  createRole,
  deleteRole,
  getRole,
  getRoleById,
  updateRole,
} from "../controllers/controller.roles.js";

import { validate } from "../middlewares/validate.js";
import {
  createRoleValidator,
  updateRoleValidator,
} from "../validators/rolevalidator.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";

const roleRoutes = express.Router();

roleRoutes.use(protectRoute);
roleRoutes.use(isAdministrator);

roleRoutes.get("/", getRole);
roleRoutes.get("/:id", getRoleById);
roleRoutes.post("/", validate(createRoleValidator), createRole);
roleRoutes.put("/:id", validate(updateRoleValidator), updateRole);
roleRoutes.delete("/:id", deleteRole);

export default roleRoutes;
