import Roles from "../models/model.roles.js";
import ApiError from "../utils/ApiError.js";

export const getRole = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Role = { $regex: keyword, $options: "i" };
    }

    let query = Roles.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const role = await query;

    res.status(200).json(role);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getRoleById = async (req, res, next) => {
  try {
    const role = await Roles.findById(req.params.id);
    if (!role) {
      return next(new ApiError(404, "Role not found"));
    }
    res.status(200).json(role);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createRole = async (req, res, next) => {
  try {
    const { Role, Slug, Status } = req.body;
    const role = new Roles({
      Role,
      Slug,
      Status,
    });
    const savedRole = await role.save();
    res.status(201).json(savedRole);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRole = await Roles.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedRole) {
      return next(new ApiError(404, "Role not found"));
    }
    res.status(200).json(updatedRole);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const deletedRole = await Roles.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return next(new ApiError(404, "Role not found"));
    }
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
