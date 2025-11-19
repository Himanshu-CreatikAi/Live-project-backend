// controllers/contact.controller.js

import Contact from "../models/model.contact.js";
import Campaign from "../models/model.campaign.js";
import ContactType from "../models/model.contacttype.js";

import Admin from "../models/model.admin.js";
import ApiError from "../utils/ApiError.js";

import mongoose from "mongoose";

export const getContact = async (req, res, next) => {
  try {
    const admin = req.admin;
    const filter = {};

    // Role based filter
    if (admin.role === "city_admin") filter.City = admin.city;
    if (admin.role === "user") filter.AssignTo = admin._id;

    // ❌ rename THESE so they don't overwrite Models
    const {
      Campaign: CampaignQuery,
      ContactType: ContactTypeQuery,
      City,
      Location,
      Keyword,
      StartDate,
      EndDate,
      Limit,
      sort,
    } = req.query;

    // Filters
    if (CampaignQuery)
      filter.Campaign = { $regex: CampaignQuery, $options: "i" };

    if (ContactTypeQuery)
      filter.ContactType = { $regex: ContactTypeQuery, $options: "i" };

    if (City) filter.City = { $regex: City, $options: "i" };
    if (Location) filter.Location = { $regex: Location, $options: "i" };

    if (Keyword) {
      filter.$or = [
        { Name: { $regex: Keyword, $options: "i" } },
        { CompanyName: { $regex: Keyword, $options: "i" } },
        { Notes: { $regex: Keyword, $options: "i" } },
        { Email: { $regex: Keyword, $options: "i" } },
      ];
    }

    if (StartDate && EndDate) {
      filter.createdAt = {
        $gte: new Date(StartDate),
        $lte: new Date(EndDate),
      };
    }

    // Sorting
    const sortField = "createdAt";
    const sortOrder = sort?.toLowerCase() === "asc" ? 1 : -1;

    // Fetch contacts
    let query = Contact.find(filter)
      .populate("AssignTo", "name email role city")
      .sort({ [sortField]: sortOrder });

    if (Limit) query = query.limit(Number(Limit));

    const contacts = await query;

    // Extract valid ObjectId strings
    const campaignIds = [
      ...new Set(
        contacts
          .map((c) => c.Campaign)
          .filter((x) => mongoose.isValidObjectId(x))
      ),
    ];

    const typeIds = [
      ...new Set(
        contacts
          .map((c) => c.ContactType)
          .filter((x) => mongoose.isValidObjectId(x))
      ),
    ];

    // Fetch names
    const campaigns = await Campaign.find({
      _id: { $in: campaignIds },
    });

    const contactTypes = await ContactType.find({
      _id: { $in: typeIds },
    });

    // Create maps
    const campaignMap = {};
    const typeMap = {};

    campaigns.forEach((c) => {
      campaignMap[c._id.toString()] = c.Name;
    });

    contactTypes.forEach((t) => {
      typeMap[t._id.toString()] = t.Name;
    });

    // Replace IDs with names
    const finalData = contacts.map((c) => {
      const obj = c.toObject();
      return {
        ...obj,
        Campaign: campaignMap[obj.Campaign] || obj.Campaign,
        ContactType: typeMap[obj.ContactType] || obj.ContactType,
      };
    });

    return res.status(200).json({
      success: true,
      data: finalData,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ ASSIGN OR REASSIGN CONTACT (Role-based)
export const assignContact = async (req, res, next) => {
  try {
    const { contactIds = [], assignToId } = req.body;
    const admin = req.admin;

    if (!Array.isArray(contactIds) || contactIds.length === 0 || !assignToId) {
      return next(
        new ApiError(400, "contactIds (array) and assignToId are required")
      );
    }

    // 🔍 Fetch target admin/user
    const assignToAdmin = await Admin.findById(assignToId);
    if (!assignToAdmin) return next(new ApiError(404, "Admin/User not found"));

    // 🔍 Fetch all contacts
    const contacts = await Contact.find({ _id: { $in: contactIds } });
    if (contacts.length === 0)
      return next(new ApiError(404, "No valid contacts found"));

    // 🧩 Role restrictions
    if (admin.role === "city_admin") {
      // Ensure all contacts belong to admin’s city
      const invalidContacts = contacts.filter(
        (c) => c.City?.toLowerCase() !== admin.city?.toLowerCase()
      );
      if (invalidContacts.length > 0) {
        return next(
          new ApiError(403, "You can only assign contacts in your city")
        );
      }

      // Ensure target user/admin belongs to same city
      if (assignToAdmin.city?.toLowerCase() !== admin.city?.toLowerCase()) {
        return next(
          new ApiError(403, "You can only assign to users in your city")
        );
      }
    } else if (admin.role === "user") {
      return next(new ApiError(403, "Users cannot assign contacts"));
    }

    // ✅ Bulk update all selected contacts
    await Contact.updateMany(
      { _id: { $in: contactIds } },
      { $set: { AssignTo: assignToId } }
    );

    const updatedContacts = await Contact.find({ _id: { $in: contactIds } });

    // 📝 Optional: log each assignment (you can save to a separate collection)
    // Example: ContactAssignmentHistory.create([...])

    res.status(200).json({
      success: true,
      message: `Assigned ${updatedContacts.length} contacts successfully`,
      data: updatedContacts,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ BULK ASSIGN CITY CONTACTS (City Admin only)
export const bulkAssignCityContacts = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { assignToId } = req.body;

    if (admin.role !== "city_admin") {
      return next(
        new ApiError(403, "Only City Admin can assign city contacts")
      );
    }

    const targetAdmin = await Admin.findById(assignToId);
    if (!targetAdmin) {
      return next(new ApiError(404, "Target user/admin not found"));
    }

    if (targetAdmin.city?.toLowerCase() !== admin.city?.toLowerCase()) {
      return next(new ApiError(403, "You can only assign within your city"));
    }

    // ✅ Assign all contacts from admin's city
    const result = await Contact.updateMany(
      { City: { $regex: new RegExp(`^${admin.city}$`, "i") } },
      { AssignTo: assignToId }
    );

    res.status(200).json({
      success: true,
      message: `Assigned ${result.modifiedCount} contacts to ${targetAdmin.name}`,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const admin = req.admin;

    let contact = await Contact.findById(req.params.id).populate(
      "AssignTo",
      "name email role city"
    );

    if (!contact) return next(new ApiError(404, "Contact not found"));

    // Role validation
    if (
      admin.role === "user" &&
      contact.AssignTo?._id?.toString() !== admin._id.toString()
    )
      return next(new ApiError(403, "Access denied"));

    if (admin.role === "city_admin" && contact.City !== admin.city)
      return next(new ApiError(403, "Access denied"));

    // Fetch campaign & type doc
    let campaignDoc = null;
    let contactTypeDoc = null;

    if (mongoose.isValidObjectId(contact.Campaign))
      campaignDoc = await Campaign.findById(contact.Campaign);

    if (mongoose.isValidObjectId(contact.ContactType))
      contactTypeDoc = await ContactType.findById(contact.ContactType);

    return res.status(200).json({
      ...contact.toObject(),
      Campaign: campaignDoc
        ? { _id: campaignDoc._id, Name: campaignDoc.Name }
        : { _id: null, Name: contact.Campaign },

      ContactType: contactTypeDoc
        ? { _id: contactTypeDoc._id, Name: contactTypeDoc.Name }
        : { _id: null, Name: contact.ContactType },
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ CREATE CONTACT (Auto-assign for user role)
export const createContact = async (req, res, next) => {
  try {
    const admin = req.admin;
    let body = req.body;

    // Convert names → IDs before saving
    let campaignId = null;
    let contactTypeId = null;

    if (body.Campaign) {
      const camp = await Campaign.findOne({ Name: body.Campaign.trim() });
      if (!camp) return next(new ApiError(400, "Invalid Campaign Name"));
      campaignId = camp._id;
    }

    if (body.ContactType) {
      const type = await ContactType.findOne({ Name: body.ContactType.trim() });
      if (!type) return next(new ApiError(400, "Invalid Contact Type Name"));
      contactTypeId = type._id;
    }

    const newContact = await Contact.create({
      ...body,
      Campaign: campaignId,
      ContactType: contactTypeId,
      AssignTo: admin.role === "user" ? admin._id : body.AssignTo || null,
    });

    return res.status(201).json({
      success: true,
      data: {
        ...newContact.toObject(),
        Campaign: { _id: campaignId, Name: body.Campaign },
        ContactType: { _id: contactTypeId, Name: body.ContactType },
      },
    });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// ✅ UPDATE CONTACT (Role-based)
export const updateContact = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { id } = req.params;
    let body = req.body;

    const existingContact = await Contact.findById(id);
    if (!existingContact) return next(new ApiError(404, "Contact not found"));

    if (
      admin.role === "user" &&
      existingContact.AssignTo?.toString() !== admin._id.toString()
    )
      return next(new ApiError(403, "You can only update your contacts"));

    if (admin.role === "city_admin" && existingContact.City !== admin.city)
      return next(
        new ApiError(403, "You can only update contacts in your city")
      );

    // Convert names → IDs
    let campaignId = existingContact.Campaign;
    let contactTypeId = existingContact.ContactType;

    if (body.Campaign) {
      const camp = await Campaign.findOne({ Name: body.Campaign.trim() });
      if (!camp) return next(new ApiError(400, "Invalid Campaign Name"));
      campaignId = camp._id;
    }

    if (body.ContactType) {
      const type = await ContactType.findOne({ Name: body.ContactType.trim() });
      if (!type) return next(new ApiError(400, "Invalid Contact Type Name"));
      contactTypeId = type._id;
    }

    const updated = await Contact.findByIdAndUpdate(
      id,
      {
        ...body,
        Campaign: campaignId,
        ContactType: contactTypeId,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: {
        ...updated.toObject(),
        Campaign: { _id: campaignId, Name: body.Campaign || "" },
        ContactType: { _id: contactTypeId, Name: body.ContactType || "" },
      },
    });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// ✅ DELETE CONTACT (Role-based)
export const deleteContactbyId = async (req, res, next) => {
  try {
    const admin = req.admin;
    const contact = await Contact.findById(req.params.id);
    if (!contact) return next(new ApiError(404, "Contact not found"));

    if (
      admin.role === "user" &&
      contact.AssignTo?.toString() !== admin._id.toString()
    )
      return next(new ApiError(403, "You can only delete your own contacts"));
    if (admin.role === "city_admin" && contact.City !== admin.city)
      return next(
        new ApiError(403, "You can only delete contacts in your city")
      );

    await contact.deleteOne();
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ DELETE SELECTED OR ALL CONTACTS (Administrator only)
export const deleteAllContacts = async (req, res, next) => {
  try {
    const admin = req.admin;

    if (admin.role !== "administrator") {
      return next(new ApiError(403, "Only administrator can delete contacts"));
    }

    // 🆕 Accept array of contact IDs from request body
    const { contactIds } = req.body;

    let contactsToDelete = [];

    if (Array.isArray(contactIds) && contactIds.length > 0) {
      // ✅ Delete only selected contacts
      contactsToDelete = await Contact.find({ _id: { $in: contactIds } });

      if (contactsToDelete.length === 0)
        return next(new ApiError(404, "No valid contacts found"));
    } else {
      // ✅ Delete all contacts when array is empty or not sent
      contactsToDelete = await Contact.find({});
      if (contactsToDelete.length === 0)
        return next(new ApiError(404, "No contacts found to delete"));
    }

    // 🧹 Perform deletion
    if (Array.isArray(contactIds) && contactIds.length > 0) {
      await Contact.deleteMany({ _id: { $in: contactIds } });
    } else {
      await Contact.deleteMany({});
    }

    res.status(200).json({
      success: true,
      message:
        Array.isArray(contactIds) && contactIds.length > 0
          ? "Selected contacts deleted successfully"
          : "All contacts deleted successfully",
      deletedContactIds:
        Array.isArray(contactIds) && contactIds.length > 0
          ? contactIds
          : contactsToDelete.map((c) => c._id),
    });
  } catch (error) {
    console.error("❌ DeleteAllContacts Error:", error);
    next(new ApiError(500, error.message));
  }
};

// ✅ GET FAVOURITE CONTACTS (Role-based)
export const getFavouriteContacts = async (req, res, next) => {
  try {
    const admin = req.admin;
    const filter = { isFavourite: true };

    if (admin.role === "city_admin") filter.City = admin.city;
    else if (admin.role === "user") filter.AssignTo = admin._id;

    const favourites = await Contact.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: favourites.length,
      data: favourites,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
