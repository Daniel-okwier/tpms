import LabTest from '../models/labTest.js';
import Patient from '../models/patient.js';
import ErrorResponse from '../utils/errorResponse.js';

const isPatientOwner = async (userId, patientId) => {
  const patient = await Patient.findById(patientId).populate('createdBy');
  if (!patient) return false;
  return patient.createdBy?._id.toString() === userId.toString();
};

export const createLabTestService = async (data, user) => {
  const patientExists = await Patient.findById(data.patient);
  if (!patientExists) throw new ErrorResponse('Patient not found', 404);

  return await LabTest.create({ ...data, orderedBy: user._id });
};

export const getLabTestsService = async (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.testType) query.testType = filters.testType;

  let tests = await LabTest.find(query)
    .populate('patient', 'firstName lastName mrn')
    .populate('orderedBy', 'name role')
    .sort({ orderDate: -1 });

  // Apply search filter after population (since patient is a reference)
  if (filters.q) {
    const q = filters.q.toLowerCase();
    tests = tests.filter(
      (t) =>
        t.patient?.firstName?.toLowerCase().includes(q) ||
        t.patient?.lastName?.toLowerCase().includes(q) ||
        t.patient?.mrn?.toLowerCase().includes(q) ||
        t.patient?._id?.toString().includes(q)
    );
  }

  return tests;
};

export const getLabTestByIdService = async (id, user) => {
  const test = await LabTest.findById(id)
    .populate('patient', 'firstName lastName mrn createdBy')
    .populate('orderedBy', 'name role');

  if (!test) throw new ErrorResponse('Lab test not found', 404);

  if (user.role === 'patient') {
    const ownsRecord = await isPatientOwner(user._id, test.patient._id);
    if (!ownsRecord) throw new ErrorResponse('Not authorized', 403);
  }

  return test;
};

export const updateLabTestService = async (id, updates, user) => {
  const test = await LabTest.findById(id);
  if (!test) throw new ErrorResponse('Lab test not found', 404);

  Object.assign(test, updates);
  if (updates.status === 'verified') {
    test.verifiedBy = user._id;
    test.verifiedAt = Date.now();
  }

  await test.save();
  return test;
};

export const deleteLabTestService = async (id) => {
  const test = await LabTest.findByIdAndDelete(id);
  if (!test) throw new ErrorResponse('Lab test not found', 404);
  return test;
};
