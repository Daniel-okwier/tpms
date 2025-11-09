import Treatment from "../models/treatment.js";
import Patient from "../models/patient.js";
import Diagnosis from "../models/diagnosis.js";
import Appointment from "../models/appointment.js";
import mongoose from "mongoose";

// ---------------------------------------------------------
// Compute follow-up schedule based on regimen
// ---------------------------------------------------------
export const computeSchedule = (startDate, regimen) => {
  const start = new Date(startDate);
  const visitDates = [];

  const addDays = (d, days) => {
    const out = new Date(d);
    out.setDate(out.getDate() + days);
    return out;
  };

  // Standard TB regimens
  if (regimen === "2HRZE/4HR" || regimen === "6HRZE") {
    visitDates.push(addDays(start, 14));
    visitDates.push(addDays(start, 30));
    visitDates.push(addDays(start, 60));
    visitDates.push(addDays(start, 120));
    visitDates.push(addDays(start, 180));
    return { expectedEndDate: addDays(start, 180), visitDates };
  }

  // MDR regimen — 20 months follow-ups
  if (regimen === "MDR-TB Regimen") {
    for (let m = 1; m <= 20; m++) {
      const d = new Date(start);
      d.setMonth(d.getMonth() + m);
      visitDates.push(d);
    }
    return { expectedEndDate: visitDates[visitDates.length - 1], visitDates };
  }

  // Default regimen (fallback)
  visitDates.push(addDays(start, 30));
  visitDates.push(addDays(start, 90));
  visitDates.push(addDays(start, 180));
  return { expectedEndTime: addDays(start, 180), visitDates };
};

// ---------------------------------------------------------
// Create Treatment + auto-generated follow-up appointments
// ---------------------------------------------------------
export const createTreatmentService = async ({
  patientId,
  diagnosisId,
  regimen,
  startDate,
  weightKg,
  assignedTo,
  creatorId,
}) => {
  if (!mongoose.Types.ObjectId.isValid(patientId))
    throw new Error("Invalid patient id");

  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");

  if (!mongoose.Types.ObjectId.isValid(diagnosisId))
    throw new Error("Invalid diagnosis id");

  const diagnosis = await Diagnosis.findById(diagnosisId);
  if (!diagnosis) throw new Error("Diagnosis not found");

  if (["No TB", "Suspected TB"].includes(diagnosis.diagnosisType)) {
    throw new Error("Cannot start treatment: diagnosis is not confirmed TB");
  }

  const { expectedEndDate, visitDates } = computeSchedule(startDate, regimen);

  const treatment = await Treatment.create({
    patient: patientId,
    diagnosis: diagnosisId,
    regimen,
    weightKg,
    startDate: new Date(startDate),
    expectedEndDate,
    status: "ongoing",
    visitSchedule: visitDates,
    createdBy: creatorId,
  });

  // -------------------------------------------------------
  // Auto-generate valid Appointment records (NEW MODEL)
  // -------------------------------------------------------
  const appointments = [];
  for (const date of visitDates) {
    const appt = await Appointment.create({
      patient: patientId,
      doctor: assignedTo || creatorId, // Doctor is required
      appointmentDate: date,
      status: "scheduled",
      notes: `Auto-generated follow-up for treatment ${treatment._id}`,
    });

    appointments.push(appt);
  }

  return { treatment, appointments };
};

// ---------------------------------------------------------
// Fetch all treatments
// ---------------------------------------------------------
export const getTreatmentsService = async (user, filters = {}) => {
  const q = { archived: false };

  if (user.role === "patient") {
    const patient = await Patient.findOne({ createdBy: user._id });
    if (!patient) throw new Error("Patient profile not found");
    q.patient = patient._id;
  } else {
    if (filters.patient) q.patient = filters.patient;
    if (filters.status) q.status = filters.status;
  }

  return await Treatment.find(q)
    .populate("patient", "mrn firstName lastName")
    .populate("diagnosis", "diagnosisType diagnosisDate")
    .populate("createdBy", "name role")
    .sort({ startDate: -1 });
};

// ---------------------------------------------------------
// Get Treatment by ID
// ---------------------------------------------------------
export const getTreatmentByIdService = async (id, user) => {
  const treatment = await Treatment.findById(id)
    .populate("patient", "mrn firstName lastName")
    .populate("diagnosis", "diagnosisType diagnosisDate")
    .populate("createdBy", "name role");

  if (!treatment) throw new Error("Treatment not found");

  if (user.role === "patient") {
    const patient = await Patient.findOne({ createdBy: user._id });
    if (!patient || String(patient._id) !== String(treatment.patient._id)) {
      throw new Error("Access denied");
    }
  }

  return treatment;
};

// ---------------------------------------------------------
// Update Treatment
// ---------------------------------------------------------
export const updateTreatmentService = async (id, updates, userRole) => {
  if (updates.startDate && !["admin"].includes(userRole))
    delete updates.startDate;

  if (updates.regimen && !["doctor", "admin"].includes(userRole)) {
    throw new Error("Only doctors or admins can change regimen");
  }

  const treatment = await Treatment.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!treatment) throw new Error("Treatment not found");
  return treatment;
};

// ---------------------------------------------------------
// Add follow-up entry
// ---------------------------------------------------------
export const addFollowUpService = async (id, followUpData) => {
  const treatment = await Treatment.findById(id);
  if (!treatment) throw new Error("Treatment not found");

  treatment.followUps.push(followUpData);
  await treatment.save();
  return treatment;
};

// ---------------------------------------------------------
// Complete Treatment
// ---------------------------------------------------------
export const completeTreatmentService = async (id) => {
  const treatment = await Treatment.findById(id);
  if (!treatment) throw new Error("Treatment not found");

  treatment.status = "completed";
  treatment.actualEndDate = new Date();
  await treatment.save();
  return treatment;
};

// ---------------------------------------------------------
// Archive Treatment
// ---------------------------------------------------------
export const archiveTreatmentService = async (id) => {
  const treatment = await Treatment.findByIdAndUpdate(
    id,
    { archived: true },
    { new: true }
  );
  if (!treatment) throw new Error("Treatment not found");
  return treatment;
};
