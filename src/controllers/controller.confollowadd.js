import ConFollowAdd from "../models/model.conFollowAdd.js";
import ApiError from "../utils/ApiError.js";

export const getConFollowAdd = async (req, res, next) => {
  try {
    const confollowadd = await ConFollowAdd.find().sort({
      createdAt: -1,
    });
    res.status(200).json(confollowadd);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getConFollowAddById = async (req, res, next) => {
  try {
    const confollowadd = await ConFollowAdd.findById(req.params.id);
    if (!confollowadd) {
      return next(new ApiError(404, "Contact Followup add not found"));
    }
    res.status(200).json(confollowadd);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createConFollowAdd = async (req, res, next) => {
  try {
    const { StartDate, StatusType, FollowupNextDate, Description } = req.body;
    const confollowadd = new ConFollowAdd({
      StartDate,
      StatusType,
      FollowupNextDate,
      Description,
    });
    const savedConFollowAdd = await confollowadd.save();
    res.status(201).json(savedConFollowAdd);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateConFollowAdd = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedConFollowAdd = await ConFollowAdd.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedConFollowAdd) {
      return next(new ApiError(404, "Contact Followup add not found"));
    }
    res.status(200).json(updatedConFollowAdd);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteConFollowAdd = async (req, res, next) => {
  try {
    const deletedConFollowAdd = await ConFollowAdd.findByIdAndDelete(
      req.params.id
    );
    if (!deletedConFollowAdd) {
      return next(new ApiError(404, "Contact Followup add not found"));
    }
    res
      .status(200)
      .json({ message: "Contact Followup add deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
