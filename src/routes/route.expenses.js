import express from "express";
import {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenseById,
  updateExpense,
} from "../controllers/controller.expenses.js";

import { validate } from "../middlewares/validate.js";
import {
  createExpenseValidator,
  updateExpenseValidator,
} from "../validators/expensevalidator.js";
import { isAdministrator, protectRoute } from "../middlewares/auth.js";

const expenseRoutes = express.Router();

expenseRoutes.use(protectRoute);
expenseRoutes.use(isAdministrator);

expenseRoutes.get("/", getExpense);
expenseRoutes.get("/:id", getExpenseById);
expenseRoutes.post("/", validate(createExpenseValidator), createExpense);
expenseRoutes.put("/:id", validate(updateExpenseValidator), updateExpense);
expenseRoutes.delete("/:id", deleteExpense);

export default expenseRoutes;
