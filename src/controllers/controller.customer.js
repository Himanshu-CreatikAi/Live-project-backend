import cloudinary from "../config/cloudinary.js";
import Customer from "../models/model.customer.js";
import ApiError from "../utils/ApiError.js";
import fs from "fs";

export const getCustomer = async (req, res, next) => {
  try {
    const {
      Campaign,
      PropertyType,
      StatusType,
      City,
      Location,
      User,
      Keyword,
      StartDate,
      EndDate,
      Limit,
      sort,
    } = req.query;

    const filter = {};

    if (Campaign) {
      filter.Campaign = { $regex: Campaign.trim(), $options: "i" };
    }

    if (PropertyType) {
      filter.CustomerSubType = { $regex: PropertyType.trim(), $options: "i" };
    }

    if (StatusType) {
      filter.Verified = { $regex: StatusType.trim(), $options: "i" };
    }

    if (City) {
      filter.City = { $regex: City.trim(), $options: "i" };
    }

    if (Location) {
      filter.Location = { $regex: Location.trim(), $options: "i" };
    }

    if (User) {
      filter.ReferenceId = { $regex: User.trim(), $options: "i" };
    }

    if (Keyword) {
      filter.$or = [
        { customerName: { $regex: Keyword.trim(), $options: "i" } },
        { Email: { $regex: Keyword.trim(), $options: "i" } },
        { Description: { $regex: Keyword.trim(), $options: "i" } },
        { Other: { $regex: Keyword.trim(), $options: "i" } },
      ];
    }

    if (StartDate && EndDate) {
      filter.createdAt = {
        $gte: new Date(StartDate),
        $lte: new Date(EndDate),
      };
    } else if (StartDate) {
      filter.createdAt = { $gte: new Date(StartDate) };
    } else if (EndDate) {
      filter.createdAt = { $lte: new Date(EndDate) };
    }

    let sortOrder = -1;
    let sortField = "createdAt";

    if (sort) {
      if (sort.toLowerCase() === "asc") {
        sortOrder = 1;
      } else if (sort.toLowerCase() === "desc") {
        sortOrder = -1;
      }
      sortField = "customerName";
    }

    let query = Customer.find(filter).sort({ [sortField]: sortOrder });

    if (Limit) {
      query = query.limit(Number(Limit));
    }

    const customer = await query;
    res.status(200).json(customer);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return next(new ApiError(404, "Customer not found"));
    }
    res.status(200).json(customer);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Create Customer Followup
export const createCustomer = async (req, res, next) => {
  try {
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

    // ✅ Upload CustomerImage files to Cloudinary
    if (req.files?.CustomerImage) {
      for (const file of req.files.CustomerImage) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "customer/customer_images",
          transformation: [{ width: 1000, crop: "limit" }],
        });
        CustomerImage.push(upload.secure_url);
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }
    }

    // ✅ Upload SitePlan files to Cloudinary
    if (req.files?.SitePlan) {
      for (const file of req.files.SitePlan) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "customer/site_plans",
          transformation: [{ width: 1000, crop: "limit" }],
        });
        SitePlan.push(upload.secure_url);
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
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
    });

    res.status(201).json({ success: true, data: newCustomer });
  } catch (error) {
    console.error("Create error:", error);
    next(new ApiError(500, error.message));
  }
};

const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const file = parts[parts.length - 1];
    return file.split(".")[0];
  } catch {
    return null;
  }
};

// ✅ Update Customer Followup
export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    let updateData = { ...req.body };

    // Avoid empty email value
    if (updateData.Email === "") {
      updateData.Email = undefined;
    }

    // ✅ Find existing document to delete old images if replaced
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return next(new ApiError(404, "Customer not found"));
    }

    let CustomerImage = [];
    let SitePlan = [];

    // ✅ Upload new CustomerImage files to Cloudinary
    if (req.files?.CustomerImage) {
      // Delete old CustomerImage files from Cloudinary
      if (existingCustomer.CustomerImage?.length) {
        for (const oldUrl of existingCustomer.CustomerImage) {
          const publicId = getPublicIdFromUrl(oldUrl);
          if (publicId) {
            await cloudinary.uploader.destroy(
              `customer/customer_images/${publicId}`
            );
          }
        }
      }

      // Upload new images
      for (const file of req.files.CustomerImage) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "customer/customer_images",
          transformation: [{ width: 1000, crop: "limit" }],
        });
        CustomerImage.push(upload.secure_url);
        fs.unlink(
          file.path,
          (err) => err && console.error("Error deleting temp file:", err)
        );
      }

      updateData.CustomerImage = CustomerImage;
    }

    // ✅ Upload new SitePlan files to Cloudinary
    if (req.files?.SitePlan) {
      // Delete old SitePlan files from Cloudinary
      if (existingCustomer.SitePlan?.length) {
        for (const oldUrl of existingCustomer.SitePlan) {
          const publicId = getPublicIdFromUrl(oldUrl);
          if (publicId) {
            await cloudinary.uploader.destroy(
              `customer/site_plans/${publicId}`
            );
          }
        }
      }

      // Upload new ones
      for (const file of req.files.SitePlan) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "customer/site_plans",
          transformation: [{ width: 1000, crop: "limit" }],
        });
        SitePlan.push(upload.secure_url);
        fs.unlink(
          file.path,
          (err) => err && console.error("Error deleting temp file:", err)
        );
      }

      updateData.SitePlan = SitePlan;
    }

    // ✅ Update in MongoDB
    const updatedCustomer = await Customer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error("Update error:", error);
    next(new ApiError(500, error.message));
  }
};
// delete by id
export const deleteCustomer = async (req, res, next) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return next(new ApiError(404, "Customer not found"));
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// delete all customer

export const deleteAllCustomers = async (req, res, next) => {
  try {
    const result = await Customer.deleteMany({});
    if (result.deletedCount === 0) {
      return next(new ApiError(404, "No customers found to delete"));
    }
    res.status(200).json({ message: "All customers deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Get All Favourite Customers
export const getFavouriteCustomers = async (req, res, next) => {
  try {
    const favourites = await Customer.find({ isFavourite: true }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      count: favourites.length,
      data: favourites,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
