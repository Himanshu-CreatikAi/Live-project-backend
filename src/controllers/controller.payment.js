import Payment from "../models/model.paymentmethods.js";
import ApiError from "../utils/ApiError.js";

export const getPayment = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Payment.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const payment = await query;

    res.status(200).json(payment);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return next(new ApiError(404, "Payment not found"));
    }
    res.status(200).json(payment);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const payment = new Payment({
      Name,
      Status,
    });
    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedPayment = await Payment.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedPayment) {
      return next(new ApiError(404, "Payment not found"));
    }
    res.status(200).json(updatedPayment);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deletePayment = async (req, res, next) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) {
      return next(new ApiError(404, "Payment not found"));
    }
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
