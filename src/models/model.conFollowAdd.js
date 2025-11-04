import mongoose from "mongoose";

let confollowAddchema = new mongoose.Schema(
  {
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    StartDate: {
      type: String,
      default: "",
    },
    StatusType: {
      type: String,
      default: "",
    },
    FollowupNextDate: {
      type: String,
      default: "",
    },
    Description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ConFollowup = mongoose.model("ConFollowAdd", confollowAddchema);

export default ConFollowup;
