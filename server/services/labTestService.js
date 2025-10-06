import LabTest from '../models/labTest.js';
import Patient from '../models/patient.js';
import Screening from '../models/screening.js';
import ErrorResponse from '../utils/errorResponse.js';

// Utility to verify ownership for patient users
const isPatientOwner = async (userId, patientId) => {
const patient = await Patient.findById(patientId).populate('createdBy');
if (!patient) return false;
return patient.createdBy?._id.toString() === userId.toString();
};

// Create lab test with automatic screening linking
export const createLabTestService = async (data, user) => {
const patientExists = await Patient.findById(data.patient);
if (!patientExists) throw new ErrorResponse('Patient not found', 404);

// Auto-link the latest screening if not provided
if (!data.screening) {
const latestScreening = await Screening.findOne({ patient: data.patient })
.sort({ createdAt: -1 })
.select('_id');
if (latestScreening) data.screening = latestScreening._id;
}

// Ensure orderedBy is set
const labTest = await LabTest.create({ ...data, orderedBy: user._id });
return await labTest.populate('patient', 'firstName lastName mrn');
};

// Fetch all lab tests (optionally filtered)
export const getLabTestsService = async (filters = {}) => {
const query = {};

if (filters.status) query.status = filters.status;
if (filters.testType) query.testType = filters.testType;

let tests = await LabTest.find(query)
.populate('patient', 'firstName lastName mrn')
.populate('orderedBy', 'name role')
.populate('screening', 'screeningType result')
.sort({ orderDate: -1 });

if (filters.q) {
const q = filters.q.toLowerCase();
tests = tests.filter(
(t) =>
t.patient?.firstName?.toLowerCase().includes(q) ||
t.patient?.lastName?.toLowerCase().includes(q) ||
t.patient?.mrn?.toLowerCase().includes(q)
);
}

return tests;
};

// Fetch single lab test by ID
export const getLabTestByIdService = async (id, user) => {
const test = await LabTest.findById(id)
.populate('patient', 'firstName lastName mrn createdBy')
.populate('orderedBy', 'name role')
.populate('screening', 'screeningType result');

if (!test) throw new ErrorResponse('Lab test not found', 404);

if (user.role === 'patient') {
const ownsRecord = await isPatientOwner(user._id, test.patient._id);
if (!ownsRecord) throw new ErrorResponse('Not authorized', 403);
}

return test;
};

// Update lab test (includes structured result fields)
export const updateLabTestService = async (id, updates, user) => {
const test = await LabTest.findById(id);
if (!test) throw new ErrorResponse('Lab test not found', 404);

Object.assign(test, updates);

if (updates.status === 'verified') {
test.verifiedBy = user._id;
test.verifiedAt = Date.now();
}

await test.save();
return await test.populate('patient', 'firstName lastName mrn');
};

// Delete lab test
export const deleteLabTestService = async (id) => {
const test = await LabTest.findByIdAndDelete(id);
if (!test) throw new ErrorResponse('Lab test not found', 404);
return test;
};