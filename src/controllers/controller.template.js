import Template from "../models/model.template.js";
import ApiError from "../utils/ApiError.js";

/**
 * Create Template
 */
export const createTemplate = async (req, res, next) => {
  try {
    const {
      name,
      type,
      subject = "",
      body,
      description = "",
      status = "Active",
    } = req.body;

    if (!name || !type || !body) {
      return next(new ApiError(400, "name, type and body are required"));
    }

    const existing = await Template.findOne({ name });
    if (existing) {
      return next(new ApiError(409, "Template with this name already exists"));
    }

    const newTemplate = await Template.create({
      name,
      type,
      subject,
      body,
      description,
      status,
      createdBy: req.user?.id || "system",
    });

    res.status(201).json({ success: true, data: newTemplate });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

/**
 * Get templates (with pagination)
 */
export const getTemplates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { type, search = "" } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (search)
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];

    const [data, total] = await Promise.all([
      Template.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Template.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

/**
 * Get single template
 */
export const getTemplateById = async (req, res, next) => {
  try {
    const tpl = await Template.findById(req.params.id);
    if (!tpl) return next(new ApiError(404, "Template not found"));
    res.status(200).json({ success: true, data: tpl });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

/**
 * Update template
 */
export const updateTemplate = async (req, res, next) => {
  try {
    const updated = await Template.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return next(new ApiError(404, "Template not found"));
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

/**
 * Delete template
 */
export const deleteTemplate = async (req, res, next) => {
  try {
    const deleted = await Template.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ApiError(404, "Template not found"));
    res.status(200).json({ success: true, message: "Template deleted" });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};
