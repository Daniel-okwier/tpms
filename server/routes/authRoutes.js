// routes/authRoutes.js
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

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);

// Internal reset flow
router.post('/forgot-password', requestPasswordReset);   // verify email exists
router.post('/reset-password-direct', resetPasswordDirect); // reset with new password

// Protected
router.get('/profile', protect, getUserProfile);

// Admin only
router.post('/create-user', protect, adminOnly, adminCreateUser);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, updateUser);
router.get('/users/:id', protect, adminOnly, getUserById);
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;
