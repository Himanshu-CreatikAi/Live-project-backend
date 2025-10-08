import mongoose from "mongoose";

let comProEnqschema = new mongoose.Schema(
  {
    UserName: {
      type: String,
      default: "",
    },
    ProjrctName: {
      type: String,
      default: "",
    },
    Description: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ComProEnq = mongoose.model("ComProEnq", comProEnqschema);

export default ComProEnq;
