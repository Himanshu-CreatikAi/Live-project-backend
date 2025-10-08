import ContactAdv from "../models/model.contactAdv.js";
import contactAdv from "../models/model.contactAdv.js";
import ApiError from "../utils/ApiError.js";

export const getContactAdv = async (req, res, next) => {
  try {
    const contactAdv = await ContactAdv.find().sort({ createdAt: -1 });
    res.status(200).json(contactAdv);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getContactAdvById = async (req, res, next) => {
  try {
    const contactAdv = await ContactAdv.findById(req.params.id);
    if (!contactAdv) {
      return next(new ApiError(404, "Contact Advance search not found"));
    }
    res.status(200).json(contactAdv);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createContactAdv = async (req, res, next) => {
  try {
    const {
      StatusAssign,
      Campaign,
      ContactType,
      City,
      Location,
      User,
      Keyword,
      Limit,
    } = req.body;
    const contactAdv = new ContactAdv({
      StatusAssign,
      Campaign,
      ContactType,
      City,
      Location,
      User,
      Keyword,
      Limit,
    });
    const savedContactAdv = await contactAdv.save();
    res.status(201).json(savedContactAdv);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateContactAdv = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedContactAdv = await ContactAdv.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedContactAdv) {
      return next(new ApiError(404, "Contact Advance search not found"));
    }
    res.status(200).json(updatedContactAdv);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteContactAdv = async (req, res, next) => {
  try {
    const deletedContactAdv = await ContactAdv.findByIdAndDelete(req.params.id);
    if (!deletedContactAdv) {
      return next(new ApiError(404, "Contact Advance search not found"));
    }
    res
      .status(200)
      .json({ message: "Contact Advance search deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
