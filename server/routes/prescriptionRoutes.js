import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    createPrescription,
    getAllPrescriptions,
    getPrescriptionById,
    updatePrescription,
    deletePrescription
} from '../controllers/prescriptionController.js';

const router = express.Router();

router
    .route('/')
    .get(protect, authorizeRoles('admin', 'pharmacist', 'doctor'), getAllPrescriptions)
    .post(protect, authorizeRoles('admin', 'pharmacist'), createPrescription);

router
    .route('/:id')
    .get(protect, authorizeRoles('admin', 'pharmacist', 'doctor'), getPrescriptionById)
    .put(protect, authorizeRoles('admin', 'pharmacist'), updatePrescription)
    .delete(protect, authorizeRoles('admin'), deletePrescription);

export default router;