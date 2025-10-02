
import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// Register a new user

export const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");

  const user = await User.create({ name, email, password, role });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
    token: generateToken(user._id, user.role),
  };
};

// Login user

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new Error("Invalid email or password");
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
    token: generateToken(user._id, user.role),
  };
};

// Get user profile
export const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

// Admin creates staff user

export const adminCreateUser = async ({ name, email, role }) => {
  if (!["doctor", "nurse", "lab_staff", "admin"].includes(role)) {
    throw new Error("Invalid role");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  // Create user without password initially
  const user = await User.create({
    name,
    email,
    role,
    password: crypto.randomBytes(12).toString("hex"), 
    mustChangePassword: true,
  });

  return user;
};

// Find user by email (for password reset step 1)
export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// Reset password directly (step 2)
export const resetPasswordDirect = async (email, newPassword) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
};

// Get all users (admin only)
export const getAllUsers = async () => {
  return await User.find().select("-password");
};

// Update a user (admin only)
export const updateUser = async (id, updates) => {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found");

  Object.assign(user, updates);
  await user.save();

  return user;
};

// Delete a user (admin only)

export const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found");

  await user.deleteOne();
  return { message: "User removed" };
};


