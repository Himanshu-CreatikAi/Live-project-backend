import express from "express";
import {
  adminLogin,
  adminSignup,
  checkAuth,
} from "../controllers/controller.admin.js";

import { validate } from "../middlewares/validate.js";
import { adminValidator } from "../validators/adminValidator.js";

const adminRoutes = express.Router();

adminRoutes.get("/check", checkAuth);
adminRoutes.post("/login", validate(adminValidator), adminLogin);
adminRoutes.post("/signup", validate(adminValidator), adminSignup);

export default adminRoutes;
