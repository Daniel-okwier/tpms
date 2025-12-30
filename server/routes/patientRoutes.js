import express from "express";
import {
  createPatient,
  getPatients,
  getArchivedPatients,
  searchPatient,
  updatePatient,
  archivePatient,
  getPatientById, // Import the new controller
} from "../controllers/patientController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. Static/Search Routes first
router.post("/", protect, authorizeRoles("admin", "doctor", "nurse"), createPatient);
router.get("/", protect, authorizeRoles("admin", "doctor", "nurse", "lab_staff"), getPatients);

router.get(
  "/search",
  protect,
  authorizeRoles("admin", "doctor", "nurse", "lab_staff"),
  searchPatient
);

router.get(
  "/archived",
  protect,
  authorizeRoles("doctor", "nurse", "admin"),
  getArchivedPatients
);

// 2. Dynamic ID Routes last
router.get(
  "/:id", 
  protect, 
  authorizeRoles("admin", "doctor", "nurse", "lab_staff"), 
  getPatientById
);

router.put("/:id", protect, authorizeRoles("doctor", "nurse"), updatePatient);
router.delete("/:id", protect, authorizeRoles("doctor", "nurse"), archivePatient);

export default router;