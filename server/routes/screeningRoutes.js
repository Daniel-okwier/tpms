import express from 'express';
import {
  createScreening,
  getScreenings,
  getScreeningById,
  updateScreening,
  voidScreening,
  deleteScreening,
  getScreeningsByPatient,
} from '../controllers/screeningController.js';
import { protect, authorizeRoles as authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create screening
router.post('/', protect, authorize('nur
