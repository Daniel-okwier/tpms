import express from 'express';
import {
  createScreening,
  getScreenings,
  getScreeningById,
  updateScreening,
  voidScreening,
  getScreeningsByPatient
} from '../controllers/screeningController.js';
import { protect, authorizeRoles as authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create
router.post('/', protect, authorize('nurse', 'doctor', 'admin'), createScreening);

// List (with filters) — patients see only theirs; staff can filter
router.get('/', protect, getScreenings);

// Get one
router.get('/:id', protect, getScreeningById);

// Update
router.put('/:id', protect, authorize('nurse', 'doctor', 'admin'), updateScreening);

// Soft void (not hard delete)
router.post('/:id/void', protect, authorize('doctor', 'admin'), voidScreening);

// List screenings for a specific patient (staff only)
router.get('/patient/:patientId', protect, authorize('nurse', 'doctor', 'admin'), getScreeningsByPatient);

export default router;
