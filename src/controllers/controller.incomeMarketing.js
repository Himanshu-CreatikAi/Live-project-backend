import IncomeMarketing from "../models/model.incomeMarketing.js";
import ApiError from "../utils/ApiError.js";

// ✅ Get all income marketing entries with filters
export const getIncomeMarketing = async (req, res, next) => {
  try {
    const { User, Income, PaymentMethode, keyword, limit } = req.query;

    const filter = {};

    if (User) filter.User = { $regex: User, $options: "i" };
    if (Income) filter.Income = { $regex: Income, $options: "i" };
    if (PaymentMethode)
      filter.PaymentMethode = { $regex: PaymentMethode, $options: "i" };
    if (keyword) {
      filter.$or = [
        { PartyName: { $regex: keyword, $options: "i" } },
        { User: { $regex: keyword, $options: "i" } },
        { Income: { $regex: keyword, $options: "i" } },
      ];
    }

    let query = IncomeMarketing.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(Number(limit));

    const result = await query;
    res.status(200).json(result);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Get by ID
export const getIncomeMarketingById = async (req, res, next) => {
  try {
    const entry = await IncomeMarketing.findById(req.params.id);
    if (!entry) return next(new ApiError(404, "Income record not found"));
    res.status(200).json(entry);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Create new entry
export const createIncomeMarketing = async (req, res, next) => {
  try {
    const {
      Date,
      PartyName,
      User,
      Income,
      Amount,
      DueAmount,
      PaymentMethode,
      Status,
    } = req.body;

    const newEntry = new IncomeMarketing({
      Date,
      PartyName,
      User,
      Income,
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
export const updateIncomeMarketing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await IncomeMarketing.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) return next(new ApiError(404, "Income record not found"));
    res.status(200).json(updated);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// ✅ Delete entry
export const deleteIncomeMarketing = async (req, res, next) => {
  try {
    const deleted = await IncomeMarketing.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ApiError(404, "Income record not found"));
    res.status(200).json({ message: "Income record deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
