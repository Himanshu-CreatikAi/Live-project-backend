import Type from "../models/model.types.js";
import ApiError from "../utils/ApiError.js";

// ✅ Get all types (optionally filtered by Campaign or keyword)
export const getType = async (req, res, next) => {
  try {
    const { keyword, limit, campaignId } = req.query;
    const filter = {};

    // Filter by campaign (for dynamic dropdowns)
    if (campaignId) {
      filter.Campaign = campaignId;
    }

    // Keyword-based search
    if (keyword) {
      filter.$or = [{ Name: { $regex: keyword.trim(), $options: "i" } }];
    }

    let query = Type.find(filter)
      .populate("Campaign", "Name") // show campaign name
      .sort({ createdAt: -1 });

    if (limit) query = query.limit(Number(limit));

    const types = await query;
    res.status(200).json(types);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Get Type by ID
export const getTypeById = async (req, res, next) => {
  try {
    const type = await Type.findById(req.params.id).populate(
      "Campaign",
      "Name"
    );
    if (!type) return next(new ApiError(404, "Type not found"));
    res.status(200).json(type);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Create Type
export const createType = async (req, res, next) => {
  try {
    const { Campaign, Name, Status } = req.body;

    if (!Campaign) return next(new ApiError(400, "Campaign ID is required"));
    if (!Name) return next(new ApiError(400, "Type name is required"));

    const type = new Type({ Campaign, Name, Status });
    const savedType = await type.save();

    res.status(201).json(savedType);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// ✅ Update Type
export const updateType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedType = await Type.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedType) return next(new ApiError(404, "Type not found"));
    res.status(200).json(updatedType);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// ✅ Delete all types
export const deleteType = async (req, res, next) => {
  try {
    const deletedType = await Type.deleteMany({});
    if (deletedType.deletedCount === 0)
      return next(new ApiError(404, "No Types found to delete"));
    res.status(200).json({ message: "All Types deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Delete Type by ID
export const deleteTypebyId = async (req, res, next) => {
  try {
    const deletedType = await Type.findByIdAndDelete(req.params.id);
    if (!deletedType) return next(new ApiError(404, "Type not found"));
    res.status(200).json({ message: "Type deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
