import express from 'express';
import {
  createDiagnosis,
  getDiagnoses,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis
} from '../controllers/diagnosisController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createDiagnosis);
router.get('/', protect, getDiagnoses);
router.get('/:id', protect, getDiagnosisById);
router.put('/:id', protect, updateDiagnosis);
router.delete('/:id', protect, deleteDiagnosis);

export default router;
