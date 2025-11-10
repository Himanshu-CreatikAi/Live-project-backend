import SubType from "../models/model.subType.js";
import ApiError from "../utils/ApiError.js";

// ✅ Get SubTypes (optionally filter by Campaign or Type)
export const getSubType = async (req, res, next) => {
  try {
    const { keyword, limit, campaignId, typeId } = req.query;

    const filter = {};

    // Filter by Campaign
    if (campaignId) {
      filter.Campaign = campaignId;
    }

    // Filter by Type (CustomerType)
    if (typeId) {
      filter.CustomerType = typeId;
    }

    // Keyword search
    if (keyword) {
      filter.$or = [{ Name: { $regex: keyword.trim(), $options: "i" } }];
    }

    let query = SubType.find(filter)
      .populate("Campaign", "Name")
      .populate("CustomerType", "Name")
      .sort({ createdAt: -1 });

    if (limit) query = query.limit(Number(limit));

    const subtypes = await query;
    res.status(200).json(subtypes);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Get SubType by ID
export const getSubTypeById = async (req, res, next) => {
  try {
    const subtype = await SubType.findById(req.params.id)
      .populate("Campaign", "Name")
      .populate("CustomerType", "Name");

    if (!subtype) {
      return next(new ApiError(404, "Customer Sub Type not found"));
    }
    res.status(200).json(subtype);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Create SubType
export const createSubType = async (req, res, next) => {
  try {
    const { Campaign, CustomerType, Name, Status } = req.body;

    if (!Campaign) return next(new ApiError(400, "Campaign ID is required"));
    if (!CustomerType)
      return next(new ApiError(400, "Customer Type ID is required"));
    if (!Name) return next(new ApiError(400, "Sub Type name is required"));

    const subtype = new SubType({ Campaign, CustomerType, Name, Status });
    const savedSubType = await subtype.save();
    res.status(201).json(savedSubType);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// ✅ Update SubType
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

// ✅ Delete all SubTypes
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

// ✅ Delete SubType by ID
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
