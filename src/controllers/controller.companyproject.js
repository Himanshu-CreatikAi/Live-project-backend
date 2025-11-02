import cloudinary from "../config/cloudinary.js";
import CompanyProject from "../models/model.companyproject.js";
import ApiError from "../utils/ApiError.js";
import fs from "fs";

// ✅ GET PROJECTS (Filter + Sort)
export const getProjects = async (req, res, next) => {
  try {
    const { ProjectName, ProjectStatus, Range, City, Limit, sort } = req.query;
    const filter = {};

    if (ProjectName)
      filter.ProjectName = { $regex: ProjectName.trim(), $options: "i" };
    if (ProjectStatus)
      filter.ProjectStatus = { $regex: ProjectStatus.trim(), $options: "i" };
    if (Range) filter.Range = { $regex: Range.trim(), $options: "i" };
    if (City) filter.City = { $regex: City.trim(), $options: "i" };

    const sortField = "createdAt";
    const sortOrder = sort?.toLowerCase() === "asc" ? 1 : -1;

    let query = CompanyProject.find(filter).sort({ [sortField]: sortOrder });

    if (Limit) query = query.limit(Number(Limit));

    const projects = await query;
    res.status(200).json(projects);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ GET SINGLE PROJECT
export const getProjectById = async (req, res, next) => {
  try {
    const project = await CompanyProject.findById(req.params.id);

    if (!project) return next(new ApiError(404, "Project not found"));

    res.status(200).json(project);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ CREATE PROJECT (Optimized Parallel Uploads)
export const createProject = async (req, res, next) => {
  try {
    const {
      ProjectName,
      ProjectType,
      ProjectStatus,
      City,
      Location,
      Area,
      Range,
      Adderess,
      Facillities,
      Amenities,
      Description,
      Video,
      GoogleMap,
    } = req.body;

    let CustomerImage = [];
    let SitePlan = [];

    if (req.files?.CustomerImage) {
      const uploads = req.files.CustomerImage.map((file) =>
        cloudinary.uploader
          .upload(file.path, {
            folder: "projects/project_images",
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
            folder: "projects/site_plans",
            transformation: [{ width: 1000, crop: "limit" }],
          })
          .then((upload) => {
            fs.unlink(file.path, () => {});
            return upload.secure_url;
          })
      );
      SitePlan = await Promise.all(uploads);
    }

    const newProject = await CompanyProject.create({
      ProjectName,
      ProjectType,
      ProjectStatus,
      City,
      Location,
      Area,
      Range,
      Adderess,
      Facillities,
      Amenities,
      Description,
      Video,
      GoogleMap,
      CustomerImage,
      SitePlan,
      CreatedBy: req.admin?._id || null,
    });

    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ Helper to extract Cloudinary Public ID
const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const file = parts[parts.length - 1];
    return file.split(".")[0];
  } catch {
    return null;
  }
};

// ✅ UPDATE PROJECT (Parallel Uploads + Deletions + Empty Array Handling)
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Parse possible stringified arrays
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

    const existingProject = await CompanyProject.findById(id);
    if (!existingProject) return next(new ApiError(404, "Project not found"));

    let CustomerImage = [...existingProject.CustomerImage];
    let SitePlan = [...existingProject.SitePlan];

    // 🗑️ 1️⃣ Delete specific removed images
    if (updateData.removedCustomerImages?.length) {
      const deletions = updateData.removedCustomerImages.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          return cloudinary.uploader.destroy(
            `projects/project_images/${publicId}`
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
          return cloudinary.uploader.destroy(`projects/site_plans/${publicId}`);
      });
      await Promise.all(deletions);
      SitePlan = SitePlan.filter(
        (img) => !updateData.removedSitePlans.includes(img)
      );
    }

    // 🧩 2️⃣ Handle empty arrays
    if (
      Array.isArray(updateData.CustomerImage) &&
      updateData.CustomerImage.length === 0
    ) {
      const deletions = existingProject.CustomerImage.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          return cloudinary.uploader.destroy(
            `projects/project_images/${publicId}`
          );
      });
      await Promise.all(deletions);
      CustomerImage = [];
    }

    if (
      Array.isArray(updateData.SitePlan) &&
      updateData.SitePlan.length === 0
    ) {
      const deletions = existingProject.SitePlan.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (publicId)
          return cloudinary.uploader.destroy(`projects/site_plans/${publicId}`);
      });
      await Promise.all(deletions);
      SitePlan = [];
    }

    // 🖼️ 3️⃣ Upload new images
    if (req.files?.CustomerImage) {
      const uploads = req.files.CustomerImage.map((file) =>
        cloudinary.uploader
          .upload(file.path, {
            folder: "projects/project_images",
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
            folder: "projects/site_plans",
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

    updateData.CustomerImage = CustomerImage;
    updateData.SitePlan = SitePlan;

    const updatedProject = await CompanyProject.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ DELETE PROJECT (Optimized Cleanup)
export const deleteProject = async (req, res, next) => {
  try {
    const project = await CompanyProject.findById(req.params.id);
    if (!project) return next(new ApiError(404, "Project not found"));

    const deletions = [];

    if (project.CustomerImage?.length) {
      deletions.push(
        ...project.CustomerImage.map((url) =>
          cloudinary.uploader.destroy(
            `projects/project_images/${getPublicIdFromUrl(url)}`
          )
        )
      );
    }

    if (project.SitePlan?.length) {
      deletions.push(
        ...project.SitePlan.map((url) =>
          cloudinary.uploader.destroy(
            `projects/site_plans/${getPublicIdFromUrl(url)}`
          )
        )
      );
    }

    await Promise.all(deletions);
    await project.deleteOne();

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// ✅ DELETE ALL PROJECTS
export const deleteAllProjects = async (req, res, next) => {
  try {
    const allProjects = await CompanyProject.find({});
    const deletions = [];

    for (const p of allProjects) {
      if (p.CustomerImage?.length) {
        deletions.push(
          ...p.CustomerImage.map((url) =>
            cloudinary.uploader.destroy(
              `projects/project_images/${getPublicIdFromUrl(url)}`
            )
          )
        );
      }
      if (p.SitePlan?.length) {
        deletions.push(
          ...p.SitePlan.map((url) =>
            cloudinary.uploader.destroy(
              `projects/site_plans/${getPublicIdFromUrl(url)}`
            )
          )
        );
      }
    }

    await Promise.all(deletions);
    await CompanyProject.deleteMany({});

    res.status(200).json({ message: "All projects deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
