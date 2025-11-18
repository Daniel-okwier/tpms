import express from 'express';
import {
  createLabTest,
  createMultipleLabTests,
  getLabTests,
  getLabTestById,
  updateLabTest,
  deleteLabTest,
  getLabTestsByPatientId, 
} from '../controllers/labTestController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, authorizeRoles('lab_staff', 'doctor', 'nurse'), createLabTest)
  .get(protect, authorizeRoles('admin', 'doctor', 'nurse', 'lab_staff'), getLabTests);

router.post(
  '/multiple',
  protect,
  authorizeRoles('lab_staff', 'doctor', 'nurse'),
  createMultipleLabTests
);

router.get(
  '/patient/:id',
  protect,
  authorizeRoles('admin', 'doctor', 'nurse', 'lab_staff', 'patient'),
  getLabTestsByPatientId
);

router
  .route('/:id')
  .get(protect, authorizeRoles('admin', 'doctor', 'nurse', 'lab_staff', 'patient'), getLabTestById)
  .put(protect, authorizeRoles('lab_staff', 'doctor'), updateLabTest)
  .delete(protect, authorizeRoles('lab_staff'), deleteLabTest);

export default router;
