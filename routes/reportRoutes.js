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

// Individual reports (optional, can still be used for detailed pages)
router.get('/patient-stats', protect, authorizeRoles('admin', 'doctor'), getPatientStats);
router.get('/treatment-outcomes', protect, authorizeRoles('admin', 'doctor'), getTreatmentOutcomes);
router.get('/lab-summary', protect, authorizeRoles('admin', 'doctor', 'lab_staff'), getLabSummary);
router.get('/appointments', protect, authorizeRoles('admin', 'doctor', 'nurse'), getAppointmentMetrics);

// Trends (previous endpoint for charts)
router.get('/trends', protect, authorizeRoles('admin', 'doctor'), getTrends);

// Aggregated hospital dashboard (new endpoint)
router.get('/full-dashboard', protect, authorizeRoles('admin', 'doctor'), getFullDashboard);

export default router;
