import express from 'express';
import {
  createPatient,
  getPatients,
  getArchivedPatients,
  searchPatient,
  updatePatient,
  archivePatient
} from '../controllers/patientController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('admin', 'doctor', 'nurse'), createPatient);
router.get('/', protect, authorizeRoles('admin', 'doctor', 'nurse'), getPatients);
router.get('/search', protect, authorizeRoles('admin', 'doctor', 'nurse', 'patient'), searchPatient);
router.put('/:id', protect, authorizeRoles('admin', 'doctor'), updatePatient);
router.delete('/:id', protect, authorizeRoles('admin'), archivePatient);
router.get('/archived', protect, authorizeRoles('admin', 'doctor'), getArchivedPatients)

export default router;
