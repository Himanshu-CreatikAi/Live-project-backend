import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["administrator", "city_admin", "user"],
      required: true,
    },
    city: {
      type: String,
      required: function () {
        return this.role === "city_admin" || this.role === "user";
      },
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    AddressLine1: {
      type: String,
      default: "",
    },
    AddressLine2: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

// Index for better query performance
adminSchema.index({ role: 1, city: 1 });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
