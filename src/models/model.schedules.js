import mongoose from "mongoose";

let scheduleschema = new mongoose.Schema(
  {
    date: {
      type: String,
      default: "",
    },
    Time: {
      type: String,
      default: "",
    },
    Description: {
      type: String,
      default: "",
    },
    User: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleschema);

export default Schedule;
