import Patient from '../models/patient.js';
import Treatment from '../models/treatment.js';
import LabTest from '../models/labTest.js';
import Appointment from '../models/appointment.js';

/**
 * Get monthly/weekly trends for TB dashboard
 * @param {string} period 'month' or 'week'
 */
export const getTrendsService = async (period = 'month') => {
  const groupFormat = period === 'week' ? { $week: '$createdAt' } : { $month: '$createdAt' };

  const newPatientsTrend = await Patient.aggregate([
    { $group: { _id: groupFormat, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const treatmentsTrend = await Treatment.aggregate([
    { $group: { _id: groupFormat, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const labPosTrend = await LabTest.aggregate([
    { $match: { 'geneXpert.mtbDetected': 'detected' } },
    { $group: { _id: groupFormat, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  return { period, data: { newPatientsTrend, treatmentsTrend, labPosTrend } };
};

/**
 * Get aggregated dashboard data with optional filters
 * @param {object} filters { startDate, endDate, treatmentPhase, patientStatus }
 */
export const getDashboardDataService = async (filters = {}) => {
  const { startDate, endDate, treatmentPhase, patientStatus } = filters;

  // Patient query
  const patientQuery = {};
  if (patientStatus) patientQuery.treatmentStatus = patientStatus;
  if (startDate || endDate) {
    patientQuery.createdAt = {};
    if (startDate) patientQuery.createdAt.$gte = new Date(startDate);
    if (endDate) patientQuery.createdAt.$lte = new Date(endDate);
  }

  // Treatment query
  const treatmentQuery = {};
  if (treatmentPhase) treatmentQuery.phase = treatmentPhase;
  if (startDate || endDate) {
    treatmentQuery.createdAt = {};
    if (startDate) treatmentQuery.createdAt.$gte = new Date(startDate);
    if (endDate) treatmentQuery.createdAt.$lte = new Date(endDate);
  }

  // Appointment query
  const appointmentQuery = {};
  if (startDate || endDate) {
    appointmentQuery.date = {};
    if (startDate) appointmentQuery.date.$gte = new Date(startDate);
    if (endDate) appointmentQuery.date.$lte = new Date(endDate);
  }

  // Patient stats
  const totalPatients = await Patient.countDocuments(patientQuery);
  const activePatients = await Patient.countDocuments({ ...patientQuery, treatmentStatus: 'ongoing' });
  const completedPatients = await Patient.countDocuments({ ...patientQuery, treatmentStatus: 'completed' });
  const defaultedPatients = await Patient.countDocuments({ ...patientQuery, treatmentStatus: 'defaulted' });

  // Treatment outcomes
  const totalTreatments = await Treatment.countDocuments(treatmentQuery);
  const ongoingTreatments = await Treatment.countDocuments({ ...treatmentQuery, status: 'ongoing' });
  const completedTreatments = await Treatment.countDocuments({ ...treatmentQuery, status: 'completed' });
  const failedTreatments = await Treatment.countDocuments({ ...treatmentQuery, status: 'failed' });

  // Lab test summary
  const totalTests = await LabTest.countDocuments();
  const completedTests = await LabTest.countDocuments({ status: 'completed' });
  const positiveGeneXpert = await LabTest.countDocuments({ 'geneXpert.mtbDetected': 'detected' });
  const positiveSmear = await LabTest.countDocuments({ 'smear.result': 'positive' });

  // Appointment metrics
  const totalAppointments = await Appointment.countDocuments(appointmentQuery);
  const upcomingAppointments = await Appointment.countDocuments({ ...appointmentQuery, date: { $gte: new Date() } });
  const pastAppointments = await Appointment.countDocuments({ ...appointmentQuery, date: { $lt: new Date() } });

  return {
    filters,
    data: {
      patients: { totalPatients, activePatients, completedPatients, defaultedPatients },
      treatments: { totalTreatments, ongoingTreatments, completedTreatments, failedTreatments },
      labTests: { totalTests, completedTests, positiveGeneXpert, positiveSmear },
      appointments: { totalAppointments, upcomingAppointments, pastAppointments }
    }
  };
};
