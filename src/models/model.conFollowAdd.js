import mongoose from "mongoose";

let confollowAddchema = new mongoose.Schema(
  {
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

const ConFollowAdd = mongoose.model("ConFollowAdd", confollowAddchema);

export default ConFollowAdd;
