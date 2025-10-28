import ConFollowAdd from "../models/model.conFollowAdd.js";
import Contact from "../models/model.contact.js";
import ApiError from "../utils/ApiError.js";

// ✅ Create follow-up linked to a contact
export const createConFollowAdd = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { StartDate, StatusType, FollowupNextDate, Description } = req.body;

    // Verify contact exists
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return next(new ApiError(404, "Contact not found"));
    }

    const newConFollowAdd = await ConFollowAdd.create({
      contact: contact._id,
      StartDate,
      StatusType,
      FollowupNextDate,
      Description,
    });

    res.status(201).json({
      success: true,
      message: "Contact follow-up created successfully",
      data: newConFollowAdd,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Get all contact follow-ups with pagination and contact data
export const getConFollowAdd = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      campaign,
      contactType,
      propertyType,
      status,
      city,
      location,
      user,
      keyword = "",
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // 🧩 Filter by followup status
    if (status) query.StatusType = status;

    // 🧩 Populate & filter Contact fields
    const confollowadds = await ConFollowAdd.find(query)
      .populate({
        path: "contact",
        match: {
          $and: [
            campaign ? { Campaign: { $regex: campaign, $options: "i" } } : {},
            contactType
              ? { ContactType: { $regex: contactType, $options: "i" } }
              : {},
            propertyType
              ? { ContactIndustry: { $regex: propertyType, $options: "i" } }
              : {},
            city ? { City: { $regex: city, $options: "i" } } : {},
            location ? { Location: { $regex: location, $options: "i" } } : {},
            user ? { AssignTo: { $regex: user, $options: "i" } } : {},
            keyword
              ? {
                  $or: [
                    { Name: { $regex: keyword, $options: "i" } },
                    { ContactNo: { $regex: keyword, $options: "i" } },
                    { Email: { $regex: keyword, $options: "i" } },
                    { CompanyName: { $regex: keyword, $options: "i" } },
                  ],
                }
              : {},
          ],
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // 🧩 Filter out results where no contact matched
    const filteredFollowups = confollowadds.filter((f) => f.contact);

    // 🧩 Count total documents for pagination
    const total = filteredFollowups.length;

    res.status(200).json({
      success: true,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      data: filteredFollowups,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Get contact follow-ups by specific contact
export const getConFollowAddByContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const confollowadds = await ConFollowAdd.find({ contact: contactId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      total: confollowadds.length,
      data: confollowadds,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Update a specific contact follow-up
export const updateConFollowAdd = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedConFollowAdd = await ConFollowAdd.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedConFollowAdd) {
      return next(new ApiError(404, "Contact Follow-up not found"));
    }
    res.status(200).json({
      success: true,
      message: "Contact follow-up updated successfully",
      data: updatedConFollowAdd,
    });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// ✅ Delete specific contact follow-up
export const deleteConFollowAdd = async (req, res, next) => {
  try {
    const deletedConFollowAdd = await ConFollowAdd.findByIdAndDelete(
      req.params.id
    );
    if (!deletedConFollowAdd) {
      return next(new ApiError(404, "Contact Follow-up not found"));
    }
    res.status(200).json({
      success: true,
      message: "Contact follow-up deleted successfully",
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Delete all contact follow-ups
export const deleteAllConFollowAdd = async (req, res, next) => {
  try {
    await ConFollowAdd.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All contact follow-ups deleted successfully",
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
