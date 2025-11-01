import cloudinary from "../config/cloudinary.js";
import Customer from "../models/model.customer.js";
import Admin from "../models/model.admin.js";
import ApiError from "../utils/ApiError.js";
import fs from "fs";

// ✅ GET CUSTOMERS (Role-based + Filter)
export const getCustomer = async (req, res, next) => {
  try {
    const admin = req.admin;
    const filter = {};

    // 🧩 Role-based filtering
    if (admin.role === "city_admin") {
      filter.City = admin.city;
    } else if (admin.role === "user") {
      filter.AssignTo = admin._id;
    }

    // 🧠 Query-based filters
    const {
      Campaign,
      PropertyType,
      StatusType,
      City,
      Location,
      Keyword,
      StartDate,
      EndDate,
      Limit,
      sort,
    } = req.query;

    if (Campaign) filter.Campaign = { $regex: Campaign.trim(), $options: "i" };
    if (PropertyType)
      filter.CustomerSubType = { $regex: PropertyType.trim(), $options: "i" };
    if (StatusType)
      filter.Verified = { $regex: StatusType.trim(), $options: "i" };
    if (City) filter.City = { $regex: City.trim(), $options: "i" };
    if (Location) filter.Location = { $regex: Location.trim(), $options: "i" };
    if (Keyword) {
      filter.$or = [
        { customerName: { $regex: Keyword.trim(), $options: "i" } },
        { Email: { $regex: Keyword.trim(), $options: "i" } },
        { Description: { $regex: Keyword.trim(), $options: "i" } },
        { Other: { $regex: Keyword.trim(), $options: "i" } },
      ];
    }
    if (StartDate && EndDate) {
      filter.createdAt = { $gte: new Date(StartDate), $lte: new Date(EndDate) };
    }

    // Sorting
    let sortField = "createdAt";
    let sortOrder = sort?.toLowerCase() === "asc" ? 1 : -1;

    let query = Customer.find(filter)
      .populate("AssignTo", "name email role city")
      .sort({ [sortField]: sortOrder });

    if (Limit) query = query.limit(Number(Limit));

    const customers = await query;
    res.status(200).json(customers);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ ASSIGN OR REASSIGN CUSTOMER
export const assignCustomer = async (req, res, next) => {
  try {
    const { customerId, assignToId } = req.body;
    const admin = req.admin;

    if (!customerId || !assignToId)
      return next(new ApiError(400, "customerId and assignToId are required"));

    const customer = await Customer.findById(customerId);
    if (!customer) return next(new ApiError(404, "Customer not found"));

    const assignToAdmin = await Admin.findById(assignToId);
    if (!assignToAdmin) return next(new ApiError(404, "Admin/User not found"));

    // 🧩 Role-based restriction
    if (admin.role === "city_admin") {
      if (customer.City !== admin.city)
        return next(
          new ApiError(403, "You can only assign customers in your city")
        );
      if (assignToAdmin.city !== admin.city)
        return next(
          new ApiError(403, "You can only assign to users in your city")
        );
    } else if (admin.role === "user") {
      return next(
        new ApiError(403, "Users are not allowed to assign customers")
      );
    }

    customer.AssignTo = assignToId;
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer assigned successfully",
      data: customer,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ BULK ASSIGN CITY CUSTOMERS (City Admin only)
export const bulkAssignCityCustomers = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { assignToId } = req.body;

    if (admin.role !== "city_admin")
      return next(
        new ApiError(403, "Only City Admin can assign all city customers")
      );

    const targetAdmin = await Admin.findById(assignToId);
    if (!targetAdmin)
      return next(new ApiError(404, "Target user/admin not found"));

    if (targetAdmin.city !== admin.city)
      return next(
        new ApiError(403, "You can only assign to users in your city")
      );

    const result = await Customer.updateMany(
      { City: admin.city },
      { AssignTo: assignToId }
    );

    res.status(200).json({
      success: true,
      message: `Assigned ${result.modifiedCount} customers to ${targetAdmin.name}`,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ GET SINGLE CUSTOMER (Role-based)
export const getCustomerById = async (req, res, next) => {
  try {
    const admin = req.admin;
    const customer = await Customer.findById(req.params.id).populate(
      "AssignTo",
      "name email role city"
    );

    if (!customer) return next(new ApiError(404, "Customer not found"));

    if (
      admin.role === "user" &&
      customer.AssignTo?.toString() !== admin._id.toString()
    )
      return next(new ApiError(403, "Access denied"));

    if (admin.role === "city_admin" && customer.City !== admin.city)
      return next(new ApiError(403, "Access denied"));

    res.status(200).json(customer);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ CREATE CUSTOMER
export const createCustomer = async (req, res, next) => {
  try {
    const admin = req.admin;
    const {
      Campaign,
      CustomerType,
      customerName,
      CustomerSubType,
      ContactNumber,
      City,
      Location,
      Area,
      Adderess,
      Email,
      Facillities,
      ReferenceId,
      CustomerId,
      CustomerDate,
      CustomerYear,
      Other,
      Description,
      Video,
      Verified,
      GoogleMap,
    } = req.body;

    let CustomerImage = [];
    let SitePlan = [];

    // Uploads
    if (req.files?.CustomerImage) {
      for (const file of req.files.CustomerImage) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "customer/customer_images",
          transformation: [{ width: 1000, crop: "limit" }],
        });
        CustomerImage.push(upload.secure_url);
        fs.unlink(file.path, () => {});
      }
    }

    if (req.files?.SitePlan) {
      for (const file of req.files.SitePlan) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "customer/site_plans",
          transformation: [{ width: 1000, crop: "limit" }],
        });
        SitePlan.push(upload.secure_url);
        fs.unlink(file.path, () => {});
      }
    }

    const newCustomer = await Customer.create({
      Campaign,
      CustomerType,
      customerName,
      CustomerSubType,
      ContactNumber,
      City,
      Location,
      Area,
      Adderess,
      Email: Email || undefined,
      Facillities,
      ReferenceId,
      CustomerId,
      CustomerDate,
      CustomerYear,
      Other,
      Description,
      Video,
      Verified,
      GoogleMap,
      CustomerImage,
      SitePlan,
      AssignTo: admin.role === "user" ? admin._id : null,
    });

    res.status(201).json({ success: true, data: newCustomer });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Helper for Cloudinary cleanup
const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const file = parts[parts.length - 1];
    return file.split(".")[0];
  } catch {
    return null;
  }
};

// ✅ UPDATE CUSTOMER (Role-based)
// ✅ UPDATE CUSTOMER (Role-based + Image Deletion Support)
export const updateCustomer = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { id } = req.params;
    let updateData = { ...req.body };

    // 🧩 Parse JSON strings if coming from FormData
    const parseArrayField = (field) => {
      if (typeof updateData[field] === "string") {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch {
          updateData[field] = [];
        }
      }
    };

    parseArrayField("removedCustomerImages");
    parseArrayField("removedSitePlans");
    parseArrayField("CustomerImage");
    parseArrayField("SitePlan");

    if (updateData.Email === "") updateData.Email = undefined;

    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) return next(new ApiError(404, "Customer not found"));

    // 🧠 Role restrictions
    if (
      admin.role === "user" &&
      existingCustomer.AssignTo?.toString() !== admin._id.toString()
    )
      return next(new ApiError(403, "You can only update your own customers"));
    if (admin.role === "city_admin" && existingCustomer.City !== admin.city)
      return next(
        new ApiError(403, "You can only update customers in your city")
      );

    let CustomerImage = [...existingCustomer.CustomerImage];
    let SitePlan = [...existingCustomer.SitePlan];

    // 🗑️ 1️⃣ Delete removed Customer Images
    if (
      updateData.removedCustomerImages &&
      Array.isArray(updateData.removedCustomerImages)
    ) {
      for (const url of updateData.removedCustomerImages) {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          await cloudinary.uploader.destroy(
            `customer/customer_images/${publicId}`
          );
        CustomerImage = CustomerImage.filter((img) => img !== url);
      }
    }

    // 🗑️ 2️⃣ Delete removed Site Plans
    if (
      updateData.removedSitePlans &&
      Array.isArray(updateData.removedSitePlans)
    ) {
      for (const url of updateData.removedSitePlans) {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          await cloudinary.uploader.destroy(`customer/site_plans/${publicId}`);
        SitePlan = SitePlan.filter((img) => img !== url);
      }
    }

    // 🧩 3️⃣ Handle empty arrays (clear all images)
    if (
      updateData.CustomerImage &&
      Array.isArray(updateData.CustomerImage) &&
      updateData.CustomerImage.length === 0
    ) {
      for (const oldUrl of existingCustomer.CustomerImage) {
        const publicId = getPublicIdFromUrl(oldUrl);
        if (publicId)
          await cloudinary.uploader.destroy(
            `customer/customer_images/${publicId}`
          );
      }
      CustomerImage = [];
    }

    if (
      updateData.SitePlan &&
      Array.isArray(updateData.SitePlan) &&
      updateData.SitePlan.length === 0
    ) {
      for (const oldUrl of existingCustomer.SitePlan) {
        const publicId = getPublicIdFromUrl(oldUrl);
        if (publicId)
          await cloudinary.uploader.destroy(`customer/site_plans/${publicId}`);
      }
      SitePlan = [];
    }

    // 🖼️ 4️⃣ Upload new Customer Images
    if (req.files?.CustomerImage) {
      for (const file of req.files.CustomerImage) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "customer/customer_images",
          transformation: [{ width: 1000, crop: "limit" }],
        });
        CustomerImage.push(upload.secure_url);
        fs.unlink(file.path, () => {});
      }
    }

    // 📐 5️⃣ Upload new Site Plans
    if (req.files?.SitePlan) {
      for (const file of req.files.SitePlan) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "customer/site_plans",
          transformation: [{ width: 1000, crop: "limit" }],
        });
        SitePlan.push(upload.secure_url);
        fs.unlink(file.path, () => {});
      }
    }

    // 🧾 6️⃣ Final update object
    updateData.CustomerImage = CustomerImage;
    updateData.SitePlan = SitePlan;

    // 🧠 7️⃣ Update customer record
    const updatedCustomer = await Customer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ DELETE CUSTOMER (Role-based + Cloudinary Cleanup)
