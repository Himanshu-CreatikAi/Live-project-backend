import Campaign from "../models/model.campaign.js";
import ApiError from "../utils/ApiError.js";

export const getCampaign = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Campaign.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const campaign = await query;

    res.status(200).json(campaign);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return next(new ApiError(404, "Campaign not found"));
    }
    res.status(200).json(campaign);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const campaign = new Campaign({
      Name,
      Status,
    });
    const savedCampaign = await campaign.save();
    res.status(201).json(savedCampaign);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedCampaign = await Campaign.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedCampaign) {
      return next(new ApiError(404, "Campaign not found"));
    }
    res.status(200).json(updatedCampaign);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    const deletedCampaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!deletedCampaign) {
      return next(new ApiError(404, "Campaign not found"));
    }
    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
