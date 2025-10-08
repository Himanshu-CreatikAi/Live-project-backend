import mongoose from "mongoose";

let taskschema = new mongoose.Schema(
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

const Task = mongoose.model("Task", taskschema);

export default Task;
