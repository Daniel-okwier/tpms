import {
  createAppointmentService,
  getAppointmentsService,
  getMyAppointmentsService,
  getAppointmentByIdService,
  updateAppointmentService,
  deleteAppointmentService
} from '../services/appointmentService.js';

//Create a new appointment (staff only)
export const createAppointment = async (req, res) => {
  try {
    const appointment = await createAppointmentService({
      patientId: req.body.patientId,
      appointmentDate: req.body.appointmentDate,
      type: req.body.type,
      notes: req.body.notes,
      createdBy: req.user._id
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
};

//Get all appointments (staff only)
export const getAppointments = async (req, res) => {
  try {
    const appointments = await getAppointmentsService();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
};

//Get my appointments (patient only)
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await getMyAppointmentsService(req.user._id);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your appointments', error: error.message });
  }
};

//Get single appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await getAppointmentByIdService(req.params.id, req.user);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointment', error: error.message });
  }
};

//Update appointment (staff only)
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await updateAppointmentService(req.params.id, req.body);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update appointment', error: error.message });
  }
};

//Delete appointment (staff only)
export const deleteAppointment = async (req, res) => {
  try {
    await deleteAppointmentService(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete appointment', error: error.message });
  }
};
