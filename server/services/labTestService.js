import LabTest from '../models/labTest.js';
import Patient from '../models/patient.js';
import ErrorResponse from '../utils/errorResponse.js';

// Helper: check if logged-in user is the patient linked to this record
const isPatientOwner = async (userId, patientId) => {
  const patient = await Patient.findById(patientId).populate('createdBy');
  if (!patient) return false;
  return patient.createdBy?._id.toString() === userId.toString();
};

// Create a new lab test order
export const createLabTestService = async (data, user) => {
  const { patient } = data;

  // Validate patient exists
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    throw new ErrorResponse('Patient not found', 404);
  }

  return await LabTest.create({
    ...data,
    orderedBy: user._id
  });
};

// Get all lab tests
export const getLabTestsService = async () => {
  return await LabTest.find()
    .populate('patient', 'name patientId')
    .populate('orderedBy', 'name role')
    .sort({ orderDate: -1 });
};

// Get single lab test by ID
export const getLabTestByIdService = async (id, user) => {
  const test = await LabTest.findById(id)
    .populate('patient', 'name patientId createdBy')
    .populate('orderedBy', 'name role');

  if (!test) {
    throw new ErrorResponse('Lab test not found', 404);
  }

  // Patient privacy check
  if (user.role === 'patient') {
    const ownsRecord = await isPatientOwner(user._id, test.patient._id);
    if (!ownsRecord) {
      throw new ErrorResponse('Not authorized to view this lab test', 403);
    }
  }

  return test;
};

// Update lab test (status, results, etc.)
export const updateLabTestService = async (id, updates, user) => {
  let test = await LabTest.findById(id);
  if (!test) {
    throw new ErrorResponse('Lab test not found', 404);
  }

  // Apply updates
  Object.assign(test, updates);

  // If marking as verified
  if (updates.status === 'verified') {
    test.verifiedBy = user._id;
    test.verifiedAt = Date.now();
  }

  await test.save();
  return test;
};

// Delete lab test
export const deleteLabTestService = async (id) => {
  const test = await LabTest.findById(id);
  if (!test) {
    throw new ErrorResponse('Lab test not found', 404);
  }

  await test.remove();
  return test;
};
