import axios from "axios";
import CallLog from "../models/model.callLog.js";
import Customer from "../models/model.customer.js";
import ApiError from "../utils/ApiError.js";

/**
 * 📞 Initiate a call (Telecaller → Customer)
 * - Fetches customer number from DB
 * - Initiates Exotel call
 * - Logs call in CallLog model
 */
export const makeCall = async (req, res, next) => {
  try {
    const { agentNumber, customerId } = req.body;

    if (!agentNumber || !customerId)
      return next(new ApiError(400, "agentNumber and customerId are required"));

    // 🔍 Fetch customer info from DB
    const customer = await Customer.findById(customerId);
    if (!customer) return next(new ApiError(404, "Customer not found"));

    const customerNumber =
      customer.ContactNumber || customer.phone || customer.mobile;
    if (!customerNumber)
      return next(new ApiError(400, "Customer has no valid contact number"));

    const url = `${process.env.EXOTEL_BASE_URL}/${process.env.EXOTEL_SID}/Calls/connect.json`;

    const formData = new URLSearchParams({
      From: agentNumber,
      To: customerNumber,
      CallerId: process.env.EXOTEL_VIRTUAL_NUMBER,
      CallType: "trans",
      StatusCallback: `${process.env.BASE_URL}/api/v1/calls/webhook`,
    });

    const response = await axios.post(url, formData, {
      auth: {
        username: process.env.EXOTEL_SID,
        password: process.env.EXOTEL_TOKEN,
      },
    });

    const callData = response.data?.Call || {};

    // 🧾 Save call log
    const log = await CallLog.create({
      CallSid: callData.Sid,
      AgentNumber: agentNumber,
      CustomerNumber: customerNumber,
      Status: callData.Status || "initiated",
      StartTime: new Date(),
      CustomerRef: customer._id,
    });

    res.status(200).json({
      success: true,
      message: "Call initiated successfully",
      data: log,
    });
  } catch (error) {
    console.error("Call Error:", error.response?.data || error.message);
    next(new ApiError(500, error.message));
  }
};

/**
 * 📊 Webhook to receive call status updates (Exotel will POST here)
 */
export const handleExotelWebhook = async (req, res, next) => {
  try {
    const {
      CallSid,
      Status,
      RecordingUrl,
      StartTime,
      EndTime,
      Duration,
      Direction,
    } = req.body;

    const callLog = await CallLog.findOneAndUpdate(
      { CallSid },
      {
        Status,
        RecordingUrl,
        StartTime,
        EndTime,
        Duration,
        Direction,
      },
      { new: true }
    );

    // If not found, create new
    if (!callLog) {
      await CallLog.create({
        CallSid,
        Status,
        RecordingUrl,
        StartTime,
        EndTime,
        Duration,
        Direction,
      });
    }

    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

/**
 * 🧾 Get call history
 */
export const getAllCalls = async (req, res, next) => {
  try {
    const calls = await CallLog.find()
      .populate("CustomerRef", "name ContactNumber email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: calls.length, data: calls });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};
