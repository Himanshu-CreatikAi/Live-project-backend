import Amenity from "../models/model.amenities.js";
import ApiError from "../utils/ApiError.js";

export const getAmenity = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Amenity.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const amenity = await query;

    res.status(200).json(amenity);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getAmenityById = async (req, res, next) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    if (!amenity) {
      return next(new ApiError(404, "Amenity not found"));
    }
    res.status(200).json(amenity);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createAmenity = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const amenity = new Amenity({
      Name,
      Status,
    });
    const savedAmenity = await amenity.save();
    res.status(201).json(savedAmenity);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedAmenity = await Amenity.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedAmenity) {
      return next(new ApiError(404, "Amenity not found"));
    }
    res.status(200).json(updatedAmenity);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteAmenity = async (req, res, next) => {
  try {
    const deletedAmenity = await Amenity.findByIdAndDelete(req.params.id);
    if (!deletedAmenity) {
      return next(new ApiError(404, "Amenity not found"));
    }
    res.status(200).json({ message: "Amenity deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
