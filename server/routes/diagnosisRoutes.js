import express from 'express';
import {
  createDiagnosis,
  getDiagnoses,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis,
} from '../controllers/diagnosisController.js';
import { protect, authorizeRoles as authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create diagnosis (doctor/admin only)
router.post('/', protect, authorize('doctor', 'admin','nurse'), createDiagnosis);

// Get all diagnoses (staff only)
router.get('/', protect, authorize('nurse', 'doctor', 'admin'), getDiagnoses);

// Get a single diagnosis (staff only)
router.get('/:id', protect, authorize('nurse', 'doctor', 'admin'), getDiagnosisById);

// Update diagnosis (doctor/admin only)
router.put('/:id', protect, authorize('doctor', 'admin','nurse'), updateDiagnosis);

// Delete diagnosis (admin only)
router.delete('/:id', protect, authorize('admin','nurse'), deleteDiagnosis);

export default router;
