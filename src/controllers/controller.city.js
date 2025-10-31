import City from "../models/model.city.js";
import ApiError from "../utils/ApiError.js";

export const getCity = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = City.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const city = await query;

    res.status(200).json(city);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getCityById = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return next(new ApiError(404, "City not found"));
    }
    res.status(200).json(city);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createCity = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const city = new City({
      Name,
      Status,
    });
    const savedCity = await city.save();
    res.status(201).json(savedCity);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedCity = await City.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedCity) {
      return next(new ApiError(404, "City not found"));
    }
    res.status(200).json(updatedCity);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteCity = async (req, res, next) => {
  try {
    const deletedCity = await City.findByIdAndDelete(req.params.id);
    if (!deletedCity) {
      return next(new ApiError(404, "City not found"));
    }
    res.status(200).json({ message: "City deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
