
import express from "express";
import {
  generateNextVisit,
  listPatientVisits,
  completeVisit,
  missVisit,
} from "../controllers/visitController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate next visit for a treatment (doctors/nurses/admin)
router.post("/generate/:treatmentId", protect, authorizeRoles("doctor", "nurse", "admin"), generateNextVisit);

// List visits for a patient (patient can view their own; staff can view others)
router.get("/patient/:patientId", protect, authorizeRoles("doctor", "nurse", "admin", "patient"), listPatientVisits);

// Mark visit completed (doctor/nurse)
router.post("/:id/complete", protect, authorizeRoles("doctor", "nurse", "admin"), completeVisit);

// Mark visit missed (nurse/doctor/admin)
router.post("/:id/miss", protect, authorizeRoles("doctor", "nurse", "admin"), missVisit);

export default router;
