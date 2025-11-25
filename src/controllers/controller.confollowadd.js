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
// export const getConFollowups = async (req, res, next) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       keyword = "",
//       status,
//       campaign,
//       propertyType,
//       city,
//       location,
//       user,
//     } = req.query;

//     const pageNum = Math.max(1, parseInt(page));
//     const perPage = Math.max(1, parseInt(limit));
//     const skip = (pageNum - 1) * perPage;

//     // ✅ Follow-up filters
//     const followupFilters = {};
//     if (status) followupFilters.StatusType = status;

//     // ✅ Contact filters
//     const contactFilters = {};
//     if (campaign)
//       contactFilters["contact.Campaign"] = { $regex: campaign, $options: "i" };
//     if (propertyType)
//       contactFilters["contact.ContactType"] = {
//         $regex: propertyType,
//         $options: "i",
//       };
//     if (city) contactFilters["contact.City"] = { $regex: city, $options: "i" };
//     if (location)
//       contactFilters["contact.Location"] = { $regex: location, $options: "i" };
//     if (user) contactFilters["contact.User"] = { $regex: user, $options: "i" };

//     // ✅ Keyword search
//     const keywordRegex = keyword ? { $regex: keyword, $options: "i" } : null;
//     const keywordMatch = keyword
//       ? {
//           $or: [
//             { "contact.Name": keywordRegex },
//             { "contact.Email": keywordRegex },
//             { "contact.CompanyName": keywordRegex },
//             { "contact.City": keywordRegex },
//             { "contact.Location": keywordRegex },
//           ],
//         }
//       : null;

//     // ✅ Aggregation pipeline
//     const pipeline = [];

//     // Follow-up filters
//     if (Object.keys(followupFilters).length)
//       pipeline.push({ $match: followupFilters });

//     // ✅ Lookup contact data with nested AssignTo admin details
//     pipeline.push({
//       $lookup: {
//         from: "contacts",
//         localField: "contact",
//         foreignField: "_id",
//         as: "contact",
//         pipeline: [
//           {
//             $lookup: {
//               from: "admins",
//               localField: "AssignTo",
//               foreignField: "_id",
//               as: "AssignTo",
//               pipeline: [
//                 {
//                   $project: {
//                     _id: 1,
//                     name: 1,
//                     email: 1,
//                     role: 1,
//                     city: 1,
//                     status: 1,
//                   },
//                 },
//               ],
//             },
//           },
//           {
//             $unwind: {
//               path: "$AssignTo",
//               preserveNullAndEmptyArrays: true,
//             },
//           },
//         ],
//       },
//     });

//     pipeline.push({
//       $unwind: { path: "$contact", preserveNullAndEmptyArrays: false },
//     });

//     // ✅ Apply contact and keyword filters
//     const combinedMatch = {
//       ...(Object.keys(contactFilters).length ? contactFilters : {}),
//       ...(keywordMatch ? keywordMatch : {}),
//     };
//     if (Object.keys(combinedMatch).length)
//       pipeline.push({ $match: combinedMatch });

//     // ✅ Sort & paginate
//     pipeline.push({ $sort: { createdAt: -1 } });

//     pipeline.push({
//       $facet: {
//         metadata: [{ $count: "total" }],
//         data: [{ $skip: skip }, { $limit: perPage }],
//       },
//     });

//     const aggResult = await ConFollowup.aggregate(pipeline);

//     const metadata = aggResult[0]?.metadata?.[0] || { total: 0 };
//     const total = metadata.total || 0;
//     const data = aggResult[0]?.data || [];

//     res.status(200).json({
//       success: true,
//       total,
//       currentPage: pageNum,
//       totalPages: Math.ceil(total / perPage),
//       data,
//     });
//   } catch (error) {
//     next(new ApiError(500, error.message));
//   }
// };

// export const getConFollowups = async (req, res, next) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       keyword = "",
//       status,
//       campaign,
//       propertyType,
//       city,
//       location,
//       user,
//     } = req.query;

//     const pageNum = Math.max(1, parseInt(page));
//     const perPage = Math.max(1, parseInt(limit));
//     const skip = (pageNum - 1) * perPage;

