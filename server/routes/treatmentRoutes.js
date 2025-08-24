import express from 'express';
import {
  createTreatment,
  getTreatments,
  getTreatmentById,
  updateTreatment,
  addFollowUp,
  completeTreatment,
  archiveTreatment
} from '../controllers/treatmentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create/initiate treatment — doctors/admins only
router.post('/', protect, authorizeRoles('doctor','admin'), createTreatment);

// Get all (staff) or patient-scoped
router.get('/', protect, authorizeRoles('doctor','nurse','admin','patient'), getTreatments);

// Get single treatment
router.get('/:id', protect, authorizeRoles('doctor','nurse','admin','patient'), getTreatmentById);

// Update treatment (doctor/admin for major changes)
router.put('/:id', protect, authorizeRoles('doctor','admin','nurse'), updateTreatment);

// Add a follow-up (nurse/doctor)
router.post('/:id/follow-up', protect, authorizeRoles('doctor','nurse'), addFollowUp);

// Complete treatment (doctor/admin)
router.post('/:id/complete', protect, authorizeRoles('doctor','admin'), completeTreatment);

// Archive treatment (admin)
router.delete('/:id', protect, authorizeRoles('admin'), archiveTreatment);

export default router;
