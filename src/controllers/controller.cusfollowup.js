import Followup from "../models/model.cusfollow.js";
import Customer from "../models/model.customer.js";
import ApiError from "../utils/ApiError.js";

// ✅ Create follow-up linked to a customer
export const createFollowup = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { StartDate, StatusType, FollowupNextDate, Description } = req.body;

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return next(new ApiError(404, "Customer not found"));
    }

    const newFollowup = await Followup.create({
      customer: customer._id,
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

// ✅ Get all follow-ups with pagination and customer data
export const getFollowups = async (req, res, next) => {
  try {
    // Accept query params
    const {
      page = 1,
      limit = 10,
      keyword = "",
      status,
      campaign,
      contactType, // maps to CustomerType
      propertyType, // maps to CustomerSubType
      city,
      location,
      user, // maps to ReferenceId (or change if you use AssignedTo)
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const perPage = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * perPage;

    // Build followup-level filters
    const followupFilters = {};
    if (status) followupFilters.StatusType = status;

    // Build customer-level filters (we'll apply after $lookup as "customer.<field>")
    const customerFilters = {};

    if (campaign)
      customerFilters["customer.Campaign"] = {
        $regex: campaign,
        $options: "i",
      };
    if (contactType)
      customerFilters["customer.CustomerType"] = {
        $regex: contactType,
        $options: "i",
      };
    if (propertyType)
      customerFilters["customer.CustomerSubType"] = {
        $regex: propertyType,
        $options: "i",
      };
    if (city)
      customerFilters["customer.City"] = { $regex: city, $options: "i" };
    if (location)
      customerFilters["customer.Location"] = {
        $regex: location,
        $options: "i",
      };
    if (user)
      customerFilters["customer.ReferenceId"] = { $regex: user, $options: "i" };

    // Keyword search over several customer fields
    const keywordRegex = keyword ? { $regex: keyword, $options: "i" } : null;
    const keywordMatch = keyword
      ? {
          $or: [
            { "customer.customerName": keywordRegex },
            { "customer.ContactNumber": keywordRegex },
            { "customer.Email": keywordRegex },
            { "customer.City": keywordRegex },
            { "customer.Location": keywordRegex },
          ],
        }
      : null;

    // Build aggregation pipeline
    const pipeline = [];

    // 1) Match followup-level filters (early filtering)
    if (Object.keys(followupFilters).length)
      pipeline.push({ $match: followupFilters });

    // 2) Lookup customer document
    pipeline.push({
      $lookup: {
        from: "customers", // collection name (lowercase plural)
        localField: "customer",
        foreignField: "_id",
        as: "customer",
      },
    });

    // 3) Unwind so we can filter on the customer subfields
    pipeline.push({
      $unwind: { path: "$customer", preserveNullAndEmptyArrays: false },
    });

    // 4) Apply customer-level filters and keyword if present
    const combinedCustomerAndKeywordMatch = {
      ...(Object.keys(customerFilters).length ? customerFilters : {}),
      ...(keywordMatch ? keywordMatch : {}),
    };
    if (Object.keys(combinedCustomerAndKeywordMatch).length) {
      pipeline.push({ $match: combinedCustomerAndKeywordMatch });
    }

    // 5) Sort (latest first)
    pipeline.push({ $sort: { createdAt: -1 } });

    // 6) Facet to get paginated data + total count in one go
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: perPage }],
      },
    });

    // Run aggregation
    const aggResult = await Followup.aggregate(pipeline);

    const metadata = aggResult[0]?.metadata?.[0] || { total: 0 };
    const total = metadata.total || 0;
    const data = aggResult[0]?.data || [];

    // Response with same structure as before
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

// ✅ Get follow-ups by specific customer
export const getFollowupByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const followups = await Followup.find({ customer: customerId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      total: followups.length,
      data: followups,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Delete specific follow-up
export const deleteFollowup = async (req, res, next) => {
  try {
    const deleted = await Followup.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return next(new ApiError(404, "Follow-up not found"));
    }
    res
      .status(200)
      .json({ success: true, message: "Follow-up deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Delete all follow-ups
export const deleteAllFollowups = async (req, res, next) => {
  try {
    await Followup.deleteMany({});
    res
      .status(200)
      .json({ success: true, message: "All follow-ups deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
