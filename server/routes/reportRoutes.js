import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getPatientStats,
  getTreatmentOutcomes,
  getLabSummary,
  getAppointmentMetrics,
  getTrends,
  getFullDashboard
} from '../controllers/reportController.js';

const router = express.Router();

// Patient stats
router.get('/patient-stats', protect, authorizeRoles('admin', 'doctor'), getPatientStats);

// Treatment outcomes
router.get('/treatment-outcomes', protect, authorizeRoles('admin', 'doctor'), getTreatmentOutcomes);

// Lab test summary
router.get('/lab-summary', protect, authorizeRoles('admin', 'doctor', 'lab_staff'), getLabSummary);

// Appointment metrics
router.get('/appointments', protect, authorizeRoles('admin', 'doctor', 'nurse'), getAppointmentMetrics);

// Trends
router.get('/trends', protect, authorizeRoles('admin', 'doctor'), getTrends);

// Full aggregated dashboard
router.get('/full-dashboard', protect, authorizeRoles('admin', 'doctor'), getFullDashboard);

export default router;
