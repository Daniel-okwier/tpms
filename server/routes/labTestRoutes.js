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
  .post(protect, authorizeRoles('lab_staff'), createLabTest)
  .get(protect, authorizeRoles('lab_staff'), getLabTests);

router
  .route('/:id')
  .get(protect, authorizeRoles('lab_staff',), getLabTestById)
  .put(protect, authorizeRoles('lab_staff'), updateLabTest)
  .delete(protect, authorizeRoles('lab_staff'), deleteLabTest);

export default router;
