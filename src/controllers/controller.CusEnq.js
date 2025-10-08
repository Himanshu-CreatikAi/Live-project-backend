import CusEnq from "../models/model.cusEnq.js";
import ApiError from "../utils/ApiError.js";

export const getCusEnq = async (req, res, next) => {
  try {
    const cusenq = await CusEnq.find().sort({
      createdAt: -1,
    });
    res.status(200).json(cusenq);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getCusEnqById = async (req, res, next) => {
  try {
    const cusenq = await CusEnq.findById(req.params.id);
    if (!cusenq) {
      return next(new ApiError(404, "Customer enquiry not found"));
    }
    res.status(200).json(cusenq);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createCusEnq = async (req, res, next) => {
  try {
    const { UserName, PropertyName, Description, date } = req.body;
    const cusenq = new CusEnq({
      UserName,
      PropertyName,
      Description,
      date,
    });
    const savedCusEnq = await cusenq.save();
    res.status(201).json(savedCusEnq);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateCusEnq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedCusEnq = await CusEnq.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedCusEnq) {
      return next(new ApiError(404, "Customer Enquiry not found"));
    }
    res.status(200).json(updatedCusEnq);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteCusEnq = async (req, res, next) => {
  try {
    const deletedCusEnq = await CusEnq.findByIdAndDelete(req.params.id);
    if (!deletedCusEnq) {
      return next(new ApiError(404, "Customer Enquiry not found"));
    }
    res.status(200).json({ message: "Customer Enquiry deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
