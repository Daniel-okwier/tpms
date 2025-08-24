import Diagnosis from '../models/diagnosis.js';
import Patient from '../models/patient.js';

// Create a diagnosis
export const createDiagnosisService = async ({ patientId, diagnosisType, notes, diagnosedBy }) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error('Patient not found');

  const diagnosis = await Diagnosis.create({
    patient: patientId,
    diagnosisType,
    notes,
    diagnosedBy
  });

  return diagnosis;
};

// Get all diagnoses
export const getDiagnosesService = async () => {
  return await Diagnosis.find()
    .populate('patient', 'mrn firstName lastName age gender')
    .populate('diagnosedBy', 'name role email');
};

// Get diagnosis by ID
export const getDiagnosisByIdService = async (id) => {
  const diagnosis = await Diagnosis.findById(id)
    .populate('patient', 'mrn firstName lastName age gender')
    .populate('diagnosedBy', 'name role email');

  if (!diagnosis) throw new Error('Diagnosis not found');
  return diagnosis;
};

// Update diagnosis
export const updateDiagnosisService = async (id, updates) => {
  const diagnosis = await Diagnosis.findByIdAndUpdate(id, updates, { new: true });
  if (!diagnosis) throw new Error('Diagnosis not found');
  return diagnosis;
};

// Delete diagnosis
export const deleteDiagnosisService = async (id) => {
  const diagnosis = await Diagnosis.findByIdAndDelete(id);
  if (!diagnosis) throw new Error('Diagnosis not found');
  return { message: 'Diagnosis deleted successfully' };
};
