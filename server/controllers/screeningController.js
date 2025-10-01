import asyncHandler from '../middleware/asyncHandler.js';
import {
  createScreeningService,
  getScreeningsService,
  getScreeningByIdService,
  updateScreeningService,
  voidScreeningService,
  deleteScreeningService,
  getScreeningsByPatientService,
} from '../services/screeningService.js';

// Create a screening
export const createScreening = asyncHandler(async (req, res) => {
  const screening = await createScreeningService({ data: req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: screening });
});

// Get screenings (list with optional query params)
export const getScreenings = asyncHandler(async (req, res) => {
  const { page, limit, q, status, outcome } = req.query;
  const result = await getScreeningsService(req.user, { page, limit, q, status, outcome });
  // result: { data: [...], count }
  res.status(200).json({ success: true, count: result.count, data: result.data });
});

// Get single screening by ID
export const getScreeningById = asyncHandler(async (req, res) => {
  const screening = await getScreeningByIdService(req.params.id, req.user);
  res.status(200).json({ success: true, data: screening });
});

// Update screening
export const updateScreening = asyncHandler(async (req, res) => {
  const screening = await updateScreeningService(req.params.id, req.body);
  res.status(200).json({ success: true, data: screening });
});

// Soft-void screening (keeps record, marks voided)
export const voidScreening = asyncHandler(async (req, res) => {
  const screening = await voidScreeningService(req.params.id, req.body.reason, req.user._id);
  res.status(200).json({ success: true, data: screening });
});

// Hard delete screening
export const deleteScreening = asyncHandler(async (req, res) => {
  const deleted = await deleteScreeningService(req.params.id);
  res.status(200).json({ success: true, message: 'Screening deleted', data: deleted });
});

// Get screenings by patient (staff)
export const getScreeningsByPatient = asyncHandler(async (req, res) => {
  const screenings = await getScreeningsByPatientService(req.params.patientId);
  res.status(200).json({ success: true, data: screenings });
});
