import { genrateToken } from "../config/userjwt.js";
import User from "../models/model.user.js";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";

// Sign up new user
export const userSignup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      throw new ApiError(400, "Missing Details");
    }

    const user = await User.findOne({ email });
    if (user) {
      throw new ApiError(409, "Account already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = genrateToken(newUser._id);

    res.json({
      success: true,
      userData: newUser,
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

// Login the user
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Missing login details");
    }

    const userData = await User.findOne({ email });
    if (!userData) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = genrateToken(userData._id);

    // ✅ Set token as cookie (valid for 3 days)
    res.cookie("token", token, {
      httpOnly: true, // prevent JS access (secure)
      secure: process.env.NODE_ENV === "production", // send only over HTTPS in production
      sameSite: "strict", // protect against CSRF
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    res.json({
      success: true,
      userData,
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

// Check user is authenticated
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// Update the user profile (only fullName and/or password)
export const updateUSer = async (req, res) => {
  try {
    const { fullName, password } = req.body;
    const userId = req.user._id;

    if (!fullName && !password) {
      throw new ApiError(400, "No update fields provided");
    }

    let updateFields = {};

    if (fullName) updateFields.fullName = fullName;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    res.json({ success: true, user: updatedUser });
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
