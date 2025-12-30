import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  requestPasswordReset,
  resetPasswordDirect,
  adminCreateUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES ---

// Server Wake-up / Health Check (Called by Login.jsx useEffect)
router.get('/status', (req, res) => {
  res.status(200).json({ status: "online", message: "Server is awake" });
});

router.post('/register', registerUser);
router.post('/login', loginUser);

// Internal reset flow
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password-direct', resetPasswordDirect);

// --- PROTECTED ROUTES ---
router.get('/profile', protect, getUserProfile);

// --- ADMIN ONLY ROUTES ---
router.post('/create-user', protect, adminOnly, adminCreateUser);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, updateUser);
router.get('/users/:id', protect, adminOnly, getUserById);
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;