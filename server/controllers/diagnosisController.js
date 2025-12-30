import {
  createDiagnosisService,
  getDiagnosesService,
  getDiagnosisByIdService,
  updateDiagnosisService,
  deleteDiagnosisService,
} from '../services/diagnosisService.js';

// Create a diagnosis
export const createDiagnosis = async (req, res) => {
  try {
    // RBAC Check
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Doctors/Admins only.' });
    }

    // Map incoming field 'patient' (from frontend) to 'patientId' (for service)
    const patientId = req.body.patient || req.body.patientId;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient selection is required' });
    }

    const diagnosis = await createDiagnosisService({
      patientId: patientId,
      labTests: req.body.labTests || [],
      diagnosisType: req.body.diagnosisType,
      notes: req.body.notes,
      diagnosedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: diagnosis });
  } catch (error) {
    console.error("Diagnosis Create Error:", error);
    res.status(500).json({ success: false, message: error.message || 'Server error during creation' });
  }
};

// Get all diagnoses
export const getDiagnoses = async (req, res) => {
  try {
    const diagnoses = await getDiagnosesService();
    res.json({ success: true, data: diagnoses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch diagnoses' });
  }
};

// Get single diagnosis by ID
export const getDiagnosisById = async (req, res) => {
  try {
    const diagnosis = await getDiagnosisByIdService(req.params.id);
    res.json({ success: true, data: diagnosis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch diagnosis' });
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
    res.status(500).json({ success: false, message: error.message || 'Failed to update diagnosis' });
  }
};

// Delete diagnosis
export const deleteDiagnosis = async (req, res) => {
  try {
    // FIX: Changed from 'admin only' to 'admin and doctor' to match your router
    if (!['admin', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    const result = await deleteDiagnosisService(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Delete failed' });
  }
};
