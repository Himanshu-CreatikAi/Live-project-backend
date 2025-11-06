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

    if (admin.role === "city_admin") filter.City = admin.city;
    else if (admin.role === "user") filter.AssignTo = admin._id;

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

    const sortField = "createdAt";
    const sortOrder = sort?.toLowerCase() === "asc" ? 1 : -1;

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
    const { customerIds = [], assignToId } = req.body;
    const admin = req.admin;

    if (!Array.isArray(customerIds) || customerIds.length === 0 || !assignToId)
      return next(
        new ApiError(400, "customerIds (array) and assignToId are required")
      );

    const assignToAdmin = await Admin.findById(assignToId);
    if (!assignToAdmin) return next(new ApiError(404, "Admin/User not found"));

    const customers = await Customer.find({ _id: { $in: customerIds } });
    if (customers.length === 0)
      return next(new ApiError(404, "No valid customers found"));

    // 🔒 Role-based checks
    if (admin.role === "city_admin") {
      // Ensure all customers belong to the same city
      const invalidCustomers = customers.filter((c) => c.City !== admin.city);
      if (invalidCustomers.length > 0)
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

    // ✅ Bulk update all customers
    await Customer.updateMany(
      { _id: { $in: customerIds } },
      { $set: { AssignTo: assignToId } }
    );

    const updatedCustomers = await Customer.find({ _id: { $in: customerIds } });

    res.status(200).json({
      success: true,
      message: `Assigned ${updatedCustomers.length} customers successfully`,
      data: updatedCustomers,
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

// ✅ CREATE CUSTOMER (Optimized Parallel Uploads)
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

    if (req.files?.CustomerImage) {
      const uploads = req.files.CustomerImage.map((file) =>
        cloudinary.uploader
          .upload(file.path, {
            folder: "customer/customer_images",
            transformation: [{ width: 1000, crop: "limit" }],
          })
          .then((upload) => {
            fs.unlink(file.path, () => {});
            return upload.secure_url;
          })
      );
      CustomerImage = await Promise.all(uploads);
    }

    if (req.files?.SitePlan) {
      const uploads = req.files.SitePlan.map((file) =>
        cloudinary.uploader
          .upload(file.path, {
            folder: "customer/site_plans",
            transformation: [{ width: 1000, crop: "limit" }],
          })
          .then((upload) => {
            fs.unlink(file.path, () => {});
            return upload.secure_url;
          })
      );
      SitePlan = await Promise.all(uploads);
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

// ✅ Helper
const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const file = parts[parts.length - 1];
    return file.split(".")[0];
  } catch {
    return null;
  }
};

// ✅ UPDATE CUSTOMER (Optimized Parallel Uploads + Deletions)
// ✅ UPDATE CUSTOMER (Optimized Parallel Uploads + Deletions + Empty Array Handling)
export const updateCustomer = async (req, res, next) => {
  try {
    const admin = req.admin;
    const { id } = req.params;
    let updateData = { ...req.body };

    // Parse stringified arrays (from FormData)
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

    // 🗑️ 1️⃣ Delete specific removed images (parallel)
    if (updateData.removedCustomerImages?.length) {
      const deletions = updateData.removedCustomerImages.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          return cloudinary.uploader.destroy(
            `customer/customer_images/${publicId}`
          );
      });
      await Promise.all(deletions);
      CustomerImage = CustomerImage.filter(
        (img) => !updateData.removedCustomerImages.includes(img)
      );
    }

    if (updateData.removedSitePlans?.length) {
      const deletions = updateData.removedSitePlans.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          return cloudinary.uploader.destroy(`customer/site_plans/${publicId}`);
      });
      await Promise.all(deletions);
      SitePlan = SitePlan.filter(
        (img) => !updateData.removedSitePlans.includes(img)
      );
    }

    // 🧩 2️⃣ Handle empty arrays (clear all existing images)
    if (
      Array.isArray(updateData.CustomerImage) &&
      updateData.CustomerImage.length === 0
    ) {
      const deletions = existingCustomer.CustomerImage.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          return cloudinary.uploader.destroy(
            `customer/customer_images/${publicId}`
          );
      });
      await Promise.all(deletions);
      CustomerImage = [];
    }

    if (
      Array.isArray(updateData.SitePlan) &&
      updateData.SitePlan.length === 0
    ) {
      const deletions = existingCustomer.SitePlan.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          return cloudinary.uploader.destroy(`customer/site_plans/${publicId}`);
      });
      await Promise.all(deletions);
      SitePlan = [];
    }

    // 🖼️ 3️⃣ Upload new images (parallel)
    if (req.files?.CustomerImage) {
      const uploads = req.files.CustomerImage.map((file) =>
        cloudinary.uploader
          .upload(file.path, {
            folder: "customer/customer_images",
            transformation: [{ width: 1000, crop: "limit" }],
          })
          .then((upload) => {
            fs.unlink(file.path, () => {});
            return upload.secure_url;
          })
      );
      const newImgs = await Promise.all(uploads);
      CustomerImage.push(...newImgs);
    }

    if (req.files?.SitePlan) {
      const uploads = req.files.SitePlan.map((file) =>
        cloudinary.uploader
          .upload(file.path, {
            folder: "customer/site_plans",
            transformation: [{ width: 1000, crop: "limit" }],
          })
          .then((upload) => {
            fs.unlink(file.path, () => {});
            return upload.secure_url;
          })
      );
      const newPlans = await Promise.all(uploads);
      SitePlan.push(...newPlans);
    }

    // ✅ Final update
    updateData.CustomerImage = CustomerImage;
    updateData.SitePlan = SitePlan;

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

// ✅ DELETE CUSTOMER (Optimized Parallel Cleanup)
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

    const deletions = [];

    if (customer.CustomerImage?.length) {
      deletions.push(
        ...customer.CustomerImage.map((url) =>
          cloudinary.uploader.destroy(
            `customer/customer_images/${getPublicIdFromUrl(url)}`
          )
        )
      );
    }
    if (customer.SitePlan?.length) {
      deletions.push(
        ...customer.SitePlan.map((url) =>
          cloudinary.uploader.destroy(
            `customer/site_plans/${getPublicIdFromUrl(url)}`
          )
        )
      );
    }

    await Promise.all(deletions);
    await customer.deleteOne();

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ DELETE ALL CUSTOMERS (Optimized)
export const deleteAllCustomers = async (req, res, next) => {
  try {
    const admin = req.admin;
    if (admin.role !== "administrator")
      return next(
        new ApiError(403, "Only administrator can delete all customers")
      );

    const allCustomers = await Customer.find({});
    const deletions = [];

    for (const c of allCustomers) {
      if (c.CustomerImage?.length) {
        deletions.push(
          ...c.CustomerImage.map((url) =>
            cloudinary.uploader.destroy(
              `customer/customer_images/${getPublicIdFromUrl(url)}`
            )
          )
        );
      }
      if (c.SitePlan?.length) {
        deletions.push(
          ...c.SitePlan.map((url) =>
            cloudinary.uploader.destroy(
              `customer/site_plans/${getPublicIdFromUrl(url)}`
            )
          )
        );
      }
    }

    await Promise.all(deletions);
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
