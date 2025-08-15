import asyncHandler from '../middleware/asyncHandler.js';
import { getTrendsService, getDashboardDataService } from '../services/reportService.js';

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
 * @desc Get aggregated dashboard data with optional filters
 * @route GET /api/reports/dashboard
 * @access Admin, Doctor
 */
export const getDashboardData = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    treatmentPhase: req.query.treatmentPhase,
    patientStatus: req.query.patientStatus
  };

  const result = await getDashboardDataService(filters);
  res.status(200).json({ success: true, ...result });
});
