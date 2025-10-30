import mongoose from "mongoose";

let whatsappschema = new mongoose.Schema(
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

const Whatsapp = mongoose.model("Whatsapp", whatsappschema);

export default Whatsapp;
