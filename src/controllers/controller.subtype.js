import SubType from "../models/model.subType.js";
import ApiError from "../utils/ApiError.js";

export const getSubType = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.$or = [
        { Name: { $regex: keyword.trim(), $options: "i" } },
        { CustomerType: { $regex: keyword.trim(), $options: "i" } },
        { Campaign: { $regex: keyword.trim(), $options: "i" } },
      ];
    }

    let query = SubType.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const subtype = await query;

    res.status(200).json(subtype);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getSubTypeById = async (req, res, next) => {
  try {
    const subtype = await SubType.findById(req.params.id);
    if (!subtype) {
      return next(new ApiError(404, "Customer Sub Type not found"));
    }
    res.status(200).json(subtype);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createSubType = async (req, res, next) => {
  try {
    const { Campaign, CustomerType, Name, Status } = req.body;
    const subtype = new SubType({
      Campaign,
      CustomerType,
      Name,
      Status,
    });
    const savedSubType = await subtype.save();
    res.status(201).json(savedSubType);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateSubType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedSubType = await SubType.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedSubType) {
      return next(new ApiError(404, "Customer Sub Type not found"));
    }
    res.status(200).json(updatedSubType);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteSubType = async (req, res, next) => {
  try {
    const deletedSubType = await SubType.deleteMany({});
    if (deletedSubType.deletedCount === 0) {
      return next(new ApiError(404, "No Customer Sub Types found to delete"));
    }
    res
      .status(200)
      .json({ message: "All Customer Sub Types deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const deleteSubTypebyId = async (req, res, next) => {
  try {
    const deletedSubType = await SubType.findByIdAndDelete(req.params.id);
    if (!deletedSubType) {
      return next(new ApiError(404, "Customer Sub Type not found"));
    }
    res.status(200).json({ message: "Customer Sub Type deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
