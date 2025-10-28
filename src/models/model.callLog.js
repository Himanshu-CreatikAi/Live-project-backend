import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema(
  {
    CallSid: String,
    AgentNumber: String,
    CustomerNumber: String,
    Status: {
      type: String,
      enum: ["initiated", "in-progress", "completed", "failed"],
      default: "initiated",
    },
    RecordingUrl: String,
    Duration: Number,
    StartTime: Date,
    EndTime: Date,
    Direction: String,
    ErrorMessage: String,
    CustomerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
  },
  { timestamps: true }
);

const CallLog = mongoose.model("CallLog", callLogSchema);
export default CallLog;
