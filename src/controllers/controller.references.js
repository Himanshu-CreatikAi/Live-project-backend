import Reference from "../models/model.references.js";
import ApiError from "../utils/ApiError.js";

export const getReference = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Reference.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const reference = await query;

    res.status(200).json(reference);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getReferenceById = async (req, res, next) => {
  try {
    const reference = await Reference.findById(req.params.id);
    if (!reference) {
      return next(new ApiError(404, "Reference not found"));
    }
    res.status(200).json(reference);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createReference = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const reference = new Reference({
      Name,
      Status,
    });
    const savedReference = await reference.save();
    res.status(201).json(savedReference);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateReference = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedReference = await Reference.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedReference) {
      return next(new ApiError(404, "Reference not found"));
    }
    res.status(200).json(updatedReference);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteReference = async (req, res, next) => {
  try {
    const deletedReference = await Reference.findByIdAndDelete(req.params.id);
    if (!deletedReference) {
      return next(new ApiError(404, "Reference not found"));
    }
    res.status(200).json({ message: "Reference deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
