import express from 'express';
import {
  createDiagnosis,
  getDiagnoses,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis
} from '../controllers/diagnosisController.js';
import { protect, authorizeRoles as authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create diagnosis (doctor/admin only)
router.post('/', protect, authorize('doctor', 'admin'), createDiagnosis);

// Get all diagnoses (staff only)
router.get('/', protect, authorize('nurse', 'doctor', 'admin'), getDiagnoses);

// Get a single diagnosis (staff only)
router.get('/:id', protect, authorize('nurse', 'doctor', 'admin'), getDiagnosisById);

// Update diagnosis (doctor/admin only)
router.put('/:id', protect, authorize('doctor', 'admin'), updateDiagnosis);

// Delete diagnosis (doctor/admin only)
router.delete('/:id', protect, authorize('doctor', 'admin'), deleteDiagnosis);

export default router;
