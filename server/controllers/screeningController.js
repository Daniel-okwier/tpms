import {
  createScreeningService,
  getScreeningsService,
  getScreeningByIdService,
  updateScreeningService,
  voidScreeningService,
  deleteScreeningService,
  getScreeningsByPatientService,
} from "../services/screeningService.js";

// Create a screening
export const createScreening = async (req, res) => {
  try {
    const screening = await createScreeningService({
      data: req.body,
      userId: req.user._id,
    });
    res.status(201).json(screening);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all screenings (with filters & search)
export const getScreenings = async (req, res) => {
  try {
    const result = await getScreeningsService(req.user, req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single screening by ID
export const getScreeningById = async (req, res) => {
  try {
    const screening = await getScreeningByIdService(req.params.id, req.user);
    res.json(screening);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Update screening
export const updateScreening = async (req, res) => {
  try {
    const updated = await updateScreeningService(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Soft-void screening
export const voidScreening = async (req, res) => {
  try {
    const { reason } = req.body;
    const voided = await voidScreeningService(
      req.params.id,
      reason,
      req.user._id
    );
    res.json(voided);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Hard delete screening

export const deleteScreening = async (req, res) => {
  try {
    const deleted = await deleteScreeningService(req.params.id);
    res.json(deleted);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


// Get screenings for a specific patient

export const getScreeningsByPatient = async (req, res) => {
  try {
    const screenings = await getScreeningsByPatientService(
      req.params.patientId
    );
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};