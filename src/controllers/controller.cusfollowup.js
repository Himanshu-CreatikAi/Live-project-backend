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
    const {
      page = 1,
      limit = 10,
      keyword = "",
      status,
      campaign,
      customerSubType,
      propertyType,
      city,
      location,
      user,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const perPage = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * perPage;

    // -----------------------------------------------------
    // 1️⃣ FOLLOW-UP FILTER
    // -----------------------------------------------------
    const followupFilters = {};
    if (status) followupFilters.StatusType = status;

    // -----------------------------------------------------
    // 2️⃣ CUSTOMER FILTERS (Flattened)
    // -----------------------------------------------------
    const customerFilters = {};
    if (campaign)
      customerFilters.Campaign = { $regex: campaign, $options: "i" };
    if (propertyType)
      customerFilters.CustomerType = { $regex: propertyType, $options: "i" };
    if (customerSubType)
      customerFilters.CustomerSubType = {
        $regex: customerSubType,
        $options: "i",
      };
    if (city) customerFilters.City = { $regex: city, $options: "i" };
    if (location)
      customerFilters.Location = { $regex: location, $options: "i" };
    if (user) customerFilters.ReferenceId = { $regex: user, $options: "i" };

    // -----------------------------------------------------
    // 3️⃣ KEYWORD FILTERS
    // -----------------------------------------------------
    const keywordFilters = keyword
      ? {
          $or: [
            { customerName: { $regex: keyword, $options: "i" } },
            { ContactNumber: { $regex: keyword, $options: "i" } },
            { Email: { $regex: keyword, $options: "i" } },
            { City: { $regex: keyword, $options: "i" } },
            { Location: { $regex: keyword, $options: "i" } },
          ],
        }
      : {};

    // -----------------------------------------------------
    // 4️⃣ PIPELINE START
    // -----------------------------------------------------
    const pipeline = [];

    if (Object.keys(followupFilters).length > 0) {
      pipeline.push({ $match: followupFilters });
    }

    // -----------------------------------------------------
    // 🔍 Lookup Customer + AssignTo Admin
    // -----------------------------------------------------
    pipeline.push({
      $lookup: {
        from: "customers",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
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
          { $unwind: { path: "$AssignTo", preserveNullAndEmptyArrays: true } },
        ],
      },
    });

    pipeline.push({
      $unwind: { path: "$customer", preserveNullAndEmptyArrays: false },
    });

    // -----------------------------------------------------
    // 5️⃣ FLATTEN CUSTOMER FIELDS
    // -----------------------------------------------------
    pipeline.push({
      $addFields: {
        Campaign: "$customer.Campaign",
        CustomerType: "$customer.CustomerType",
        CustomerSubType: "$customer.CustomerSubType",
        City: "$customer.City",
        Location: "$customer.Location",
        ReferenceId: "$customer.ReferenceId",
        customerName: "$customer.customerName",
        ContactNumber: "$customer.ContactNumber",
        Email: "$customer.Email",
        AssignTo: "$customer.AssignTo",
        CustomerId: "$customer._id",
      },
    });

    // -----------------------------------------------------
    // 6️⃣ APPLY ALL FILTERS
    // -----------------------------------------------------
    const finalFilters = { ...customerFilters };
    if (keyword) Object.assign(finalFilters, keywordFilters);

    if (Object.keys(finalFilters).length > 0) {
      pipeline.push({ $match: finalFilters });
    }

    // -----------------------------------------------------
    // 7️⃣ CLEAN FINAL OUTPUT
    // -----------------------------------------------------
    pipeline.push({
      $project: {
        customer: 1,
        StartDate: 1,
        StatusType: 1,
        FollowupNextDate: 1,
        Description: 1,
        createdAt: 1,
        updatedAt: 1,

        customerName: 1,
        ContactNumber: 1,
        Email: 1,
        Campaign: 1,
        CustomerType: 1,
        CustomerSubType: 1,
        City: 1,
        Location: 1,
        ReferenceId: 1,
        AssignTo: 1,
      },
    });

    // -----------------------------------------------------
    // 8️⃣ SORT + PAGINATION
    // -----------------------------------------------------
    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: perPage }],
      },
    });

    // -----------------------------------------------------
    // 9️⃣ EXECUTE
    // -----------------------------------------------------
    const aggResult = await Followup.aggregate(pipeline);

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

// ✅ Get follow-up by ID
export const getFollowupById = async (req, res, next) => {
  try {
    const followup = await Followup.findById(req.params.id);

    if (!followup) {
      return next(new ApiError(404, "Follow-up not found"));
    }

    res.status(200).json({
      success: true,
      data: followup,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Update follow-up by ID
export const updateFollowup = async (req, res, next) => {
  try {
    const updates = req.body;

    const updatedFollowup = await Followup.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedFollowup) {
      return next(new ApiError(404, "Follow-up not found"));
    }

    res.status(200).json({
      success: true,
      message: "Follow-up updated successfully",
      data: updatedFollowup,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
