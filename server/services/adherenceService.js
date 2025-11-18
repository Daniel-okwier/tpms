import AdherenceLog from '../models/adherenceLog.js';
import Patient from '../models/patient.js';
import { sendSmsReminder, sendEmailReminder } from '../utils/notificationService.js';

// helper: find patient linked to user
const findPatientByUser = async (userId) => {
  return await Patient.findOne({ createdBy: userId });
};

// Create or update a dose log
export const upsertDoseLog = async ({ user, body }) => {
  const { treatment: treatmentId, patient: patientId, doseDate, taken, method, notes } = body;

  if (!treatmentId || !patientId || !doseDate) {
    throw new Error('treatment, patient and doseDate are required');
  }

  if (user.role === 'patient') {
    const patientRec = await findPatientByUser(user._id);
    if (!patientRec || String(patientRec._id) !== String(patientId)) {
      const err = new Error('Patients can only report their own doses');
      err.statusCode = 403;
      throw err;
    }
  }

  const dateOnly = new Date(doseDate);
  dateOnly.setHours(0,0,0,0);

  return await AdherenceLog.findOneAndUpdate(
    { patient: patientId, doseDate: dateOnly },
    {
      treatment: treatmentId,
      patient: patientId,
      doseDate: dateOnly,
      taken: !!taken,
      observedBy: user.role === 'patient' ? undefined : user._id,
      method: method || (user.role === 'patient' ? 'self' : 'DOT'),
      notes
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

// Fetch adherence logs for a patient
export const getLogsByPatient = async ({ user, query }) => {
  let patientId = query.patient;
  const { from, to } = query;

  if (user.role === 'patient') {
    const patient = await findPatientByUser(user._id);
    if (!patient) throw new Error('Patient profile not found');
    patientId = patient._id;
  }
  if (!patientId) throw new Error('patient id required');

  const q = { patient: patientId, voided: false };
  if (from || to) {
    q.doseDate = {};
    if (from) q.doseDate.$gte = new Date(new Date(from).setHours(0,0,0,0));
    if (to) q.doseDate.$lte = new Date(new Date(to).setHours(23,59,59,999));
  }

  return await AdherenceLog.find(q)
    .populate('observedBy', 'name role')
    .populate('verifiedBy', 'name role')
    .sort({ doseDate: -1 });
};

// Verify dose
export const verifyDoseLog = async ({ user, id }) => {
  const log = await AdherenceLog.findById(id);
  if (!log || log.voided) throw new Error('Dose log not found');

  if (!['doctor','nurse','admin'].includes(user.role)) {
    const err = new Error('Not authorized to verify');
    err.statusCode = 403;
    throw err;
  }

  log.verified = true;
  log.verifiedBy = user._id;
  log.verifiedAt = new Date();
  await log.save();

  return log;
};

// Void dose log
export const voidDoseLog = async ({ user, id, reason }) => {
  if (!['doctor','admin'].includes(user.role)) {
    const err = new Error('Not authorized to void');
    err.statusCode = 403;
    throw err;
  }
  const log = await AdherenceLog.findById(id);
  if (!log || log.voided) throw new Error('Dose log not found');

  log.voided = true;
  log.voidReason = reason || 'No reason provided';
  log.voidedBy = user._id;
  log.voidedAt = new Date();
  await log.save();

  return { message: 'Dose log voided' };
};

// Missed doses
export const getMissedDosesLogs = async ({ query }) => {
  const { patient, from, to } = query;
  const q = { taken: false, voided: false };
  if (patient) q.patient = patient;
  if (from || to) {
    q.doseDate = {};
    if (from) q.doseDate.$gte = new Date(new Date(from).setHours(0,0,0,0));
    if (to) q.doseDate.$lte = new Date(new Date(to).setHours(23,59,59,999));
  } else {
    q.doseDate = { $gte: new Date(Date.now() - 30*24*60*60*1000) };
  }

  return await AdherenceLog.find(q)
    .populate('patient', 'mrn name')
    .populate('observedBy', 'name role');
};

// Adherence summary
export const getAdherenceSummary = async ({ user, query }) => {
  let { patient, from, to } = query;
  if (user.role === 'patient') {
    const patientRec = await findPatientByUser(user._id);
    if (!patientRec) throw new Error('Patient profile not found');
    patient = patientRec._id;
  }
  if (!patient) throw new Error('patient is required');

  const q = { patient, voided: false };
  if (from || to) {
    q.doseDate = {};
    if (from) q.doseDate.$gte = new Date(new Date(from).setHours(0,0,0,0));
    if (to) q.doseDate.$lte = new Date(new Date(to).setHours(23,59,59,999));
  }

  const total = await AdherenceLog.countDocuments(q);
  if (total === 0) return { total: 0, taken: 0, missed: 0, adherencePercent: 0 };

  const taken = await AdherenceLog.countDocuments({ ...q, taken: true });
  const missed = total - taken;
  const adherencePercent = Math.round((taken / total) * 100 * 100) / 100;

  return { total, taken, missed, adherencePercent };
};

// Trigger reminders
export const triggerAdherenceReminder = async ({ patientId }) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error('Patient not found');

  const phone = patient.contactInfo?.phone;
  const email = patient.contactInfo?.email;

  const results = { sms: null, email: null };
  if (phone) results.sms = await sendSmsReminder(phone, `Reminder: please take your TB medication today.`);
  if (email) results.email = await sendEmailReminder(email, 'TB Medication Reminder', 'Please take your medication today and confirm.');

  return { message: 'Reminders triggered', results };
};
