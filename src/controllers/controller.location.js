import Location from "../models/model.location.js";
import ApiError from "../utils/ApiError.js";

export const getLocation = async (req, res, next) => {
  try {
    const { keyword, limit, city } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    if (city) {
      filter.City = { $regex: city, $options: "i" };
    }

    let query = Location.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const location = await query;

    res.status(200).json(location);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getLocationById = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return next(new ApiError(404, "Location not found"));
    }
    res.status(200).json(location);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const { Name, Status, City } = req.body;
    const location = new Location({
      Name,
      Status,
      City,
    });
    const savedLocation = await location.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedLocation = await Location.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedLocation) {
      return next(new ApiError(404, "Location not found"));
    }
    res.status(200).json(updatedLocation);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const deletedLocation = await Location.findByIdAndDelete(req.params.id);
    if (!deletedLocation) {
      return next(new ApiError(404, "Location not found"));
    }
    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
