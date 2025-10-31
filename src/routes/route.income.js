import express from "express";
import {
  createIncome,
  deleteIncome,
  getIncome,
  getIncomeById,
  updateIncome,
} from "../controllers/controller.income.js";

import { validate } from "../middlewares/validate.js";
import {
  createIncomeValidator,
  updateIncomeValidator,
} from "../validators/incomevalidator.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";

const incomeRoutes = express.Router();

incomeRoutes.use(protectRoute);
incomeRoutes.use(isAdministrator);

incomeRoutes.get("/", getIncome);
incomeRoutes.get("/:id", getIncomeById);
incomeRoutes.post("/", validate(createIncomeValidator), createIncome);
incomeRoutes.put("/:id", validate(updateIncomeValidator), updateIncome);
incomeRoutes.delete("/:id", deleteIncome);

export default incomeRoutes;
