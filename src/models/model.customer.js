import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    Campaign: { type: String, required: true },
    CustomerType: { type: String, default: "" },
    customerName: { type: String, required: true },
    CustomerSubType: { type: String, default: "" },
    ContactNumber: { type: String, required: true, unique: true },
    City: { type: String, default: "" },
    Location: { type: String, default: "" },
    Area: { type: String, default: "" },
    Adderess: { type: String, default: "" },
    Email: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
    },
    Facillities: { type: String, default: "" },
    ReferenceId: { type: String, default: "" },
    CustomerId: { type: String, default: "" },
    CustomerDate: { type: String, default: "" },
    CustomerYear: { type: String, default: "" },
    Other: { type: String, default: "" },
    Description: { type: String, default: "" },
    Video: { type: String, default: "" },
    Verified: { type: String, default: "" },
    GoogleMap: { type: String, default: "" },
    CustomerImage: { type: [String], default: [] },
    SitePlan: { type: [String], default: [] },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    AssignTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