//     // -----------------------------------------------------
//     // 1️⃣ FOLLOW-UP FILTER
//     // -----------------------------------------------------
//     const followupFilters = {};
//     if (status) followupFilters.StatusType = status;

//     // -----------------------------------------------------
//     // 2️⃣ CONTACT FILTERS (will be applied AFTER flattening)
//     // -----------------------------------------------------
//     const contactFilters = {};
//     if (campaign) contactFilters.Campaign = { $regex: campaign, $options: "i" };
//     if (propertyType)
//       contactFilters.ContactType = { $regex: propertyType, $options: "i" };
//     if (city) contactFilters.City = { $regex: city, $options: "i" };
//     if (location) contactFilters.Location = { $regex: location, $options: "i" };
//     if (user) contactFilters.User = { $regex: user, $options: "i" };

//     // -----------------------------------------------------
//     // 3️⃣ KEYWORD SEARCH (after flattening)
//     // -----------------------------------------------------
//     const keywordFilters = keyword
//       ? {
//           $or: [
//             { Name: { $regex: keyword, $options: "i" } },
//             { Email: { $regex: keyword, $options: "i" } },
//             { CompanyName: { $regex: keyword, $options: "i" } },
//             { City: { $regex: keyword, $options: "i" } },
//             { Location: { $regex: keyword, $options: "i" } },
//           ],
//         }
//       : {};

//     // -----------------------------------------------------
//     // 4️⃣ AGGREGATION PIPELINE
//     // -----------------------------------------------------
//     const pipeline = [];

//     // Apply follow-up filters
//     if (Object.keys(followupFilters).length > 0) {
//       pipeline.push({ $match: followupFilters });
//     }

//     // -----------------------------------------------------
//     // 🔍 Lookup Contact & Admin (AssignTo)
//     // -----------------------------------------------------
//     pipeline.push({
//       $lookup: {
//         from: "contacts",
//         localField: "contact",
//         foreignField: "_id",
//         as: "contact",
//         pipeline: [
//           {
//             $lookup: {
//               from: "admins",
//               localField: "AssignTo",
//               foreignField: "_id",
//               as: "AssignTo",
//               pipeline: [
//                 {
//                   $project: {
//                     _id: 1,
//                     name: 1,
//                     email: 1,
//                     role: 1,
//                     city: 1,
//                     status: 1,
//                   },
//                 },
//               ],
//             },
//           },
//           { $unwind: { path: "$AssignTo", preserveNullAndEmptyArrays: true } },
//         ],
//       },
//     });

//     // Unwind contact
//     pipeline.push({
//       $unwind: { path: "$contact", preserveNullAndEmptyArrays: false },
//     });

//     // -----------------------------------------------------
//     // 5️⃣ FLATTEN CONTACT FIELDS (ALWAYS SAME FORMAT)
//     // -----------------------------------------------------
//     pipeline.push({
//       $addFields: {
//         Campaign: "$contact.Campaign",
//         ContactType: "$contact.ContactType",
//         City: "$contact.City",
//         Location: "$contact.Location",
//         User: "$contact.User",
//         Name: "$contact.Name",
//         Email: "$contact.Email",
//         CompanyName: "$contact.CompanyName",
//         AssignTo: "$contact.AssignTo",
//         ContactId: "$contact._id",
//       },
//     });

//     // -----------------------------------------------------
//     // 6️⃣ APPLY CONTACT FILTERS + KEYWORD FILTERS
//     // -----------------------------------------------------
//     const finalFilters = { ...contactFilters };

//     if (keyword) Object.assign(finalFilters, keywordFilters);

//     if (Object.keys(finalFilters).length > 0) {
//       pipeline.push({ $match: finalFilters });
//     }

//     // -----------------------------------------------------
//     // 7️⃣ SORT & PAGINATION
//     // -----------------------------------------------------
//     pipeline.push({ $sort: { createdAt: -1 } });

//     pipeline.push({
//       $facet: {
//         metadata: [{ $count: "total" }],
//         data: [{ $skip: skip }, { $limit: perPage }],
//       },
//     });

