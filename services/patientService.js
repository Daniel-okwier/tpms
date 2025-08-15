import Patient from '../models/patient.js';
import ErrorResponse from '../utils/errorResponse.js';


 //Create a new patient
 
export const createPatientService = async (data, user) => {
  return await Patient.create({
    ...data,
    createdBy: user._id
  });
};


 //Get all active patients
 
export const getActivePatientsService = async () => {
  return await Patient.find({ archived: false })
    .populate('createdBy', 'name email role');
};


  //Search patient by MRN (exact) or Name (partial)
 
export const searchPatientService = async ({ mrn, name }) => {
  let query = { archived: false };

  if (mrn) {
    query.mrn = mrn; // exact match
  } else if (name) {
    query.name = { $regex: name, $options: 'i' }; // partial match
  }

  const patient = await Patient.findOne(query)
    .populate('createdBy', 'name email role');

  if (!patient) {
    throw new ErrorResponse('Patient not found', 404);
  }
  return patient;
};


 //Update patient
 
export const updatePatientService = async (id, updates) => {
  const patient = await Patient.findOneAndUpdate(
    { _id: id, archived: false },
    updates,
    { new: true }
  );

  if (!patient) {
    throw new ErrorResponse('Patient not found or archived', 404);
  }
  return patient;
};


 //Archive (soft delete) a patient
 
export const archivePatientService = async (id) => {
  const patient = await Patient.findByIdAndUpdate(
    id,
    { archived: true },
    { new: true }
  );

  if (!patient) {
    throw new ErrorResponse('Patient not found', 404);
  }
  return patient;
};


 //Get all archived patients
 
export const getArchivedPatientsService = async () => {
  return await Patient.find({ archived: true })
    .populate('createdBy', 'name email role');
};
