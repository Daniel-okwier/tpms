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

// Create screening
router.post('/', protect, authorize('nurse', 'doctor'), createScreening);

// List screenings (with filters, pagination, search)
router.get('/', protect, getScreenings);

// Soft void 
router.post('/:id/void', protect, authorize('doctor','nurse'), voidScreening);

// Get single screening
router.get('/:id', protect, getScreeningById);

// Update screening
router.put('/:id', protect, authorize('nurse', 'doctor'), updateScreening);

// Hard delete (doctors only)
router.delete('/:id', protect, authorize('doctor', 'nurse',), deleteScreening);

// Screenings for a specific patient (staff only)
router.get('/patient/:patientId', protect, authorize('nurse', 'doctor'), getScreeningsByPatient);

export default router;
