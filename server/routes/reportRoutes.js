import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    getPatientStats,
    getTreatmentOutcomes,
    getLabSummary,
    getTrends,
    getFullDashboard,
    downloadPublicHealthReport
} from '../controllers/reportController.js';

const router = express.Router();

// Generate the strategic report PDF and stream it to the client.
router.get(
    '/public-health/download', 
    protect,
    authorizeRoles('admin'), 
    downloadPublicHealthReport
);


router.get(
    '/patient-stats',
    protect,
    authorizeRoles('admin'),
    getPatientStats
);

router.get(
    '/treatment-outcomes',
    protect,
    authorizeRoles('admin'),
    getTreatmentOutcomes
);

router.get(
    '/lab-summary',
    protect,
    authorizeRoles('admin'),
    getLabSummary
);

router.get(
    '/trends',
    protect,
    authorizeRoles('admin'),
    getTrends
);

router.get(
    '/full-dashboard',
    protect,
    authorizeRoles('admin'),
    getFullDashboard
);

export default router;