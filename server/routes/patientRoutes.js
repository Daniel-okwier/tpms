import express from "express";
import {
  createPatient,
  getPatients,
  getArchivedPatients,
  searchPatient,
  updatePatient,
  archivePatient,
} from "../controllers/patientController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create patient
router.post("/", protect, authorizeRoles("admin", "doctor", "nurse"), createPatient);

// Get all active patients (paginated)
router.get("/", protect, authorizeRoles("admin", "doctor", "nurse", "lab_staff"), getPatients);

// Search patients
router.get(
  "/search",
  protect,
  authorizeRoles("admin", "doctor", "nurse", "lab_staff"),
  searchPatient
);

// Update patient
router.put("/:id", protect, authorizeRoles( "doctor","nurse"), updatePatient);

// Archive patient
router.delete("/:id", protect, authorizeRoles( "doctor","nurse"), archivePatient);

// Get archived patients (paginated)
router.get(
  "/archived",
  protect,
  authorizeRoles( "doctor","nurse"),
  getArchivedPatients
);

export default router;