export const deleteCustomer = async (req, res, next) => {
  try {
    const admin = req.admin;
    const customer = await Customer.findById(req.params.id);
    if (!customer) return next(new ApiError(404, "Customer not found"));

    if (
      admin.role === "user" &&
      customer.AssignTo?.toString() !== admin._id.toString()
    )
      return next(new ApiError(403, "You can only delete your own customers"));
    if (admin.role === "city_admin" && customer.City !== admin.city)
      return next(
        new ApiError(403, "You can only delete customers in your city")
      );

    // 🧹 1️⃣ Delete images from Cloudinary
    if (customer.CustomerImage && customer.CustomerImage.length > 0) {
      for (const url of customer.CustomerImage) {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          await cloudinary.uploader.destroy(
            `customer/customer_images/${publicId}`
          );
      }
    }

    // 🧹 2️⃣ Delete site plans from Cloudinary
    if (customer.SitePlan && customer.SitePlan.length > 0) {
      for (const url of customer.SitePlan) {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          await cloudinary.uploader.destroy(`customer/site_plans/${publicId}`);
      }
    }

    // 🧾 3️⃣ Delete record from DB
    await customer.deleteOne();

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ DELETE ALL CUSTOMERS (Administrator only + Cloudinary Cleanup)
export const deleteAllCustomers = async (req, res, next) => {
  try {
    const admin = req.admin;
    if (admin.role !== "administrator")
      return next(
        new ApiError(403, "Only administrator can delete all customers")
      );

    // 🧹 1️⃣ Fetch all customers to delete images from Cloudinary
    const allCustomers = await Customer.find({});

    for (const customer of allCustomers) {
      if (customer.CustomerImage && customer.CustomerImage.length > 0) {
        for (const url of customer.CustomerImage) {
          const publicId = getPublicIdFromUrl(url);
          if (publicId)
            await cloudinary.uploader.destroy(
              `customer/customer_images/${publicId}`
            );
        }
      }

      if (customer.SitePlan && customer.SitePlan.length > 0) {
        for (const url of customer.SitePlan) {
          const publicId = getPublicIdFromUrl(url);
          if (publicId)
            await cloudinary.uploader.destroy(
              `customer/site_plans/${publicId}`
            );
        }
      }
    }

    // 🧾 2️⃣ Delete all customer records
    await Customer.deleteMany({});

    res.status(200).json({ message: "All customers deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ GET FAVOURITE CUSTOMERS (Role-based)
export const getFavouriteCustomers = async (req, res, next) => {
  try {
    const admin = req.admin;
    const filter = { isFavourite: true };

    if (admin.role === "city_admin") filter.City = admin.city;
    else if (admin.role === "user") filter.AssignTo = admin._id;

    const favourites = await Customer.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: favourites.length,
      data: favourites,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
