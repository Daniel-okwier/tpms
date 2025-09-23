import asyncHandler from '../middleware/asyncHandler.js';
import {
  createLabTestService,
  getLabTestsService,
  getLabTestByIdService,
  updateLabTestService,
  deleteLabTestService
} from '../services/labTestService.js';

// Create a new lab test order
export const createLabTest = asyncHandler(async (req, res) => {
  const labTest = await createLabTestService(req.body, req.user);
  res.status(201).json({ success: true, data: labTest });
});

// Get all lab tests
export const getLabTests = asyncHandler(async (req, res) => {
  const tests = await getLabTestsService();
  res.status(200).json({ success: true, count: tests.length, data: tests });
});

// Get single lab test by ID
export const getLabTestById = asyncHandler(async (req, res) => {
  const test = await getLabTestByIdService(req.params.id, req.user);

  if (!test) {
    return res.status(404).json({ success: false, message: 'Lab test not found' });
  }

  res.status(200).json({ success: true, data: test });
});

// Update lab test
export const updateLabTest = asyncHandler(async (req, res) => {
  const test = await updateLabTestService(req.params.id, req.body, req.user);

  if (!test) {
    return res.status(404).json({ success: false, message: 'Lab test not found' });
  }

  res.status(200).json({ success: true, data: test });
});

// Delete lab test
export const deleteLabTest = asyncHandler(async (req, res) => {
  const deleted = await deleteLabTestService(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Lab test not found' });
  }

  res.status(200).json({ success: true, message: 'Lab test removed' });
});
