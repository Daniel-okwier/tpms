
import Appointment from '../models/appointment.js';
import Patient from '../models/patient.js';

export const createAppointmentService = async ({ patientId, appointmentDate, type, notes, createdBy }) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error('Patient not found');

  return await Appointment.create({
    patient: patientId,
    appointmentDate,
    type,
    notes,
    createdBy
  });
};

export const getAppointmentsService = async () => {
  return await Appointment.find()
    .populate('patient', 'mrn name')
    .populate('createdBy', 'name role');
};

export const getMyAppointmentsService = async (userId) => {
  const patient = await Patient.findOne({ createdBy: userId });
  if (!patient) throw new Error('Patient record not found');

  return await Appointment.find({ patient: patient._id })
    .populate('patient', 'mrn name')
    .populate('createdBy', 'name role');
};

export const getAppointmentByIdService = async (id, user) => {
  const appointment = await Appointment.findById(id)
    .populate('patient', 'mrn name')
    .populate('createdBy', 'name role');
  if (!appointment) throw new Error('Appointment not found');

  // Patient access check
  if (user.role === 'patient') {
    const patient = await Patient.findOne({ createdBy: user._id });
    if (!patient || patient._id.toString() !== appointment.patient._id.toString()) {
      throw new Error('Access denied');
    }
  }

  return appointment;
};

export const updateAppointmentService = async (id, updateData) => {
  const appointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true });
  if (!appointment) throw new Error('Appointment not found');
  return appointment;
};

export const deleteAppointmentService = async (id) => {
  const appointment = await Appointment.findByIdAndDelete(id);
  if (!appointment) throw new Error('Appointment not found');
  return appointment;
};
