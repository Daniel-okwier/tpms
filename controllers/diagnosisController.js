import {
  createDiagnosis as createDiagnosisService,
  getDiagnoses as getDiagnosesService,
  getDiagnosisById as getDiagnosisByIdService,
  updateDiagnosis as updateDiagnosisService,
  deleteDiagnosis as deleteDiagnosisService
} from '../services/diagnosisService.js';

// Create a diagnosis (doctors/admins)
export const createDiagnosis = async (req, res) => {
  try {
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only doctors or admins can create diagnosis.' });
    }

    const diagnosis = await createDiagnosisService({
      patientId: req.body.patient,
      diagnosisType: req.body.diagnosisType,
      notes: req.body.notes,
      diagnosedBy: req.user._id
    });

    res.status(201).json(diagnosis);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create diagnosis', error: error.message });
  }
};

// Get all diagnoses
export const getDiagnoses = async (req, res) => {
  try {
    const diagnoses = await getDiagnosesService();
    res.json(diagnoses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch diagnoses', error: error.message });
  }
};

// Get a single diagnosis by ID
export const getDiagnosisById = async (req, res) => {
  try {
    const diagnosis = await getDiagnosisByIdService(req.params.id);
    res.json(diagnosis);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch diagnosis', error: error.message });
  }
};

// Update a diagnosis (doctors/admins)
export const updateDiagnosis = async (req, res) => {
  try {
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only doctors or admins can update diagnosis.' });
    }

    const diagnosis = await updateDiagnosisService(req.params.id, req.body);
    res.json(diagnosis);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update diagnosis', error: error.message });
  }
};

// Delete a diagnosis (admins only)
export const deleteDiagnosis = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete diagnosis records' });
    }

    const result = await deleteDiagnosisService(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete diagnosis', error: error.message });
  }
};
