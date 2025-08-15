import express from 'express';
import {
  upsertDose,
  getAdherenceByPatient,
  verifyDose,
  voidDose,
  getMissedDoses,
  adherenceSummary,
  triggerReminder
} from '../controllers/adherenceController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create or update a dose entry
router.post('/', protect, upsertDose);

// Get logs (staff can pass patientId, patient sees own)
router.get('/', protect, getAdherenceByPatient);

// Verify a dose (doctor/nurse)
router.post('/:id/verify', protect, authorizeRoles('doctor','nurse','admin'), verifyDose);

// Void a dose (doctor/admin)
router.post('/:id/void', protect, authorizeRoles('doctor','admin'), voidDose);

// Missed doses (for outreach)
router.get('/missed', protect, authorizeRoles('doctor','nurse','admin'), getMissedDoses);

// Summary
router.get('/summary', protect, adherenceSummary);

// Trigger reminder for patient (staff)
router.post('/:patientId/remind', protect, authorizeRoles('doctor','nurse','admin'), triggerReminder);

export default router;
