import Treatment from '../models/treatment.js';
import Patient from '../models/patient.js';
import Diagnosis from '../models/diagnosis.js';
import Appointment from '../models/appointment.js';
import mongoose from 'mongoose';

/**
 * Compute treatment schedule depending on regimen
 */
export const computeSchedule = (startDate, regimen) => {
  const start = new Date(startDate);
  const visitDates = [];

  const addDays = (d, days) => {
    const out = new Date(d);
    out.setDate(out.getDate() + days);
    return out;
  };

  // Standard regimens
  if (regimen === '2HRZE/4HR' || regimen === '6HRZE') {
    visitDates.push(addDays(start, 14));
    visitDates.push(addDays(start, 30));
    visitDates.push(addDays(start, 60));
    visitDates.push(addDays(start, 120));
    visitDates.push(addDays(start, 180));

    return { expectedEndDate: addDays(start, 180), visitDates };
  }

  // MDR regimen
  if (regimen === 'MDR-TB Regimen') {
    const months = 20;
    for (let m = 1; m <= months; m++) {
      const d = new Date(start);
      d.setMonth(d.getMonth() + m);
      visitDates.push(d);
    }
    return {
      expectedEndDate: visitDates[visitDates.length - 1],
      visitDates,
    };
  }

  // Default fallback
  visitDates.push(addDays(start, 30));
  visitDates.push(addDays(start, 90));
  visitDates.push(addDays(start, 180));

  return { expectedEndDate: addDays(start, 180), visitDates };
};

/**
 * Create a new treatment with auto-generated follow-up appointments
 */
export const createTreatmentService = async ({
  patientId,
  diagnosisId,
  regimen,
  startDate,
  weightKg,
  creatorId,
}) => {
  // Validate patient
  if (!mongoose.Types.ObjectId.isValid(patientId))
    throw new Error('Invalid patient id');
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error('Patient not found');

  // Validate diagnosis
  if (!mongoose.Types.ObjectId.isValid(diagnosisId))
    throw new Error('Invalid diagnosis id');
  const diagnosis = await Diagnosis.findById(diagnosisId);
  if (!diagnosis) throw new Error('Diagnosis not found');

  // Must be a confirmed TB diagnosis
  if (['No TB', 'Suspected TB'].includes(diagnosis.diagnosisType)) {
    throw new Error('Cannot start treatment: diagnosis is not confirmed TB');
  }

  // Get schedule
  const { expectedEndDate, visitDates } = computeSchedule(startDate, regimen);

  // Create treatment
  const treatment = await Treatment.create({
    patient: patientId,
    diagnosis: diagnosisId,
    regimen,
    weightKg,
    startDate: new Date(startDate),
    expectedEndDate,
    status: 'ongoing',
    visitSchedule: visitDates,
    createdBy: creatorId,
  });

  // Auto-generate appointments WITHOUT assignedTo or bookedBy
  const appointments = [];

  for (const dt of visitDates) {
    const start = new Date(dt);
    const end = new Date(start.getTime() + 20 * 60 * 1000); // +20 minutes

    const appt = await Appointment.create({
      patient: patientId,
      appointmentType: 'Follow-up',
      clinic: 'TB Clinic',
      start,
      end,
      status: 'scheduled',
      notes: `Auto-generated follow-up for treatment ${treatment._id}`,
    });

    appointments.push(appt);
  }

  return { treatment, appointments };
};

/**
 * Fetch treatments with optional filters
 */
export const getTreatmentsService = async (user, filters = {}) => {
  const q = { archived: false };

  // Role-based access logic
  if (user) {
    if (user.role === "patient") {
      // Patients can only see their own treatments (if linked to a patient record)
      const patient = await Patient.findOne({ createdBy: user._id });
      if (!patient) return [];
      q.patient = patient._id;
    }
    // Doctors, nurses, and admins can see all treatments
  }

  // Optional query filters
  if (filters.patient) q.patient = filters.patient;
  if (filters.status) q.status = filters.status;

  // Fetch treatments with full reference data
  const treatments = await Treatment.find(q)
    .populate("patient", "mrn firstName lastName")
    .populate("diagnosis", "diagnosisType diagnosisDate")
    .populate("createdBy", "name role")
    .sort({ startDate: -1 });

  return treatments;
};

/**
 * Get single treatment
 */
export const getTreatmentByIdService = async (id, user) => {
  const treatment = await Treatment.findById(id)
    .populate('patient', 'mrn firstName lastName')
    .populate('diagnosis', 'diagnosisType diagnosisDate')
    .populate('createdBy', 'name role');

  if (!treatment) throw new Error('Treatment not found');

  if (user.role === 'patient') {
    const patient = await Patient.findOne({ createdBy: user._id });
    if (!patient || String(patient._id) !== String(treatment.patient._id)) {
      throw new Error('Access denied');
    }
  }

  return treatment;
};

/**
 * Update treatment
 */
export const updateTreatmentService = async (id, updates, userRole) => {
  // Only admin can change start date
  if (updates.startDate && !['admin'].includes(userRole))
    delete updates.startDate;

  // Only doctor or admin can change regimen
  if (updates.regimen && !['doctor', 'admin'].includes(userRole)) {
    throw new Error('Only doctors or admins can change regimen');
  }

  const treatment = await Treatment.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!treatment) throw new Error('Treatment not found');

  return treatment;
};

/**
 * Add follow-up entry
 */
export const addFollowUpService = async (id, followUpData) => {
  const treatment = await Treatment.findById(id);
  if (!treatment) throw new Error('Treatment not found');

  treatment.followUps.push(followUpData);
  await treatment.save();

  return treatment;
};

// CONTROLLER: Add follow-up entry
export const addFollowUp = async (req, res) => {
  try {
    let followUpDate;

    // FIX: Explicitly validate the date passed from the frontend
    if (req.body.date) {
      followUpDate = new Date(req.body.date);
      // CRITICAL CHECK: If the resulting date is invalid (e.g., from "Invalid Date" string)
      if (isNaN(followUpDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format provided for follow-up" });
      }
    } else {
      // Default to current time if no date is provided
      followUpDate = new Date();
    }

    const followUpData = {
      ...req.body,
      date: followUpDate,
      recordedBy: req.user._id,
    };

    // The service layer handles saving to the database
    const treatment = await addFollowUpService(req.params.id, followUpData);

    res.json(treatment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to add follow-up" });
  }
};

/**
 * Complete treatment
 */
export const completeTreatmentService = async (id) => {
  const treatment = await Treatment.findById(id);
  if (!treatment) throw new Error('Treatment not found');

  treatment.status = 'completed';
  treatment.actualEndDate = new Date();
  await treatment.save();

  return treatment;
};

/**
 * Archive treatment
 */
export const archiveTreatmentService = async (id) => {
  const treatment = await Treatment.findByIdAndUpdate(
    id,
    { archived: true },
    { new: true }
  );

  if (!treatment) throw new Error('Treatment not found');

  return treatment;
};