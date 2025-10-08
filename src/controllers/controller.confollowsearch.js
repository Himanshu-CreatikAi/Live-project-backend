import ConFollowSearch from "../models/model.conFollowSearch.js";
import ApiError from "../utils/ApiError.js";

export const getConFollowSearch = async (req, res, next) => {
  try {
    const confollowsearch = await ConFollowSearch.find().sort({
      createdAt: -1,
    });
    res.status(200).json(confollowsearch);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getConFollowSearchById = async (req, res, next) => {
  try {
    const confollowsearch = await ConFollowSearch.findById(req.params.id);
    if (!confollowsearch) {
      return next(new ApiError(404, "Contact Followup search not found"));
    }
    res.status(200).json(confollowsearch);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createConFollowSearch = async (req, res, next) => {
  try {
    const {
      Campaign,
      ContactType,
      PropertyType,
      StatusType,
      City,
      Location,
      User,
      Keyword,
      Limit,
    } = req.body;
    const confollowsearch = new ConFollowSearch({
      Campaign,
      ContactType,
      PropertyType,
      StatusType,
      City,
      Location,
      User,
      Keyword,
      Limit,
    });
    const savedConFollowSearch = await confollowsearch.save();
    res.status(201).json(savedConFollowSearch);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateConFollowSearch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedConFollowSearch = await ConFollowSearch.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedConFollowSearch) {
      return next(new ApiError(404, "Contact Followup search not found"));
    }
    res.status(200).json(updatedConFollowSearch);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteConFollowSearch = async (req, res, next) => {
  try {
    const deletedConFollowSearch = await ConFollowSearch.findByIdAndDelete(
      req.params.id
    );
    if (!deletedConFollowSearch) {
      return next(new ApiError(404, "Contact Followup search not found"));
    }
    res
      .status(200)
      .json({ message: "Contact Followup search deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
