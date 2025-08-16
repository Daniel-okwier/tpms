import asyncHandler from '../middleware/asyncHandler.js';
import { getTrendsService, getDashboardDataService } from '../services/reportService.js';

/**
 * @desc Get patient stats (total, active, completed, defaulted)
 * @route GET /api/reports/patient-stats
 * @access Admin, Doctor
 */
export const getPatientStats = asyncHandler(async (req, res) => {
  const result = await getDashboardDataService(req.query);
  res.status(200).json({ success: true, patients: result.data.patients });
});

/**
 * @desc Get treatment outcomes (ongoing, completed, failed)
 * @route GET /api/reports/treatment-outcomes
 * @access Admin, Doctor
 */
export const getTreatmentOutcomes = asyncHandler(async (req, res) => {
  const result = await getDashboardDataService(req.query);
  res.status(200).json({ success: true, treatments: result.data.treatments });
});

/**
 * @desc Get lab test summary
 * @route GET /api/reports/lab-summary
 * @access Admin, Doctor, Lab Staff
 */
export const getLabSummary = asyncHandler(async (req, res) => {
  const result = await getDashboardDataService(req.query);
  res.status(200).json({ success: true, labTests: result.data.labTests });
});

/**
 * @desc Get appointment metrics (total, upcoming, past)
 * @route GET /api/reports/appointments
 * @access Admin, Doctor, Nurse
 */
export const getAppointmentMetrics = asyncHandler(async (req, res) => {
  const result = await getDashboardDataService(req.query);
  res.status(200).json({ success: true, appointments: result.data.appointments });
});

/**
 * @desc Get monthly/weekly trends for TB dashboard
 * @route GET /api/reports/trends
 * @access Admin, Doctor
 */
export const getTrends = asyncHandler(async (req, res) => {
  const { period } = req.query;
  const result = await getTrendsService(period);
  res.status(200).json({ success: true, ...result });
});

/**
 * @desc Get full aggregated dashboard data
 * @route GET /api/reports/full-dashboard
 * @access Admin, Doctor
 */
export const getFullDashboard = asyncHandler(async (req, res) => {
  const result = await getDashboardDataService(req.query);
  res.status(200).json({ success: true, ...result });
});
