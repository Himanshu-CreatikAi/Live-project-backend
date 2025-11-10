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
    // 🆕 Accept array of schedule IDs from request body
    const { scheduleIds } = req.body;
    let schedulesToDelete = [];

    if (Array.isArray(scheduleIds) && scheduleIds.length > 0) {
      // ✅ Delete only selected schedules
      schedulesToDelete = await Schedule.find({ _id: { $in: scheduleIds } });
      if (schedulesToDelete.length === 0)
        return next(new ApiError(404, "No valid schedules found"));
    } else {
      // ✅ Delete all schedules when array is empty or not sent
      schedulesToDelete = await Schedule.find({});
      if (schedulesToDelete.length === 0)
        return next(new ApiError(404, "No schedules found to delete"));
    }

    // 🧹 Perform deletion
    if (Array.isArray(scheduleIds) && scheduleIds.length > 0) {
      await Schedule.deleteMany({ _id: { $in: scheduleIds } });
    } else {
      await Schedule.deleteMany({});
    }

    res.status(200).json({
      success: true,
      message:
        Array.isArray(scheduleIds) && scheduleIds.length > 0
          ? "Selected schedules deleted successfully"
          : "All schedules deleted successfully",
      deletedScheduleIds:
        Array.isArray(scheduleIds) && scheduleIds.length > 0
          ? scheduleIds
          : schedulesToDelete.map((s) => s._id),
    });
  } catch (error) {
    console.error("❌ DeleteSchedule Error:", error);
    next(new ApiError(500, error.message));
  }
};
