import asyncHandler from "../middleware/asyncHandler.js";
import {
  createPatientService,
  getActivePatientsService,
  searchPatientService,
  updatePatientService,
  archivePatientService,
  getArchivedPatientsService,
} from "../services/patientService.js";

// Create new patient
// POST /api/patients
export const createPatient = asyncHandler(async (req, res) => {
  const patient = await createPatientService(req.body, req.user);
  res.status(201).json({ success: true, data: patient });
});

// Get all active patients (with pagination)
// GET /api/patients?page=1&limit=20
export const getPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await getActivePatientsService(Number(page), Number(limit));
  res.json({ success: true, ...result });
});

// Search patients by MRN, name, or phone
// GET /api/patients/search?name=John
export const searchPatient = asyncHandler(async (req, res) => {
  const patients = await searchPatientService(req.query);
  res.json({ success: true, data: patients });
});

// Update patient
// PUT /api/patients/:id
export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await updatePatientService(req.params.id, req.body);
  res.json({ success: true, data: patient });
});

// Archive patient (soft delete)
// DELETE /api/patients/:id
export const archivePatient = asyncHandler(async (req, res) => {
  const patient = await archivePatientService(req.params.id);
  res.json({
    success: true,
    message: "Patient archived successfully",
    data: patient,
  });
});

// Get archived patients (with pagination)
// GET /api/patients/archived?page=1&limit=20
export const getArchivedPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await getArchivedPatientsService(Number(page), Number(limit));
  res.json({ success: true, ...result });
});
