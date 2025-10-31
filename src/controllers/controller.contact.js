// controllers/contact.controller.js
import Contact from "../models/model.contact.js";
import Admin from "../models/model.admin.js";
import ApiError from "../utils/ApiError.js";

// ✅ GET CONTACTS (Role-based + Filters)
export const getContact = async (req, res, next) => {
  try {
    const admin = req.admin;
    const filter = {};

    // 🧩 Role-based filtering
    if (admin.role === "city_admin") {
      filter.City = admin.city;
    } else if (admin.role === "user") {
      filter.AssignTo = admin._id;
    }

    // 🧠 Query filters
    const {
      Campaign,
      ContactType,
      City,
      Location,
      Keyword,
      StartDate,
      EndDate,
      Limit,
      sort,
    } = req.query;

    if (Campaign) filter.Campaign = { $regex: Campaign.trim(), $options: "i" };
    if (ContactType)
      filter.ContactType = { $regex: ContactType.trim(), $options: "i" };
    if (City) filter.City = { $regex: City.trim(), $options: "i" };
    if (Location) filter.Location = { $regex: Location.trim(), $options: "i" };

    if (Keyword) {
      filter.$or = [
        { Name: { $regex: Keyword.trim(), $options: "i" } },
        { CompanyName: { $regex: Keyword.trim(), $options: "i" } },
        { Notes: { $regex: Keyword.trim(), $options: "i" } },
        { Email: { $regex: Keyword.trim(), $options: "i" } },
      ];
    }

    if (StartDate && EndDate) {
      filter.createdAt = { $gte: new Date(StartDate), $lte: new Date(EndDate) };
    }

    // Sorting
    let sortField = "createdAt";
    let sortOrder = sort?.toLowerCase() === "asc" ? 1 : -1;

    let query = Contact.find(filter)
      .populate("AssignTo", "name email role city")
      .sort({ [sortField]: sortOrder });

    if (Limit) query = query.limit(Number(Limit));

    const contacts = await query;
    res.status(200).json(contacts);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ ASSIGN OR REASSIGN CONTACT (Role-based)
export const assignContact = async (req, res, next) => {
  try {
    const { contactId, assignToId } = req.body;
    const admin = req.admin;

    if (!contactId || !assignToId) {
      return next(new ApiError(400, "contactId and assignToId are required"));
    }

    // 🔍 Fetch contact
    const contact = await Contact.findById(contactId);
    if (!contact) return next(new ApiError(404, "Contact not found"));

    // 🔍 Fetch target admin/user
    const assignToAdmin = await Admin.findById(assignToId);
    if (!assignToAdmin) return next(new ApiError(404, "Admin/User not found"));

    // 🧩 Role restrictions
    if (admin.role === "city_admin") {
      // Ensure contact city matches admin city
      if (contact.City?.toLowerCase() !== admin.city?.toLowerCase()) {
        return next(
          new ApiError(403, "You can only assign contacts in your city")
        );
      }

      // Ensure target admin belongs to same city
      if (assignToAdmin.city?.toLowerCase() !== admin.city?.toLowerCase()) {
        return next(
          new ApiError(403, "You can only assign to users in your city")
        );
      }
    } else if (admin.role === "user") {
      return next(new ApiError(403, "Users cannot assign contacts"));
    }

    // ✅ Assign contact
    contact.AssignTo = assignToId;
    await contact.save();

    res.status(200).json({
      success: true,
      message: "Contact assigned successfully",
      data: contact,
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

// ✅ GET SINGLE CONTACT (Role-based)
export const getContactById = async (req, res, next) => {
  try {
    const admin = req.admin;
    const contact = await Contact.findById(req.params.id).populate(
      "AssignTo",
      "name email role city"
    );

    if (!contact) return next(new ApiError(404, "Contact not found"));

    if (
      admin.role === "user" &&
      contact.AssignTo?.toString() !== admin._id.toString()
    )
      return next(new ApiError(403, "Access denied"));
    if (admin.role === "city_admin" && contact.City !== admin.city)
      return next(new ApiError(403, "Access denied"));

    res.status(200).json(contact);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ CREATE CONTACT (Auto-assign for user role)
export const createContact = async (req, res, next) => {
  try {
    const admin = req.admin;
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
      date,
      Email,
      CompanyName,
      Website,
      Status,
      Qualifications,
      AssignTo,
    } = req.body;

    const newContact = await Contact.create({
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
      date,
      Email: Email || undefined,
      CompanyName,
      Website,
      Status,
      Qualifications,
      AssignTo: admin.role === "user" ? admin._id : AssignTo || null,
    });

    res.status(201).json({ success: true, data: newContact });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// ✅ UPDATE CONTACT (Role-based)
export const updateContact = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { id } = req.params;

    const existingContact = await Contact.findById(id);
    if (!existingContact) return next(new ApiError(404, "Contact not found"));

    // Role-based restrictions
    if (
      admin.role === "user" &&
      existingContact.AssignTo?.toString() !== admin._id.toString()
    )
      return next(
        new ApiError(403, "You can only update your assigned contacts")
      );
    if (admin.role === "city_admin" && existingContact.City !== admin.city)
      return next(
        new ApiError(403, "You can only update contacts in your city")
      );

    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: updatedContact,
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

// ✅ DELETE ALL CONTACTS (Administrator only)
export const deleteAllContacts = async (req, res, next) => {
  try {
    const admin = req.admin;
    if (admin.role !== "administrator")
      return next(
        new ApiError(403, "Only administrator can delete all contacts")
      );

    const result = await Contact.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All contacts deleted successfully",
      deleted: result.deletedCount,
    });
  } catch (error) {
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
