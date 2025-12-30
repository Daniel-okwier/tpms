import asyncHandler from "../middleware/asyncHandler.js";
import {
  createPatientService,
  getActivePatientsService,
  searchPatientService,
  updatePatientService,
  archivePatientService,
  getArchivedPatientsService,
  getPatientByIdService, // Import the new service
} from "../services/patientService.js";

// ADD THIS: Get single patient
export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await getPatientByIdService(req.params.id);
  res.json({ success: true, data: patient });
});

// UPDATED: Search patients
export const searchPatient = asyncHandler(async (req, res) => {
  // Pass req.query directly to the service
  const patients = await searchPatientService(req.query);
  res.json({ success: true, data: patients });
});

// ... keep other controllers (createPatient, getPatients, updatePatient, archivePatient, getArchivedPatients)
export const createPatient = asyncHandler(async (req, res) => {
  const patient = await createPatientService(req.body, req.user);
  res.status(201).json({ success: true, data: patient });
});

export const getPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await getActivePatientsService(Number(page), Number(limit));
  res.json({ success: true, ...result });
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await updatePatientService(req.params.id, req.body);
  res.json({ success: true, data: patient });
});

export const archivePatient = asyncHandler(async (req, res) => {
  const patient = await archivePatientService(req.params.id);
  res.json({ success: true, message: "Patient archived", data: patient });
});

export const getArchivedPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await getArchivedPatientsService(Number(page), Number(limit));
  res.json({ success: true, ...result });
});