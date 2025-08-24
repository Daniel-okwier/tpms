import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';

const router = express.Router();

// Create appointment (Doctors, Nurses)
router.post('/', protect, authorizeRoles('doctor', 'nurse'), createAppointment);

// Get all appointments (Admin, Doctor, Nurse)
router.get('/', protect, authorizeRoles('admin', 'doctor', 'nurse'), getAppointments);

// Get single appointment (Admin, Doctor, Nurse, Patient)
router.get('/:id', protect, authorizeRoles('admin', 'doctor', 'nurse', 'patient'), getAppointmentById);

// Update appointment (Doctors, Nurses)
router.put('/:id', protect, authorizeRoles('doctor', 'nurse'), updateAppointment);

// Delete appointment (Admin)
router.delete('/:id', protect, authorizeRoles('admin'), deleteAppointment);

export default router;
