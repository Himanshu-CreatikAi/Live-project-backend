import Facility from "../models/model.facilities.js";
import ApiError from "../utils/ApiError.js";

export const getFacility = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Facility.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const facility = await query;

    res.status(200).json(facility);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getFacilityById = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return next(new ApiError(404, "Facility not found"));
    }
    res.status(200).json(facility);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createFacility = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const facility = new Facility({
      Name,
      Status,
    });
    const savedFacility = await facility.save();
    res.status(201).json(savedFacility);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateFacility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedFacility = await Facility.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedFacility) {
      return next(new ApiError(404, "Facility not found"));
    }
    res.status(200).json(updatedFacility);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteFacility = async (req, res, next) => {
  try {
    const deletedFacility = await Facility.findByIdAndDelete(req.params.id);
    if (!deletedFacility) {
      return next(new ApiError(404, "Facility not found"));
    }
    res.status(200).json({ message: "Facility deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
