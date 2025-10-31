import Industry from "../models/model.industries.js";
import ApiError from "../utils/ApiError.js";

export const getIndustry = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Industry.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const industry = await query;

    res.status(200).json(industry);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getIndustryById = async (req, res, next) => {
  try {
    const industry = await Industry.findById(req.params.id);
    if (!industry) {
      return next(new ApiError(404, "Industry not found"));
    }
    res.status(200).json(industry);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createIndustry = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const industry = new Industry({
      Name,
      Status,
    });
    const savedIndustry = await industry.save();
    res.status(201).json(savedIndustry);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateIndustry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedIndustry = await Industry.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedIndustry) {
      return next(new ApiError(404, "Industry not found"));
    }
    res.status(200).json(updatedIndustry);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteIndustry = async (req, res, next) => {
  try {
    const deletedIndustry = await Industry.findByIdAndDelete(req.params.id);
    if (!deletedIndustry) {
      return next(new ApiError(404, "Industry not found"));
    }
    res.status(200).json({ message: "Industry deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
