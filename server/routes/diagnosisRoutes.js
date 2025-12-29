import express from 'express';
const router = express.Router();

import { 
    getDiagnoses, 
    getDiagnosisById, 
    createDiagnosis, 
    updateDiagnosis, 
    deleteDiagnosis 
} from '../controllers/diagnosisController.js'; 

import { protect, authorizeRoles as authorize } from '../middleware/authMiddleware.js';

// --- Endpoints mapped to Controller functions ---

// Get all diagnoses (accessible by any logged-in staff)
router.get('/', protect, getDiagnoses);

// Create a diagnosis (doctors/admins)
router.post('/', protect, authorize('doctor', 'admin'), createDiagnosis);

// Get single diagnosis by ID
router.get('/:id', protect, getDiagnosisById);

// Update diagnosis (doctors/admins)
router.put('/:id', protect, authorize('doctor', 'admin'), updateDiagnosis);

// Delete diagnosis (admins only)
router.delete('/:id', protect, authorize('admin','doctor'), deleteDiagnosis);

export default router;