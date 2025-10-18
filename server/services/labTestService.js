import LabTest from '../models/labTest.js';
import Patient from '../models/patient.js';
import Screening from '../models/screening.js';
import ErrorResponse from '../utils/errorResponse.js';
import mongoose from 'mongoose';

// Utility to verify ownership for patient users
const isPatientOwner = async (userId, patientId) => {
  const patient = await Patient.findById(patientId).populate('createdBy');
  if (!patient) return false;
  return patient.createdBy?._id.toString() === userId.toString();
};

// Create single lab test with automatic screening linking
export const createLabTestService = async (data, user) => {
  const patientExists = await Patient.findById(data.patient);
  if (!patientExists) throw new ErrorResponse('Patient not found', 404);

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

// Create multiple lab tests at once
export const createMultipleLabTestsService = async ({ patientId, tests }, user) => {
  if (!Array.isArray(tests) || tests.length === 0) {
    throw new ErrorResponse('No lab tests provided', 400);
  }

  const createdTests = [];

  for (const testData of tests) {
    const patientExists = await Patient.findById(patientId);
    if (!patientExists) throw new ErrorResponse('Patient not found', 404);

    testData.patient = patientId;

    if (!testData.screening) {
      const latestScreening = await Screening.findOne({ patient: patientId })
        .sort({ createdAt: -1 })
        .select('_id');
      if (latestScreening) testData.screening = latestScreening._id;
    }

    const labTest = await LabTest.create({
      ...testData,
      orderedBy: user._id,
    });

    createdTests.push(await labTest.populate('patient', 'firstName lastName mrn'));
  }

  return createdTests;
};

// Fetch all lab tests (optionally filtered)
export const getLabTestsService = async (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.testType) query.testType = filters.testType;

  let tests = await LabTest.find(query)
    .populate('patient', 'firstName lastName mrn')
    .populate('orderedBy', 'name role')
    .populate('verifiedBy', 'name')
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
    .populate('verifiedBy', 'name')
    .populate('screening', 'screeningType result');

  if (!test) throw new ErrorResponse('Lab test not found', 404);

  if (user.role === 'patient') {
    const ownsRecord = await isPatientOwner(user._id, test.patient._id);
    if (!ownsRecord) throw new ErrorResponse('Not authorized', 403);
  }

  return test;
};

// Fetch all lab tests for a specific patient
export const getLabTestsByPatientIdService = async (patientId, user) => {
  const patientObjectId = new mongoose.Types.ObjectId(patientId);

  const patientExists = await Patient.findById(patientId);
  if (!patientExists) throw new ErrorResponse('Patient not found', 404);

  const labTests = await LabTest.find({ patient: patientObjectId })
    .populate('patient', 'firstName lastName mrn')
    .populate('orderedBy', 'name role')
    .populate('verifiedBy', 'name')
    .populate('screening', 'screeningType result')
    .sort({ orderDate: -1 });

  if (user.role === 'patient') {
    const ownsRecord = await isPatientOwner(user._id, patientId);
    if (!ownsRecord) throw new ErrorResponse('Not authorized', 403);
  }

  return labTests;
};

// Update lab test
export const updateLabTestService = async (id, updates, user) => {
  const test = await LabTest.findById(id);
  if (!test) throw new ErrorResponse('Lab test not found', 404);

  Object.assign(test, updates);

  
  if (updates.result || updates.findings) {
    test.status = 'completed';
  }

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
