import ConFollowups from "../models/model.conFollowup.js";
import ApiError from "../utils/ApiError.js";

export const getConFollowup = async (req, res, next) => {
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
      sort,
    } = req.query;

    const filter = {};

    // Apply filters (match schema field names exactly)
    if (Campaign) {
      filter.Campaign = { $regex: Campaign.trim(), $options: "i" };
    }

    if (ContactType) {
      filter.ContactType = { $regex: ContactType.trim(), $options: "i" };
    }

    if (PropertyType) {
      filter.ContactIndustry = { $regex: PropertyType.trim(), $options: "i" };
    }

    if (StatusType) {
      filter.Status = { $regex: StatusType.trim(), $options: "i" };
    }

    if (City) {
      filter.City = { $regex: City.trim(), $options: "i" };
    }

    if (Location) {
      filter.Location = { $regex: Location.trim(), $options: "i" };
    }

    if (User) {
      filter.User = { $regex: User.trim(), $options: "i" };
    }

    if (Keyword) {
      // Keyword search across multiple text fields
      filter.$or = [
        { Name: { $regex: Keyword.trim(), $options: "i" } },
        { CompanyName: { $regex: Keyword.trim(), $options: "i" } },
        { Notes: { $regex: Keyword.trim(), $options: "i" } },
        { Email: { $regex: Keyword.trim(), $options: "i" } },
      ];
    }

    // Sorting logic
    let sortOrder = -1; // default: latest first
    let sortField = "createdAt";

    if (sort) {
      if (sort.toLowerCase() === "asc") {
        sortOrder = 1;
      } else if (sort.toLowerCase() === "desc") {
        sortOrder = -1;
      }
      sortField = "Name"; // alphabetical by Name if sort provided
    }

    // Build query
    let query = ConFollowups.find(filter).sort({ [sortField]: sortOrder });

    if (Limit) {
      query = query.limit(Number(Limit));
    }

    const confollowups = await query;

    res.status(200).json(confollowups);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getConFollowupById = async (req, res, next) => {
  try {
    const confollowup = await ConFollowups.findById(req.params.id);
    if (!confollowup) {
      return next(new ApiError(404, "Contact Followup not found"));
    }
    res.status(200).json(confollowup);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createConFollowup = async (req, res, next) => {
  try {
    const {
      Campaign,
      Range,
      ContactNo,
      Location,
      ContactType,
      Name,
      City,
      Address,
      ContactIndustry,
      ContactFunctionalArea,
      ReferenceId,
      Notes,
      Facilities,
      User,
      date,
      Email,
      CompanyName,
      Website,
      Status,
    } = req.body;
    const confollowup = new ConFollowups({
      Campaign,
      Range,
      ContactNo,
      Location,
      ContactType,
      Name,
      City,
      Address,
      ContactIndustry,
      ContactFunctionalArea,
      ReferenceId,
      Notes,
      Facilities,
      User,
      date,
      Email,
      CompanyName,
      Website,
      Status,
    });
    const savedConFollowup = await confollowup.save();
    res.status(201).json(savedConFollowup);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateConFollowup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedConFollowup = await ConFollowups.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedConFollowup) {
      return next(new ApiError(404, "Contact Followup not found"));
    }
    res.status(200).json(updatedConFollowup);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteConFollowup = async (req, res, next) => {
  try {
    const deletedConFollowup = await ConFollowups.deleteMany({}); // Delete all documents

    if (deletedConFollowup.deletedCount === 0) {
      return next(new ApiError(404, "No Contact Followups found to delete"));
    }

    res
      .status(200)
      .json({ message: "All Contact Followups deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const deleteConFollowupbyId = async (req, res, next) => {
  try {
    const deletedConFollowup = await ConFollowups.findByIdAndDelete(
      req.params.id
    );
    if (!deletedConFollowup) {
      return next(new ApiError(404, "Contact Followup not found"));
    }
    res.status(200).json({ message: "Contact Followup deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
