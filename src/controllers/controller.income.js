import Income from "../models/model.income.js";
import ApiError from "../utils/ApiError.js";

export const getIncome = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Income.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const income = await query;

    res.status(200).json(income);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getIncomeById = async (req, res, next) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return next(new ApiError(404, "Income not found"));
    }
    res.status(200).json(income);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createIncome = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const income = new Income({
      Name,
      Status,
    });
    const savedIncome = await income.save();
    res.status(201).json(savedIncome);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateIncome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedIncome = await Income.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedIncome) {
      return next(new ApiError(404, "Income not found"));
    }
    res.status(200).json(updatedIncome);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteIncome = async (req, res, next) => {
  try {
    const deletedIncome = await Income.findByIdAndDelete(req.params.id);
    if (!deletedIncome) {
      return next(new ApiError(404, "Income not found"));
    }
    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
