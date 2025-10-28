import mongoose from "mongoose";

const followupSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    StartDate: { type: String, default: "" },
    StatusType: { type: String, default: "" },
    FollowupNextDate: { type: String, default: "" },
    Description: { type: String, default: "" },
  },
  { timestamps: true }
);

const Followup = mongoose.model("Followup", followupSchema);
export default Followup;
