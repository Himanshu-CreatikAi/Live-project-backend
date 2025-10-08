import Contact from "../models/model.contact.js";
import ApiError from "../utils/ApiError.js";

export const getContact = async (req, res, next) => {
  try {
    const {
      StatusAssign,
      Campaign,
      ContactType,
      City,
      Location,
      User,
      Keyword,
      Limit,
      sort,
    } = req.query;

    const filter = {};

    // Match schema field names exactly (case-sensitive)
    if (StatusAssign) {
      filter.AssignTo = { $regex: StatusAssign.trim(), $options: "i" };
    }

    if (Campaign) {
      filter.Campaign = { $regex: Campaign.trim(), $options: "i" };
    }

    if (ContactType) {
      filter.ContactType = { $regex: ContactType.trim(), $options: "i" };
    }

    if (City) {
      filter.City = { $regex: City.trim(), $options: "i" };
    }

    if (Location) {
      filter.Location = { $regex: Location.trim(), $options: "i" };
    }

    if (User) {
      filter.AssignTo = { $regex: User.trim(), $options: "i" };
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
    let sortOrder = -1;
    let sortField = "createdAt";

    if (sort) {
      if (sort.toLowerCase() === "asc") {
        sortOrder = 1;
      } else if (sort.toLowerCase() === "desc") {
        sortOrder = -1;
      }
      sortField = "Name";
    }

    // Build query
    let query = Contact.find(filter).sort({ [sortField]: sortOrder });

    if (Limit) {
      query = query.limit(Number(Limit));
    }

    const contact = await query;

    res.status(200).json(contact);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return next(new ApiError(404, "Contact not found"));
    }
    res.status(200).json(contact);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createContact = async (req, res, next) => {
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
      date,
      Email,
      CompanyName,
      Website,
      Status,
      Qualifications,
      AssignTo,
    } = req.body;
    const contact = new Contact({
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
    });
    const savedContact = await contact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedContact) {
      return next(new ApiError(404, "Contact not found"));
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const deletedContact = await Contact.deleteMany({}); // Delete all documents

    if (deletedContact.deletedCount === 0) {
      return next(new ApiError(404, "No Contact found to delete"));
    }

    res.status(200).json({ message: "All Contacts deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const deleteContactbyId = async (req, res, next) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact) {
      return next(new ApiError(404, "Contact not found"));
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
