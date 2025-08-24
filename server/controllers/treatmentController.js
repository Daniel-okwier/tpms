import {
  createTreatmentService,
  getTreatmentsService,
  getTreatmentByIdService,
  updateTreatmentService,
  addFollowUpService,
  completeTreatmentService,
  archiveTreatmentService
} from '../services/treatmentService.js';

//Create a new treatment (doctor/admin only)
 
export const createTreatment = async (req, res) => {
  try {
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { patient, diagnosis, regimen, startDate, weightKg, assignedTo } = req.body;

    const result = await createTreatmentService({
      patientId: patient,
      diagnosisId: diagnosis,
      regimen,
      startDate,
      weightKg,
      assignedTo,
      creatorId: req.user._id
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create treatment' });
  }
};

 //Get all treatments
 
export const getTreatments = async (req, res) => {
  try {
    const treatments = await getTreatmentsService(req.user, req.query);
    res.json(treatments);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch treatments' });
  }
};

//Get treatment by ID
 
export const getTreatmentById = async (req, res) => {
  try {
    const treatment = await getTreatmentByIdService(req.params.id, req.user);
    res.json(treatment);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch treatment' });
  }
};

 //Update treatment
 
export const updateTreatment = async (req, res) => {
  try {
    if (req.user.role === 'patient') return res.status(403).json({ message: 'Not allowed' });

    const treatment = await updateTreatmentService(req.params.id, req.body, req.user.role);
    res.json(treatment);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update treatment' });
  }
};

//Add follow-up entry
 
export const addFollowUp = async (req, res) => {
  try {
    const followUpData = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      recordedBy: req.user._id
    };
    const treatment = await addFollowUpService(req.params.id, followUpData);
    res.json(treatment);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to add follow-up' });
  }
};

//Complete treatment
 
export const completeTreatment = async (req, res) => {
  try {
    if (!['doctor','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only doctor/admin can complete treatment' });
    }

    const treatment = await completeTreatmentService(req.params.id);
    res.json(treatment);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to complete treatment' });
  }
};

//Archive treatment (admin only)
 
export const archiveTreatment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can archive treatments' });

    const treatment = await archiveTreatmentService(req.params.id);
    res.json({ message: 'Treatment archived', treatment });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to archive treatment' });
  }
};
