import ComProEnq from "../models/model.comproenq.js";
import ApiError from "../utils/ApiError.js";

export const getComProEnq = async (req, res, next) => {
  try {
    const comproenq = await ComProEnq.find().sort({
      createdAt: -1,
    });
    res.status(200).json(comproenq);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getComProEnqById = async (req, res, next) => {
  try {
    const comproenq = await ComProEnq.findById(req.params.id);
    if (!comproenq) {
      return next(new ApiError(404, "Company project enquiry not found"));
    }
    res.status(200).json(comproenq);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createComProEnq = async (req, res, next) => {
  try {
    const { UserName, ProjrctName, Description, date } = req.body;
    const comproenq = new ComProEnq({
      UserName,
      ProjrctName,
      Description,
      date,
    });
    const savedComProEnq = await comproenq.save();
    res.status(201).json(savedComProEnq);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateComProEnq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedComProEnq = await ComProEnq.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedComProEnq) {
      return next(new ApiError(404, "Company Project Enquiry not found"));
    }
    res.status(200).json(updatedComProEnq);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteComProEnq = async (req, res, next) => {
  try {
    const deletedComProEnq = await ComProEnq.findByIdAndDelete(req.params.id);
    if (!deletedComProEnq) {
      return next(new ApiError(404, "Company Project Enquiry not found"));
    }
    res
      .status(200)
      .json({ message: "Company Project Enquiry deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
