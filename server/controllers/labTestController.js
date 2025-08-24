import asyncHandler from '../middleware/asyncHandler.js';
import {
  createLabTestService,
  getLabTestsService,
  getLabTestByIdService,
  updateLabTestService,
  deleteLabTestService
} from '../services/labTestService.js';

// Create a new lab test order
// @route   POST /api/lab-tests
// @access  Doctor, Nurse
export const createLabTest = asyncHandler(async (req, res) => {
  const labTest = await createLabTestService(req.body, req.user);
  res.status(201).json({ success: true, data: labTest });
});

// Get all lab tests
// @route   GET /api/lab-tests
// @access  Admin, Doctor, Nurse, Lab staff
export const getLabTests = asyncHandler(async (req, res) => {
  const tests = await getLabTestsService();
  res.status(200).json({ success: true, count: tests.length, data: tests });
});

// Get single lab test by ID
// @route   GET /api/lab-tests/:id
// @access  Admin, Doctor, Nurse, Lab staff, Patient (own)
export const getLabTestById = asyncHandler(async (req, res) => {
  const test = await getLabTestByIdService(req.params.id, req.user);
  res.status(200).json({ success: true, data: test });
});

//  Update lab test
// @route   PUT /api/lab-tests/:id
// @access  Lab staff, Doctor
export const updateLabTest = asyncHandler(async (req, res) => {
  const test = await updateLabTestService(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: test });
});

// Delete lab test
// @route   DELETE /api/lab-tests/:id
// @access  Admin
export const deleteLabTest = asyncHandler(async (req, res) => {
  await deleteLabTestService(req.params.id);
  res.status(200).json({ success: true, message: 'Lab test removed' });
});
