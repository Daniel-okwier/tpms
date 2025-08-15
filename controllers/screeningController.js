import {
  createScreeningService,
  getScreeningsService,
  getScreeningByIdService,
  updateScreeningService,
  voidScreeningService,
  getScreeningsByPatientService
} from '../services/screeningService.js';

//Create a screening (nurse/doctor)
 
export const createScreening = async (req, res) => {
  try {
    const screening = await createScreeningService({
      data: req.body,
      userId: req.user._id
    });
    res.status(201).json(screening);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create screening' });
  }
};

//Get screenings (staff see all, patient sees own)
 
export const getScreenings = async (req, res) => {
  try {
    const screenings = await getScreeningsService(req.user, req.query);
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch screenings' });
  }
};

// Get single screening by ID
 
export const getScreeningById = async (req, res) => {
  try {
    const screening = await getScreeningByIdService(req.params.id, req.user);
    res.json(screening);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch screening' });
  }
};

// Update screening
 
export const updateScreening = async (req, res) => {
  try {
    const screening = await updateScreeningService(req.params.id, req.body);
    res.json(screening);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update screening' });
  }
};

//Void (soft-delete) screening (doctor/admin)
 
export const voidScreening = async (req, res) => {
  try {
    const result = await voidScreeningService(req.params.id, req.body.reason, req.user._id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to void screening' });
  }
};

// Get screenings by patient (staff only)
 
export const getScreeningsByPatient = async (req, res) => {
  try {
    const screenings = await getScreeningsByPatientService(req.params.patientId);
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch patient screenings' });
  }
};
