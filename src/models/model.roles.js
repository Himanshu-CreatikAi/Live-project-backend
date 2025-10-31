import mongoose from "mongoose";

let roleschema = new mongoose.Schema(
  {
    Role: {
      type: String,
      default: "",
    },
    Slug: {
      type: String,
      default: "",
    },
    Status: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Roles = mongoose.model("Role", roleschema);

export default Roles;
