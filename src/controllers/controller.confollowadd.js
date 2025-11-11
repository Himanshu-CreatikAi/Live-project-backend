import ConFollowup from "../models/model.conFollowAdd.js";
import Contact from "../models/model.contact.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

// ✅ Create follow-up linked to a contact
export const createConFollowup = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { StartDate, StatusType, FollowupNextDate, Description } = req.body;

    // Verify customer exists
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return next(new ApiError(404, "Contact not found"));
    }

    const newFollowup = await ConFollowup.create({
      contact: contact._id,
      StartDate,
      StatusType,
      FollowupNextDate,
      Description,
    });

    res.status(201).json({
      success: true,
      message: "Follow-up created successfully",
      data: newFollowup,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Get all contact follow-ups with pagination and filters
// ✅ Get all contact follow-ups with pagination and full AssignTo details
export const getConFollowups = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      keyword = "",
      status,
      campaign,
      contactType,
      propertyType,
      city,
      location,
      user,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const perPage = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * perPage;

    // ✅ Follow-up filters
    const followupFilters = {};
    if (status) followupFilters.StatusType = status;

    // ✅ Contact filters
    const contactFilters = {};
    if (campaign)
      contactFilters["contact.Campaign"] = { $regex: campaign, $options: "i" };
    if (contactType)
      contactFilters["contact.ContactType"] = {
        $regex: contactType,
        $options: "i",
      };
    if (propertyType)
      contactFilters["contact.ContactIndustry"] = {
        $regex: propertyType,
        $options: "i",
      };
    if (city) contactFilters["contact.City"] = { $regex: city, $options: "i" };
    if (location)
      contactFilters["contact.Location"] = { $regex: location, $options: "i" };
    if (user) contactFilters["contact.User"] = { $regex: user, $options: "i" };

    // ✅ Keyword search
    const keywordRegex = keyword ? { $regex: keyword, $options: "i" } : null;
    const keywordMatch = keyword
      ? {
          $or: [
            { "contact.Name": keywordRegex },
            { "contact.Email": keywordRegex },
            { "contact.CompanyName": keywordRegex },
            { "contact.City": keywordRegex },
            { "contact.Location": keywordRegex },
          ],
        }
      : null;

    // ✅ Aggregation pipeline
    const pipeline = [];

    // Follow-up filters
    if (Object.keys(followupFilters).length)
      pipeline.push({ $match: followupFilters });

    // ✅ Lookup contact data with nested AssignTo admin details
    pipeline.push({
      $lookup: {
        from: "contacts",
        localField: "contact",
        foreignField: "_id",
        as: "contact",
        pipeline: [
          {
            $lookup: {
              from: "admins",
              localField: "AssignTo",
              foreignField: "_id",
              as: "AssignTo",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    role: 1,
                    city: 1,
                    status: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$AssignTo",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    });

    pipeline.push({
      $unwind: { path: "$contact", preserveNullAndEmptyArrays: false },
    });

    // ✅ Apply contact and keyword filters
    const combinedMatch = {
      ...(Object.keys(contactFilters).length ? contactFilters : {}),
      ...(keywordMatch ? keywordMatch : {}),
    };
    if (Object.keys(combinedMatch).length)
      pipeline.push({ $match: combinedMatch });

    // ✅ Sort & paginate
    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: perPage }],
      },
    });

    const aggResult = await ConFollowup.aggregate(pipeline);

    const metadata = aggResult[0]?.metadata?.[0] || { total: 0 };
    const total = metadata.total || 0;
    const data = aggResult[0]?.data || [];

    res.status(200).json({
      success: true,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / perPage),
      data,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Get all follow-ups for a specific contact
export const getConFollowupByContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return next(new ApiError(400, "Invalid contact ID"));
    }

    const followups = await ConFollowup.find({ contact: contactId })
      .populate("contact")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: followups.length,
      data: followups,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Get single contact follow-up by ID
export const getConFollowupById = async (req, res, next) => {
  try {
    const followup = await ConFollowup.findById(req.params.id);

    if (!followup)
      return next(new ApiError(404, "Contact Follow-up not found"));

    res.status(200).json({
      success: true,
      data: followup,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Update contact follow-up by ID
export const updateConFollowup = async (req, res, next) => {
  try {
    const updates = req.body;

    const updated = await ConFollowup.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) return next(new ApiError(404, "Contact Follow-up not found"));

    res.status(200).json({
      success: true,
      message: "Contact Follow-up updated successfully",
      data: updated,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Delete contact follow-up by ID
export const deleteConFollowup = async (req, res, next) => {
  try {
    const deleted = await ConFollowup.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ApiError(404, "Contact Follow-up not found"));

    res.status(200).json({
      success: true,
      message: "Contact Follow-up deleted successfully",
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Delete all contact follow-ups
export const deleteAllConFollowups = async (req, res, next) => {
  try {
    await ConFollowup.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All Contact Follow-ups deleted successfully",
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
