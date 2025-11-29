// backend/controllers/visitController.js
import {
  generateNextVisitForTreatment,
  getVisitsByPatient,
  markVisitCompleted,
  markVisitMissed,
} from "../services/visitService.js";

export const generateNextVisit = async (req, res) => {
  try {
    const { treatmentId } = req.params;
    const visit = await generateNextVisitForTreatment(treatmentId, {
      createdBy: req.user?._id,
    });
    if (!visit) return res.json({ message: "No next visit created (treatment completed or archived)" });
    return res.status(201).json({ data: visit });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to generate next visit" });
  }
};

export const listPatientVisits = async (req, res) => {
  try {
    const { patientId } = req.params;
    const visits = await getVisitsByPatient(patientId, req.query);
    return res.json({ data: visits });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch visits" });
  }
};

export const completeVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const visit = await markVisitCompleted(id, data);
    // Optionally auto-create the next visit after completion — returning created visit is up to client
    return res.json({ data: visit });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to mark visit completed" });
  }
};

export const missVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const visit = await markVisitMissed(id, data);
    return res.json({ data: visit });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to mark visit missed" });
  }
};
