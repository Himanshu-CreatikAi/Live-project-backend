import Schedule from "../models/model.schedules.js";
import ApiError from "../utils/ApiError.js";

export const getSchedule = async (req, res, next) => {
  try {
    const { User, keyword, limit } = req.query;

    const filter = {};

    // Match exact schema field names
    if (User) {
      filter.User = { $regex: User.trim(), $options: "i" }; // match capital 'U'
    }

    if (keyword) {
      filter.Description = { $regex: keyword, $options: "i" }; // match capital 'D'
    }

    // Keep original structure
    let query = Schedule.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const schedule = await query;

    res.status(200).json(schedule);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return next(new ApiError(404, "Schedule not found"));
    }
    res.status(200).json(schedule);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const { date, Time, Description, User } = req.body;
    const schedule = new Schedule({
      date,
      Time,
      Description,
      User,
    });
    const savedSchedule = await schedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedSchedule = await Schedule.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedSchedule) {
      return next(new ApiError(404, "Schedule not found"));
    }
    res.status(200).json(updatedSchedule);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) {
      return next(new ApiError(404, "Schedule not found"));
    }
    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};
