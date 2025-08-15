import Diagnosis from '../models/diagnosis.js';
import Patient from '../models/patient.js';

// Create a diagnosis (only doctors/admins)
export const createDiagnosis = async (req, res) => {
  try {
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only doctors or admins can create diagnosis.' });
    }

    const patient = await Patient.findById(req.body.patient);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const diagnosis = await Diagnosis.create({
      patient: req.body.patient,
      diagnosisType: req.body.diagnosisType,
      notes: req.body.notes,
      diagnosedBy: req.user._id
    });

    res.status(201).json(diagnosis);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create diagnosis', error: error.message });
  }
};

//Get all diagnoses
export const getDiagnoses = async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find()
      .populate('patient', 'mrn name age gender')
      .populate('diagnosedBy', 'name role email');

    res.json(diagnoses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch diagnoses', error: error.message });
  }
};

//Get a single diagnosis by ID
export const getDiagnosisById = async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id)
      .populate('patient', 'mrn name age gender')
      .populate('diagnosedBy', 'name role email');

    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    res.json(diagnosis);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch diagnosis', error: error.message });
  }
};

//Update a diagnosis (only doctors/admins)
export const updateDiagnosis = async (req, res) => {
  try {
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only doctors or admins can update diagnosis.' });
    }

    const diagnosis = await Diagnosis.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    res.json(diagnosis);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update diagnosis', error: error.message });
  }
};

//  Delete a diagnosis (only admins)
export const deleteDiagnosis = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete diagnosis records' });
    }

    const diagnosis = await Diagnosis.findByIdAndDelete(req.params.id);

    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    res.json({ message: 'Diagnosis deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete diagnosis', error: error.message });
  }
};
