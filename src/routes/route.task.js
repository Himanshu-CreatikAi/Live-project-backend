import express from "express";
import {
  createTask,
  deleteTask,
  getTask,
  getTaskById,
  updateTask,
} from "../controllers/controller.task.js";

import { validate } from "../middlewares/validate.js";
import {
  createTaskValidator,
  updateTaskValidator,
} from "../validators/taskvalidator.js";

const taskRoutes = express.Router();

taskRoutes.get("/", getTask);
taskRoutes.get("/:id", getTaskById);
taskRoutes.post("/", validate(createTaskValidator), createTask);
taskRoutes.put("/:id", validate(updateTaskValidator), updateTask);
taskRoutes.delete("/:id", deleteTask);

export default taskRoutes;
