import ContactCampaign from "../models/model.contactcampaign.js";
import ApiError from "../utils/ApiError.js";

export const getContactCampaign = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = ContactCampaign.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const contactCampaign = await query;

    res.status(200).json(contactCampaign);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getContactCampaignById = async (req, res, next) => {
  try {
    const contactCampaign = await ContactCampaign.findById(req.params.id);
    if (!contactCampaign) {
      return next(new ApiError(404, "Contact Campaign not found"));
    }
    res.status(200).json(contactCampaign);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createContactCampaign = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const contactCampaign = new ContactCampaign({
      Name,
      Status,
    });
    const savedContactCampaign = await contactCampaign.save();
    res.status(201).json(savedContactCampaign);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateContactCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedContactCampaign = await ContactCampaign.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedContactCampaign) {
      return next(new ApiError(404, "Contact Campaign not found"));
    }
    res.status(200).json(updatedContactCampaign);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteContactCampaign = async (req, res, next) => {
  try {
    const deletedContactCampaign = await ContactCampaign.findByIdAndDelete(
      req.params.id
    );
    if (!deletedContactCampaign) {
      return next(new ApiError(404, "Contact Campaign not found"));
    }
    res.status(200).json({ message: "Contact Campaign deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
