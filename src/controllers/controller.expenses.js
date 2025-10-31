import Expense from "../models/model.expenses.js";
import ApiError from "../utils/ApiError.js";

export const getExpense = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Expense.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const expense = await query;

    res.status(200).json(expense);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return next(new ApiError(404, "Expense not found"));
    }
    res.status(200).json(expense);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const expense = new Expense({
      Name,
      Status,
    });
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedExpense) {
      return next(new ApiError(404, "Expense not found"));
    }
    res.status(200).json(updatedExpense);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) {
      return next(new ApiError(404, "Expense not found"));
    }
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
