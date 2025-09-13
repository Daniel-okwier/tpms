import * as authService from "../services/authService.js";

// -------------------------
// User self-registration (optional)
// -------------------------
export const registerUser = async (req, res) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// -------------------------
// Login user
// -------------------------
export const loginUser = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

// -------------------------
// Get user profile
// -------------------------
export const getUserProfile = async (req, res) => {
  try {
    const data = await authService.getProfile(req.user._id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// -------------------------
// Admin creates staff user
// -------------------------
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await authService.adminCreateUser({ name, email, role });

    res.status(201).json({
      message: "User created successfully. User must set password internally.",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// -------------------------
// Internal password reset (step 1: verify email)
// -------------------------
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await authService.findUserByEmail(email);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Email verified. You can reset your password now." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// -------------------------
// Internal password reset (step 2: set new password directly)
// -------------------------
export const resetPasswordDirect = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.resetPasswordDirect(email, password);

    res.json({ message: "Password reset successful. You can log in now.", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// -------------------------
// Get all users (admin only)
// -------------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------------
// Update a user (admin only)
// -------------------------
export const updateUser = async (req, res) => {
  try {
    const updated = await authService.updateUser(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// -------------------------
// Delete a user (admin only)
// -------------------------
export const deleteUser = async (req, res) => {
  try {
    const result = await authService.deleteUser(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
