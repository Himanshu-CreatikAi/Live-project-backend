import express from "express";
import {
  adminLogin,
  adminLogout,
  adminSignup,
  checkAuth,
} from "../controllers/controller.admin.js";

import { validate } from "../middlewares/validate.js";
import { adminValidator } from "../validators/adminValidator.js";
import { protectRoute } from "../middlewares/auth.js";

const adminRoutes = express.Router();

adminRoutes.get("/check", protectRoute, checkAuth);
adminRoutes.post("/login", validate(adminValidator), adminLogin);
adminRoutes.post("/signup", validate(adminValidator), adminSignup);
adminRoutes.post("/logout", protectRoute, adminLogout);

export default adminRoutes;
