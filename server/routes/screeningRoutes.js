import express from 'express';
import {
  createScreening,
  getScreenings,
  getScreeningById,
  updateScreening,
  voidScreening,
  deleteScreening,
  getScreeningsByPatient,
} from '../controllers/screeningController.js';
import { protect, authorizeRoles as authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create
router.post('/', protect, authorize('nurse', 'doctor'), createScreening);

// List (with filters/pagination) — staff
router.get('/', protect, getScreenings);

// Get one
router.get('/:id', protect, getScreeningById);

// Update
router.put('/:id', protect, authorize('nurse', 'doctor'), updateScreening);

// Soft void (doctors)
router.post('/:id/void', protect, authorize('doctor'), voidScreening);

// Hard delete (doctors)
router.delete('/:id', protect, authorize('doctor'), deleteScreening);

// Screenings for a specific patient (staff)
router.get('/patient/:patientId', protect, authorize('nurse', 'doctor'), getScreeningsByPatient);

export default router;
