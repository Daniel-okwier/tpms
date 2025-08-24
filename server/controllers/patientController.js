import asyncHandler from '../middleware/asyncHandler.js';
import {
  createPatientService,
  getActivePatientsService,
  searchPatientService,
  updatePatientService,
  archivePatientService,
  getArchivedPatientsService
} from '../services/patientService.js';

// Create new patient
// @route   POST /api/patients
// @access  Doctor/Nurse/Admin
export const createPatient = asyncHandler(async (req, res) => {
  const patient = await createPatientService(req.body, req.user);
  res.status(201).json({ success: true, data: patient });
});

// Get all active patients
// @route   GET /api/patients
// @access  Doctor/Nurse/Admin
export const getPatients = asyncHandler(async (req, res) => {
  const patients = await getActivePatientsService();
  res.json({ success: true, data: patients });
});

// Search patient by MRN (exact) or Name (partial)
// @route   GET /api/patients/search
// @access  Doctor/Nurse/Admin/Patient
export const searchPatient = asyncHandler(async (req, res) => {
  const patient = await searchPatientService(req.query);
  res.json({ success: true, data: patient });
});

// Update patient
// @route   PUT /api/patients/:id
// @access  Doctor/Admin
export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await updatePatientService(req.params.id, req.body);
  res.json({ success: true, data: patient });
});

// Archive patient (soft delete)
// @route   DELETE /api/patients/:id
// @access  Admin
export const archivePatient = asyncHandler(async (req, res) => {
  const patient = await archivePatientService(req.params.id);
  res.json({ success: true, message: 'Patient archived successfully', data: patient });
});

// Get all archived patients
// @route   GET /api/patients/archived
// @access  Doctor/Admin
export const getArchivedPatients = asyncHandler(async (req, res) => {
  const patients = await getArchivedPatientsService();
  res.json({ success: true, data: patients });
});
