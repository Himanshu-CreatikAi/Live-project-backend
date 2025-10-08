import express from "express";
import {
  createSchedule,
  deleteSchedule,
  getSchedule,
  getScheduleById,
  updateSchedule,
} from "../controllers/controller.schedules.js";

import { validate } from "../middlewares/validate.js";
import {
  createScheduleValidator,
  updateScheduleValidator,
} from "../validators/schedulevalidator.js";

const scheduleRoutes = express.Router();

scheduleRoutes.get("/", getSchedule);
scheduleRoutes.get("/:id", getScheduleById);
scheduleRoutes.post("/", validate(createScheduleValidator), createSchedule);
scheduleRoutes.put("/:id", validate(updateScheduleValidator), updateSchedule);
scheduleRoutes.delete("/:id", deleteSchedule);

export default scheduleRoutes;
