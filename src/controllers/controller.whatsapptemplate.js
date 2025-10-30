import Whatsapp from "../models/model.whatsapptemplate.js";
import ApiError from "../utils/ApiError.js";

export const getWhatsapp = async (req, res, next) => {
  try {
    const { keyword, limit } = req.query;

    const filter = {};

    if (keyword) {
      filter.Name = { $regex: keyword, $options: "i" };
    }

    let query = Whatsapp.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const whatsapp = await query;

    res.status(200).json(whatsapp);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getWhatsappById = async (req, res, next) => {
  try {
    const whatsapp = await Whatsapp.findById(req.params.id);
    if (!whatsapp) {
      return next(new ApiError(404, "Whatsapp template not found"));
    }
    res.status(200).json(whatsapp);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createWhatsapp = async (req, res, next) => {
  try {
    const { Name, Status } = req.body;
    const whatsapp = new Whatsapp({
      Name,
      Status,
    });
    const savedWhatsapp = await whatsapp.save();
    res.status(201).json(savedWhatsapp);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateWhatsapp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedWhatsapp = await Whatsapp.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedWhatsapp) {
      return next(new ApiError(404, "Whatsapp not found"));
    }
    res.status(200).json(updatedWhatsapp);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteWhatsapp = async (req, res, next) => {
  try {
    const deletedWhatsapp = await Whatsapp.findByIdAndDelete(req.params.id);
    if (!deletedWhatsapp) {
      return next(new ApiError(404, "Whatsapp template not found"));
    }
    res.status(200).json({ message: "Whatsapp template deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
