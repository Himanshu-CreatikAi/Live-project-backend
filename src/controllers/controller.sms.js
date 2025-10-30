import Sms from "../models/model.sms.js";
import ApiError from "../utils/ApiError.js";

export const getSms = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Sms.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const sms = await query;

    res.status(200).json(sms);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getSmsById = async (req, res, next) => {
  try {
    const sms = await Sms.findById(req.params.id);
    if (!sms) {
      return next(new ApiError(404, "Sms not found"));
    }
    res.status(200).json(sms);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createSms = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const sms = new Sms({
      Name,
      Status,
    });
    const savedSms = await sms.save();
    res.status(201).json(savedSms);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateSms = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedSms = await Sms.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedSms) {
      return next(new ApiError(404, "Sms not found"));
    }
    res.status(200).json(updatedSms);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteSms = async (req, res, next) => {
  try {
    const deletedSms = await Sms.findByIdAndDelete(req.params.id);
    if (!deletedSms) {
      return next(new ApiError(404, "Sms not found"));
    }
    res.status(200).json({ message: "Sms deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
