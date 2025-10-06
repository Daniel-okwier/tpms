import asyncHandler from '../middleware/asyncHandler.js';
import {
createLabTestService,
getLabTestsService,
getLabTestByIdService,
updateLabTestService,
deleteLabTestService
} from '../services/labTestService.js';

// Create a new lab test
export const createLabTest = asyncHandler(async (req, res) => {
const labTest = await createLabTestService(req.body, req.user);
res.status(201).json({ success: true, data: labTest });
});

// Get all lab tests
export const getLabTests = asyncHandler(async (req, res) => {
const tests = await getLabTestsService(req.query);
res.status(200).json({ success: true, count: tests.length, data: tests });
});

// Get single lab test
export const getLabTestById = asyncHandler(async (req, res) => {
const test = await getLabTestByIdService(req.params.id, req.user);
res.status(200).json({ success: true, data: test });
});

// Update lab test
export const updateLabTest = asyncHandler(async (req, res) => {
const updated = await updateLabTestService(req.params.id, req.body, req.user);
res.status(200).json({ success: true, data: updated });
});

// Delete lab test
export const deleteLabTest = asyncHandler(async (req, res) => {
const deleted = await deleteLabTestService(req.params.id);
res.status(200).json({ success: true, message: 'Lab test deleted', data: deleted });
});