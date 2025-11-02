import ExpenseMarketing from "../models/model.expensemarketing.js";
import ApiError from "../utils/ApiError.js";

// ✅ Get all income marketing entries with filters
export const getExpenseMarketing = async (req, res, next) => {
  try {
    const { User, Expense, PaymentMethode, keyword, limit } = req.query;

    const filter = {};

    if (User) filter.User = { $regex: User, $options: "i" };
    if (Expense) filter.Expense = { $regex: Expense, $options: "i" };
    if (PaymentMethode)
      filter.PaymentMethode = { $regex: PaymentMethode, $options: "i" };
    if (keyword) {
      filter.$or = [
        { PartyName: { $regex: keyword, $options: "i" } },
        { User: { $regex: keyword, $options: "i" } },
        { Expense: { $regex: keyword, $options: "i" } },
      ];
    }

    let query = ExpenseMarketing.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(Number(limit));

    const result = await query;
    res.status(200).json(result);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Get by ID
export const getExpenseMarketingById = async (req, res, next) => {
  try {
    const entry = await ExpenseMarketing.findById(req.params.id);
    if (!entry) return next(new ApiError(404, "Expense record not found"));
    res.status(200).json(entry);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Create new entry
export const createExpenseMarketing = async (req, res, next) => {
  try {
    const {
      Date,
      PartyName,
      User,
      Expense,
      Amount,
      DueAmount,
      PaymentMethode,
      Status,
    } = req.body;

    const newEntry = new ExpenseMarketing({
      Date,
      PartyName,
      User,
      Expense,
      Amount,
      DueAmount,
      PaymentMethode,
      Status,
    });

    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// ✅ Update entry
export const updateExpenseMarketing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await ExpenseMarketing.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) return next(new ApiError(404, "Expense record not found"));
    res.status(200).json(updated);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// ✅ Delete entry
export const deleteExpenseMarketing = async (req, res, next) => {
  try {
    const deleted = await ExpenseMarketing.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ApiError(404, "Expense record not found"));
    res.status(200).json({ message: "Expense record deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
