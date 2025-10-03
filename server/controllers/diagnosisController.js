import {
  createDiagnosisService,
  getDiagnosesService,
  getDiagnosisByIdService,
  updateDiagnosisService,
  deleteDiagnosisService
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

    res.status(201).json({ success: true, data: diagnosis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create diagnosis', error: error.message });
  }
};

// Get all diagnoses
export const getDiagnoses = async (req, res) => {
  try {
    const diagnoses = await getDiagnosesService();
    res.json({ success: true, data: diagnoses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch diagnoses', error: error.message });
  }
};

// Get single diagnosis by ID
export const getDiagnosisById = async (req, res) => {
  try {
    const diagnosis = await getDiagnosisByIdService(req.params.id);
    res.json({ success: true, data: diagnosis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch diagnosis', error: error.message });
  }
};

// Update diagnosis (doctors/admins)
export const updateDiagnosis = async (req, res) => {
  try {
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only doctors or admins can update diagnosis.' });
    }

    const diagnosis = await updateDiagnosisService(req.params.id, req.body);
    res.json({ success: true, data: diagnosis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update diagnosis', error: error.message });
  }
};

// Delete diagnosis (admins only)
export const deleteDiagnosis = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete diagnosis records' });
    }

    const result = await deleteDiagnosisService(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete diagnosis', error: error.message });
  }
};