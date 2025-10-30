import mongoose from "mongoose";

let functionalAreaschema = new mongoose.Schema(
  {
    Name: {
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

const FunctionalArea = mongoose.model("FunctionalArea", functionalAreaschema);

export default FunctionalArea;
