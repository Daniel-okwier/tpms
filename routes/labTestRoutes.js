import express from 'express';
import {
  createLabTest,
  getLabTests,
  getLabTestById,
  updateLabTest,
  deleteLabTest
} from '../controllers/labTestController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, authorizeRoles('doctor', 'nurse'), createLabTest)
  .get(protect, authorizeRoles('admin', 'doctor', 'nurse', 'lab_staff'), getLabTests);

router
  .route('/:id')
  .get(protect, authorizeRoles('admin', 'doctor', 'nurse', 'lab_staff', 'patient'), getLabTestById)
  .put(protect, authorizeRoles('lab_staff', 'doctor'), updateLabTest)
  .delete(protect, authorizeRoles('admin'), deleteLabTest);

export default router;
