import Patient from '../models/patient.js';
import ErrorResponse from '../utils/errorResponse.js';

// Create a new patient
export const createPatientService = async (data, user) => {
  try {
    return await Patient.create({ ...data, createdBy: user._id });
  } catch (err) {
    // Handle duplicate MRN error
    if (err.code === 11000 && err.keyValue.mrn) {
      throw new ErrorResponse(`MRN "${err.keyValue.mrn}" already exists`, 400);
    }
    throw err;
  }
};

// Get all active patients
export const getActivePatientsService = async () => {
  return await Patient.find({ archived: false }).populate('createdBy', 'name email role');
};

// Search patient by MRN (exact) or Name (partial)
export const searchPatientService = async ({ mrn, name }) => {
  let query = { archived: false };

  if (mrn) {
    query.mrn = mrn; // exact match
    const patient = await Patient.findOne(query).populate('createdBy', 'name email role');
    if (!patient) throw new ErrorResponse('Patient not found', 404);
    return patient; // single patient if MRN is used
  } 

  if (name) {
    // partial match on firstName or lastName
    query.$or = [
      { firstName: { $regex: name, $options: 'i' } },
      { lastName: { $regex: name, $options: 'i' } }
    ];
    const patients = await Patient.find(query).populate('createdBy', 'name email role');
    if (patients.length === 0) throw new ErrorResponse('No patients found', 404);
    return patients; // array of matching patients
  }

  throw new ErrorResponse('Please provide MRN or name to search', 400);
};

// Update patient
export const updatePatientService = async (id, updates) => {
  const patient = await Patient.findOneAndUpdate({ _id: id, archived: false }, updates, { new: true });
  if (!patient) throw new ErrorResponse('Patient not found or archived', 404);
  return patient;
};

// Archive (soft delete) a patient
export const archivePatientService = async (id) => {
  const patient = await Patient.findByIdAndUpdate(id, { archived: true }, { new: true });
  if (!patient) throw new ErrorResponse('Patient not found', 404);
  return patient;
};

// Get all archived patients
export const getArchivedPatientsService = async () => {
  return await Patient.find({ archived: true }).populate('createdBy', 'name email role');
};
