import { genrateToken } from "../config/adminjwt.js";
import Admin from "../models/model.admin.js";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";

// Sign up admin
export const adminSignup = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new ApiError(400, "Missing Details");
    }

    const admin = await Admin.findOne({ email });
    if (admin) {
      throw new ApiError(409, "Account already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await Admin.create({
      email,
      password: hashedPassword,
    });

    const token = genrateToken(newAdmin._id);

    res.json({
      success: true,
      adminData: newAdmin,
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

// Login the admin
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

    const isPasswordCorrect = await bcrypt.compare(
      password,
      adminData.password
    );
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = genrateToken(adminData._id);

    // ✅ Set token as cookie (valid for 7 days)
    res.cookie("token", token, {
      httpOnly: true, // prevent JS access (secure)
      secure: process.env.NODE_ENV === "production", // send only over HTTPS in production
      sameSite: "strict", // protect against CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      adminData,
      token,
      message: "Login successfully",
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

// Check admin is authenticated
export const checkAuth = (req, res) => {
  res.json({ success: true, admin: req.admin });
};

// Logout admin
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "strict",
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
