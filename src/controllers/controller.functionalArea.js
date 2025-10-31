import FunctionalArea from "../models/model.functionalArea.js";
import ApiError from "../utils/ApiError.js";

export const getFunctionalArea = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = FunctionalArea.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const functionalArea = await query;

    res.status(200).json(functionalArea);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getFunctionalAreaById = async (req, res, next) => {
  try {
    const functionalArea = await FunctionalArea.findById(req.params.id);
    if (!functionalArea) {
      return next(new ApiError(404, "City not found"));
    }
    res.status(200).json(functionalArea);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createFunctionalArea = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const functionalArea = new FunctionalArea({
      Name,
      Status,
    });
    const savedFunctionalArea = await functionalArea.save();
    res.status(201).json(savedFunctionalArea);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateFunctionalArea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedFunctionalArea = await FunctionalArea.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedFunctionalArea) {
      return next(new ApiError(404, "Functional Area not found"));
    }
    res.status(200).json(updatedFunctionalArea);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteFunctionalArea = async (req, res, next) => {
  try {
    const deletedFunctionalArea = await FunctionalArea.findByIdAndDelete(
      req.params.id
    );
    if (!deletedFunctionalArea) {
      return next(new ApiError(404, "Functional Area not found"));
    }
    res.status(200).json({ message: "Functional Area deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
