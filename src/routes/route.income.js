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

const incomeRoutes = express.Router();

incomeRoutes.get("/", getIncome);
incomeRoutes.get("/:id", getIncomeById);
incomeRoutes.post("/", validate(createIncomeValidator), createIncome);
incomeRoutes.put("/:id", validate(updateIncomeValidator), updateIncome);
incomeRoutes.delete("/:id", deleteIncome);

export default incomeRoutes;
