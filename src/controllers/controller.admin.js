import { genrateToken } from "../config/adminjwt.js";
import Admin from "../models/model.admin.js";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";
import { sendSystemEmail } from "../config/mailer.js";

// Sign up admin (Only for creating initial administrator)
export const adminSignup = async (req, res) => {
  const { name, email, password, role, city, phone } = req.body;

  try {
    if (!email || !password || !name || !role) {
      throw new ApiError(400, "Missing required details");
    }

    // Check if any administrator exists
    const existingAdmin = await Admin.findOne({ role: "administrator" });

    // If an administrator exists, only allow signup for administrator role
    if (existingAdmin && role === "administrator") {
      throw new ApiError(
        403,
        "Administrator account already exists. Use create admin endpoint."
      );
    }

    const admin = await Admin.findOne({ email });
    if (admin) {
      throw new ApiError(409, "Account already exists");
    }

    // Validate city for city_admin and user roles
    if ((role === "city_admin" || role === "user") && !city) {
      throw new ApiError(400, "City is required for this role");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role,
      city: city || undefined,
      phone,
    });

    const token = genrateToken(newAdmin._id);

    const adminData = newAdmin.toObject();
    delete adminData.password;

    res.status(201).json({
      success: true,
      adminData,
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log(error.message);
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// Create new admin/user (by administrator or city admin)
export const createAdmin = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    city,
    phone,
    AddressLine1,
    AddressLine2,
  } = req.body;

  try {
    const currentAdmin = req.admin;

    // Permission checks
    if (currentAdmin.role === "administrator") {
      // can create any
    } else if (currentAdmin.role === "city_admin") {
      if (role !== "user")
        throw new ApiError(403, "City admins can only create users");
      if (city !== currentAdmin.city)
        throw new ApiError(403, "You can only create users in your city");
    } else {
      throw new ApiError(403, "You don't have permission to create accounts");
    }

    if (!email || !password || !name || !role)
      throw new ApiError(400, "Missing required details");

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) throw new ApiError(409, "Account already exists");

    if ((role === "city_admin" || role === "user") && !city)
      throw new ApiError(400, "City is required for this role");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role,
      city: city || undefined,
      phone,
      AddressLine1,
      AddressLine2,
      createdBy: currentAdmin._id,
    });

    const adminData = newAdmin.toObject();
    delete adminData.password;

    // ✉️ Send role-based system email
    sendSystemEmail(email, name, password, role)
      .then(() => console.log(`✅ Account email sent to ${email}`))
      .catch((err) => console.error("❌ Email send failed:", err.message));

    res.status(201).json({
      success: true,
      adminData,
      message: `${role} created successfully. Login credentials have been sent via email.`,
    });
  } catch (error) {
    console.error(error.message);
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Missing login details");
    }

    const adminData = await Admin.findOne({ email });

    if (!adminData) {
      throw new ApiError(404, "Admin not found");
    }

    if (adminData.status === "inactive") {
      throw new ApiError(403, "Account has been deactivated");
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      adminData.password
    );

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = genrateToken(adminData._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = adminData.toObject();
    delete responseData.password;

    res.json({
      success: true,
      adminData: responseData,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.log(error.message);
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// Check authentication
export const checkAuth = (req, res) => {
  const adminData = req.admin.toObject();
  delete adminData.password;

  res.json({ success: true, admin: adminData });
};

// Logout
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error.message);
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// Update admin details (with permission check)
export const updateAdminDetails = async (req, res) => {
  try {
    const targetAdminId = req.params.id;
    const { name, email, phone, city, status, AddressLine2, AddressLine1 } =
      req.body;
    const currentAdmin = req.admin;

    const targetAdmin = await Admin.findById(targetAdminId);

    if (!targetAdmin) {
      throw new ApiError(404, "Admin not found");
    }

    // Permission checks
    if (currentAdmin.role === "administrator") {
      // Administrator can update anyone
    } else if (currentAdmin.role === "city_admin") {
      // City admin can update users in their city
      if (
        targetAdmin.role !== "user" ||
        targetAdmin.city !== currentAdmin.city
      ) {
        throw new ApiError(403, "You can only update users in your city");
      }
    } else if (currentAdmin.role === "user") {
      // Users can only update themselves
      if (targetAdmin._id.toString() !== currentAdmin._id.toString()) {
        throw new ApiError(403, "You can only update your own details");
      }
    }

    // Update fields
    if (name) targetAdmin.name = name;
    if (AddressLine1) targetAdmin.AddressLine1 = AddressLine1;
    if (AddressLine2) targetAdmin.AddressLine2 = AddressLine2;
    if (email) {
      // Check if email already exists
      const emailExists = await Admin.findOne({
        email,
        _id: { $ne: targetAdminId },
      });
      if (emailExists) {
        throw new ApiError(409, "Email already in use");
      }
      targetAdmin.email = email;
    }
    if (phone !== undefined) targetAdmin.phone = phone;

    // Only administrator can change city
    if (city && currentAdmin.role === "administrator") {
      targetAdmin.city = city;
    }

    // Only administrator can activate/deactivate accounts
    if (status !== undefined && currentAdmin.role === "administrator") {
      if (status !== "active" && status !== "inactive") {
        throw new ApiError(400, "Status must be either 'active' or 'inactive'");
      }
      targetAdmin.status = status;
    }

    await targetAdmin.save();

    const updatedAdmin = targetAdmin.toObject();
    delete updatedAdmin.password;

    res.json({
      success: true,
      adminData: updatedAdmin,
      message: "Details updated successfully",
    });
  } catch (error) {
    console.log(error.message);
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// Update password
export const updatePassword = async (req, res) => {
  try {
    const targetAdminId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    const currentAdmin = req.admin;

    if (!newPassword || newPassword.length < 6) {
      throw new ApiError(
        400,
        "New password must be at least 6 characters long"
      );
    }

    const targetAdmin = await Admin.findById(targetAdminId);

    if (!targetAdmin) {
      throw new ApiError(404, "Admin not found");
    }

    // Permission checks
    if (currentAdmin.role === "administrator") {
      // Administrator can change anyone's password without current password
    } else if (currentAdmin.role === "city_admin") {
      // City admin can change passwords of users in their city
      if (
        targetAdmin.role !== "user" ||
        targetAdmin.city !== currentAdmin.city
      ) {
        throw new ApiError(
          403,
          "You can only update passwords of users in your city"
        );
      }
      // City admin needs current password to change their own
      if (targetAdmin._id.toString() === currentAdmin._id.toString()) {
        if (!currentPassword) {
          throw new ApiError(400, "Current password is required");
        }
        const isPasswordCorrect = await bcrypt.compare(
          currentPassword,
          targetAdmin.password
        );
        if (!isPasswordCorrect) {
          throw new ApiError(401, "Current password is incorrect");
        }
      }
    } else if (currentAdmin.role === "user") {
      // Users can only change their own password with current password
      if (targetAdmin._id.toString() !== currentAdmin._id.toString()) {
        throw new ApiError(403, "You can only update your own password");
      }
      if (!currentPassword) {
        throw new ApiError(400, "Current password is required");
      }
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        targetAdmin.password
      );
      if (!isPasswordCorrect) {
        throw new ApiError(401, "Current password is incorrect");
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    targetAdmin.password = hashedPassword;
    await targetAdmin.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error.message);
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// Get all admins (with filtering based on role)
export const getAllAdmins = async (req, res) => {
  try {
    const currentAdmin = req.admin;
    const { role, city, status } = req.query;

    let query = {};

    // 🧠 Role-based filtering logic
    if (currentAdmin.role === "administrator") {
      // Administrator can see everyone
      if (role) query.role = role;
      if (city) query.city = city;
      if (status) query.status = status;
    } else if (currentAdmin.role === "city_admin") {
      // City admin can only see users in their city
      query.city = currentAdmin.city;
      query.role = "user";
    } else if (currentAdmin.role === "user") {
      // Users can only see themselves
      query._id = currentAdmin._id;
    } else {
      throw new ApiError(403, "Access denied");
    }

    const admins = await Admin.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.log("❌ getAllAdmins Error:", error.message);
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// Get single admin by ID
export const getAdminById = async (req, res) => {
  try {
    const targetAdminId = req.params.id;
    const currentAdmin = req.admin;

    const targetAdmin = await Admin.findById(targetAdminId).select("-password");

    if (!targetAdmin) {
      throw new ApiError(404, "Admin not found");
    }

    // Permission checks
    if (currentAdmin.role === "administrator") {
      // Administrator can view anyone
    } else if (currentAdmin.role === "city_admin") {
      // City admin can view users in their city and themselves
      if (
        targetAdmin._id.toString() !== currentAdmin._id.toString() &&
        (targetAdmin.role !== "user" || targetAdmin.city !== currentAdmin.city)
      ) {
        throw new ApiError(403, "Access denied");
      }
    } else if (currentAdmin.role === "user") {
      // Users can only view themselves
      if (targetAdmin._id.toString() !== currentAdmin._id.toString()) {
        throw new ApiError(403, "Access denied");
      }
    }

    res.json({
      success: true,
      adminData: targetAdmin,
    });
  } catch (error) {
    console.log(error.message);
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// Delete admin (only administrator)
export const deleteAdmin = async (req, res) => {
  try {
    const targetAdminId = req.params.id;
    const currentAdmin = req.admin;

    if (currentAdmin.role !== "administrator") {
      throw new ApiError(403, "Only administrators can delete accounts");
    }

    const targetAdmin = await Admin.findById(targetAdminId);

    if (!targetAdmin) {
      throw new ApiError(404, "Admin not found");
    }

    // Prevent deleting the last administrator
    if (targetAdmin.role === "administrator") {
      const adminCount = await Admin.countDocuments({ role: "administrator" });
      if (adminCount <= 1) {
        throw new ApiError(400, "Cannot delete the last administrator account");
      }
    }

    await Admin.findByIdAndDelete(targetAdminId);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.log(error.message);
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
