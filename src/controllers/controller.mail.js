import Mail from "../models/model.mailtemplate.js";
import ApiError from "../utils/ApiError.js";

export const getMail = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Mail.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const mail = await query;

    res.status(200).json(mail);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getMailById = async (req, res, next) => {
  try {
    const mail = await Mail.findById(req.params.id);
    if (!mail) {
      return next(new ApiError(404, "Mail not found"));
    }
    res.status(200).json(mail);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createMail = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const mail = new Mail({
      Name,
      Status,
    });
    const savedMail = await mail.save();
    res.status(201).json(savedMail);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateMail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedMail = await Mail.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedMail) {
      return next(new ApiError(404, "Mail not found"));
    }
    res.status(200).json(updatedMail);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteMail = async (req, res, next) => {
  try {
    const deletedMail = await Mail.findByIdAndDelete(req.params.id);
    if (!deletedMail) {
      return next(new ApiError(404, "Mail not found"));
    }
    res.status(200).json({ message: "Mail deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
