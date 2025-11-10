import cloudinary from "../config/cloudinary.js";
import Builder from "../models/model.builderslider.js";
import ApiError from "../utils/ApiError.js";
import fs from "fs";

// ✅ GET ALL BUILDERS (No Filters)
export const getBuilders = async (req, res, next) => {
  try {
    const builders = await Builder.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: builders });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ GET SINGLE BUILDER BY ID
export const getBuilderById = async (req, res, next) => {
  try {
    const builder = await Builder.findById(req.params.id);
    if (!builder) return next(new ApiError(404, "Builder not found"));
    res.status(200).json({ success: true, data: builder });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ CREATE BUILDER
export const createBuilder = async (req, res, next) => {
  try {
    const { Status } = req.body;
    let Image = [];

    if (req.files?.Image) {
      const uploads = req.files.Image.map((file) =>
        cloudinary.uploader
          .upload(file.path, {
            folder: "builders/images",
            transformation: [{ width: 1000, crop: "limit" }],
          })
          .then((upload) => {
            fs.unlink(file.path, () => {});
            return upload.secure_url;
          })
      );
      Image = await Promise.all(uploads);
    }

    const newBuilder = await Builder.create({
      Status,
      Image,
    });

    res.status(201).json({ success: true, data: newBuilder });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Helper: Extract Cloudinary Public ID
const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const file = parts[parts.length - 1];
    return file.split(".")[0];
  } catch {
    return null;
  }
};

// ✅ UPDATE BUILDER (Replace Images Instead of Appending)
export const updateBuilder = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // 🧩 Parse possible stringified arrays
    const parseArrayField = (field) => {
      if (typeof updateData[field] === "string") {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch {
          updateData[field] = [];
        }
      }
    };

    parseArrayField("removedImages");
    parseArrayField("Image");

    // 🔍 Fetch existing builder
    const existingBuilder = await Builder.findById(id);
    if (!existingBuilder) return next(new ApiError(404, "Builder not found"));

    let Image = [...existingBuilder.Image];

    // 🗑️ 1️⃣ Delete specific images (if provided)
    if (updateData.removedImages?.length) {
      const deletions = updateData.removedImages.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          return cloudinary.uploader.destroy(`builders/images/${publicId}`);
      });
      await Promise.all(deletions);
      Image = Image.filter((img) => !updateData.removedImages.includes(img));
    }

    // 🗑️ 2️⃣ If Image field is an empty array → delete all existing images
    if (Array.isArray(updateData.Image) && updateData.Image.length === 0) {
      const deletions = existingBuilder.Image.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          return cloudinary.uploader.destroy(`builders/images/${publicId}`);
      });
      await Promise.all(deletions);
      Image = [];
    }

    // 🖼️ 3️⃣ Replace existing images if new images are uploaded
    if (req.files?.Image?.length) {
      // First delete all old images
      const deletions = existingBuilder.Image.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          return cloudinary.uploader.destroy(`builders/images/${publicId}`);
      });
      await Promise.all(deletions);

      // Upload new ones
      const uploads = req.files.Image.map((file) =>
        cloudinary.uploader
          .upload(file.path, {
            folder: "builders/images",
            transformation: [{ width: 1000, crop: "limit" }],
          })
          .then((upload) => {
            fs.unlink(file.path, () => {});
            return upload.secure_url;
          })
      );

      const newImgs = await Promise.all(uploads);
      Image = newImgs; // ✅ Replace old array completely
    }

    updateData.Image = Image;

    // 🧱 4️⃣ Validate status
    if (
      updateData.status &&
      !["active", "inactive"].includes(updateData.status)
    ) {
      return next(
        new ApiError(400, "Status must be either 'active' or 'inactive'")
      );
    }

    // 💾 5️⃣ Update builder
    const updatedBuilder = await Builder.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Builder updated successfully",
      data: updatedBuilder,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ DELETE SINGLE BUILDER
export const deleteBuilder = async (req, res, next) => {
  try {
    const builder = await Builder.findById(req.params.id);
    if (!builder) return next(new ApiError(404, "Builder not found"));

    if (builder.Image?.length) {
      const deletions = builder.Image.map((url) =>
        cloudinary.uploader.destroy(
          `builders/images/${getPublicIdFromUrl(url)}`
        )
      );
      await Promise.all(deletions);
    }

    await builder.deleteOne();
    res.status(200).json({ message: "Builder deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ DELETE ALL BUILDERS
export const deleteAllBuilders = async (req, res, next) => {
  try {
    const allBuilders = await Builder.find({});
    const deletions = [];

    for (const b of allBuilders) {
      if (b.Image?.length) {
        deletions.push(
          ...b.Image.map((url) =>
            cloudinary.uploader.destroy(
              `builders/images/${getPublicIdFromUrl(url)}`
            )
          )
        );
      }
    }

    await Promise.all(deletions);
    await Builder.deleteMany({});

    res.status(200).json({ message: "All builders deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