//     // -----------------------------------------------------
//     // 8️⃣ Execute
//     // -----------------------------------------------------
//     const aggResult = await ConFollowup.aggregate(pipeline);

//     const metadata = aggResult[0]?.metadata?.[0] || { total: 0 };
//     const total = metadata.total || 0;
//     const data = aggResult[0]?.data || [];

//     // -----------------------------------------------------
//     // 9️⃣ RESPONSE
//     // -----------------------------------------------------
//     res.status(200).json({
//       success: true,
//       total,
//       currentPage: pageNum,
//       totalPages: Math.ceil(total / perPage),
//       data,
//     });
//   } catch (error) {
//     next(new ApiError(500, error.message));
//   }
// };

export const getConFollowups = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      keyword = "",
      status,
      campaign,
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
    // 2️⃣ CONTACT FILTERS (after flattening)
    // -----------------------------------------------------
    const contactFilters = {};
    if (campaign) contactFilters.Campaign = { $regex: campaign, $options: "i" };
    if (propertyType)
      contactFilters.ContactType = { $regex: propertyType, $options: "i" };
    if (city) contactFilters.City = { $regex: city, $options: "i" };
    if (location) contactFilters.Location = { $regex: location, $options: "i" };
    if (user) contactFilters.User = { $regex: user, $options: "i" };

    // -----------------------------------------------------
    // 3️⃣ KEYWORD FILTERS
    // -----------------------------------------------------
    const keywordFilters = keyword
      ? {
          $or: [
            { Name: { $regex: keyword, $options: "i" } },
            { Email: { $regex: keyword, $options: "i" } },
            { CompanyName: { $regex: keyword, $options: "i" } },
            { City: { $regex: keyword, $options: "i" } },
            { Location: { $regex: keyword, $options: "i" } },
          ],
        }
      : {};

    // -----------------------------------------------------
    // 4️⃣ PIPELINE START
    // -----------------------------------------------------
    const pipeline = [];

    // Follow-up filter
    if (Object.keys(followupFilters).length > 0) {
      pipeline.push({ $match: followupFilters });
    }

    // -----------------------------------------------------
    // 🔍 Lookup Contact + Admin
    // -----------------------------------------------------
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
          { $unwind: { path: "$AssignTo", preserveNullAndEmptyArrays: true } },
        ],
      },
    });

    // Unwind contact
    pipeline.push({
      $unwind: { path: "$contact", preserveNullAndEmptyArrays: false },
    });

    // -----------------------------------------------------
    // 5️⃣ FLATTEN FIELDS FOR FILTERING
    // -----------------------------------------------------
    pipeline.push({
      $addFields: {
        Campaign: "$contact.Campaign",
        ContactType: "$contact.ContactType",
        City: "$contact.City",
        Location: "$contact.Location",
        User: "$contact.User",
        Name: "$contact.Name",
        Email: "$contact.Email",
        CompanyName: "$contact.CompanyName",
        AssignTo: "$contact.AssignTo",
        ContactId: "$contact._id",
      },
    });

    // -----------------------------------------------------
    // 6️⃣ APPLY ALL FILTERS
    // -----------------------------------------------------
    const finalFilters = { ...contactFilters };
    if (keyword) Object.assign(finalFilters, keywordFilters);

    if (Object.keys(finalFilters).length > 0) {
      pipeline.push({ $match: finalFilters });
    }

    // -----------------------------------------------------
    // 7️⃣ REMOVE DUPLICATED FIELDS (IMPORTANT!)
    // -----------------------------------------------------
    pipeline.push({
      $project: {
        contact: 1,
        StartDate: 1,
        StatusType: 1,
        FollowupNextDate: 1,
        Description: 1,
        createdAt: 1,
        updatedAt: 1,
        // Keep only what you want to expose
        Name: 1,
        Email: 1,
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
    const aggResult = await ConFollowup.aggregate(pipeline);

    const metadata = aggResult[0]?.metadata?.[0] || { total: 0 };
    const total = metadata.total || 0;
    const data = aggResult[0]?.data || [];

    // -----------------------------------------------------
    // 🔟 RESPONSE
    // -----------------------------------------------------
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
