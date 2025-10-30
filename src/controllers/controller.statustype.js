import Statustype from "../models/model.statustype.js";
import ApiError from "../utils/ApiError.js";

export const getStatustype = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Statustype.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const statustype = await query;

    res.status(200).json(statustype);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getStatustypeById = async (req, res, next) => {
  try {
    const statustype = await Statustype.findById(req.params.id);
    if (!statustype) {
      return next(new ApiError(404, "Statustype not found"));
    }
    res.status(200).json(statustype);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createStatustype = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const statustype = new Statustype({
      Name,
      Status,
    });
    const savedStatustype = await statustype.save();
    res.status(201).json(savedStatustype);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateStatustype = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedStatustype = await Statustype.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedStatustype) {
      return next(new ApiError(404, "Statustype not found"));
    }
    res.status(200).json(updatedStatustype);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteStatustype = async (req, res, next) => {
  try {
    const deletedStatustype = await Statustype.findByIdAndDelete(req.params.id);
    if (!deletedStatustype) {
      return next(new ApiError(404, "Statustype not found"));
    }
    res.status(200).json({ message: "Statustype deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
