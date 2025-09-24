import {
  createScreeningService,
  getScreeningsService,
  getScreeningByIdService,
  updateScreeningService,
  voidScreeningService,
  getScreeningsByPatientService
} from '../services/screeningService.js';

// Create a screening
export const createScreening = async (req, res) => {
  try {
    const screening = await createScreeningService({
      data: req.body,
      userId: req.user._id
    });
    res.status(201).json({ success: true, data: screening });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create screening' });
  }
};

// Get screenings
export const getScreenings = async (req, res) => {
  try {
    const screenings = await getScreeningsService(req.user, req.query);
    res.json({ success: true, data: screenings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch screenings' });
  }
};

// Get single screening
export const getScreeningById = async (req, res) => {
  try {
    const screening = await getScreeningByIdService(req.params.id, req.user);
    res.json({ success: true, data: screening });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch screening' });
  }
};

// Update screening
export const updateScreening = async (req, res) => {
  try {
    const screening = await updateScreeningService(req.params.id, req.body);
    res.json({ success: true, data: screening });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update screening' });
  }
};

// Void screening
export const voidScreening = async (req, res) => {
  try {
    const result = await voidScreeningService(req.params.id, req.body.reason, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to void screening' });
  }
};

// Get screenings by patient
export const getScreeningsByPatient = async (req, res) => {
  try {
    const screenings = await getScreeningsByPatientService(req.params.patientId);
    res.json({ success: true, data: screenings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch patient screenings' });
  }
};
