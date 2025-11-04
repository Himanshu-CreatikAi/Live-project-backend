import express from "express";
import {
  createFollowup,
  getFollowups,
  getFollowupByCustomer,
  deleteFollowup,
  deleteAllFollowups,
  getFollowupById,
  updateFollowup,
} from "../controllers/controller.cusfollowup.js";

const followupRoutes = express.Router();

// Create follow-up for a specific customer
followupRoutes.post("/:customerId", createFollowup);

// Get all follow-ups with pagination
followupRoutes.get("/", getFollowups);

// Get all follow-ups of one customer
followupRoutes.get("/customer/:customerId", getFollowupByCustomer);

//get follow up by id
followupRoutes.get("/:id", getFollowupById);

//update followup
followupRoutes.put("/:id", updateFollowup);

// Delete one follow-up
followupRoutes.delete("/:id", deleteFollowup);

// Delete all follow-ups
followupRoutes.delete("/", deleteAllFollowups);

export default followupRoutes;
