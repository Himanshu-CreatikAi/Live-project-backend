import ContactType from "../models/model.contacttype.js";
import ApiError from "../utils/ApiError.js";

export const getContactType = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = ContactType.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const contactType = await query;

    res.status(200).json(contactType);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getContactTypeById = async (req, res, next) => {
  try {
    const contactType = await ContactType.findById(req.params.id);
    if (!contactType) {
      return next(new ApiError(404, "ContactType not found"));
    }
    res.status(200).json(contactType);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createContactType = async (req, res, next) => {
  try {
    const { Campaign, Name, Status } = req.body;
    const contactType = new ContactType({
      Campaign,
      Name,
      Status,
    });
    const savedContactType = await contactType.save();
    res.status(201).json(savedContactType);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateContactType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedContactType = await ContactType.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedContactType) {
      return next(new ApiError(404, "ContactType not found"));
    }
    res.status(200).json(updatedContactType);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteContactType = async (req, res, next) => {
  try {
    const deletedContactType = await ContactType.findByIdAndDelete(
      req.params.id
    );
    if (!deletedContactType) {
      return next(new ApiError(404, "ContactType not found"));
    }
    res.status(200).json({ message: "ContactType deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
