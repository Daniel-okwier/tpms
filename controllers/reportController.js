import asyncHandler from '../middleware/asyncHandler.js';
import { getTrendsService, getDashboardDataService } from '../services/reportService.js';
import Report from '../models/report.js';

/**
 * @desc Save generated report to DB
 */
const saveReport = async (userId, type, filters, data) => {
  const report = new Report({
    reportType: type,
    generatedBy: userId,
    filters,
    data
  });
  await report.save();
};

/**
 * @desc Get patient stats
 */
export const getPatientStats = asyncHandler(async (req, res) => {
  const result = await getDashboardDataService(req.query);
  await saveReport(req.user._id, 'patientStats', req.query, result.data.patients);
  res.status(200).json({ success: true, patients: result.data.patients });
});

/**
 * @desc Get treatment outcomes
 */
export const getTreatmentOutcomes = asyncHandler(async (req, res) => {
  const result = await getDashboardDataService(req.query);
  await saveReport(req.user._id, 'treatmentOutcomes', req.query, result.data.treatments);
  res.status(200).json({ success: true, treatments: result.data.treatments });
});

/**
 * @desc Get lab test summary
 */
export const getLabSummary = asyncHandler(async (req, res) => {
  const result = await getDashboardDataService(req.query);
  await saveReport(req.user._id, 'labSummary', req.query, result.data.labTests);
  res.status(200).json({ success: true, labTests: result.data.labTests });
});

/**
 * @desc Get appointment metrics
 */
export const getAppointmentMetrics = asyncHandler(async (req, res) => {
  const result = await getDashboardDataService(req.query);
  await saveReport(req.user._id, 'appointmentMetrics', req.query, result.data.appointments);
  res.status(200).json({ success: true, appointments: result.data.appointments });
});

/**
 * @desc Get trends
 */
export const getTrends = asyncHandler(async (req, res) => {
  const { period } = req.query;
  const result = await getTrendsService(period);
  await saveReport(req.user._id, 'trends', req.query, result.data);
  res.status(200).json({ success: true, ...result });
});

/**
 * @desc Get full aggregated dashboard
 */
export const getFullDashboard = asyncHandler(async (req, res) => {
  const result = await getDashboardDataService(req.query);
  await saveReport(req.user._id, 'fullDashboard', req.query, result.data);
  res.status(200).json({ success: true, ...result });
});
