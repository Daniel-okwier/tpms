import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    createDrug,
    getAllDrugs,
    getDrugById,
    updateDrug,
    deleteDrug
} from '../controllers/drugController.js';

const router = express.Router();

router
    .route('/')
    .get(protect, authorizeRoles('admin', 'pharmacist', 'doctor'), getAllDrugs)
    .post(protect, authorizeRoles('admin'), createDrug);

router
    .route('/:id')
    .get(protect, authorizeRoles('admin', 'pharmacist', 'doctor'), getDrugById)
    .put(protect, authorizeRoles('admin'), updateDrug)
    .delete(protect, authorizeRoles('admin'), deleteDrug);

export default router;