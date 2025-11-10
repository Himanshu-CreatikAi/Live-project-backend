import Task from "../models/model.task.js";
import ApiError from "../utils/ApiError.js";

export const getTask = async (req, res, next) => {
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

    let query = Task.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const task = await query;

    res.status(200).json(task);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return next(new ApiError(404, "Task not found"));
    }
    res.status(200).json(task);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { date, Time, Description, User } = req.body;
    const task = new Task({
      date,
      Time,
      Description,
      User,
    });
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedTask) {
      return next(new ApiError(404, "Task not found"));
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// ✅ DELETE SELECTED OR ALL TASKS (Administrator only)
export const deleteTask = async (req, res, next) => {
  try {
    const { taskIds } = req.body;

    // ✅ If body is empty, treat it like "delete all"
    if (!taskIds || (Array.isArray(taskIds) && taskIds.length === 0)) {
      const allTasks = await Task.find();
      if (allTasks.length === 0)
        return next(new ApiError(404, "No tasks found to delete"));

      await Task.deleteMany({});
      return res.status(200).json({
        success: true,
        message: "All tasks deleted successfully",
        deletedTaskIds: allTasks.map((t) => t._id),
      });
    }

    // ✅ Delete selected
    const tasksToDelete = await Task.find({ _id: { $in: taskIds } });
    if (tasksToDelete.length === 0)
      return next(new ApiError(404, "No valid tasks found"));

    await Task.deleteMany({ _id: { $in: taskIds } });

    res.status(200).json({
      success: true,
      message: "Selected tasks deleted successfully",
      deletedTaskIds: taskIds,
    });
  } catch (error) {
    console.error("❌ DeleteTask Error:", error);
    next(new ApiError(500, error.message));
  }
};
