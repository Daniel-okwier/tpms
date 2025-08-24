import Screening from '../models/Screening.js';

// Create screening
export const createScreeningService = async ({ data, userId }) => {
  const screening = new Screening({
    ...data,
    createdBy: userId
  });
  return await screening.save();
};

// Get screenings (staff see all, patients see their own)
export const getScreeningsService = async (user, query) => {
  const filter = {};

  if (user.role === 'patient') {
    filter.patient = user._id; // patient can only see their own screenings
  }

  if (query.status) {
    filter.status = query.status;
  }

  return await Screening.find(filter).populate('patient createdBy');
};

// Get single screening by ID
export const getScreeningByIdService = async (id, user) => {
  const screening = await Screening.findById(id).populate('patient createdBy');

  if (!screening) {
    throw new Error('Screening not found');
  }

  if (user.role === 'patient' && screening.patient.toString() !== user._id.toString()) {
    throw new Error('Unauthorized access to screening');
  }

  return screening;
};

// Update screening
export const updateScreeningService = async (id, updateData) => {
  const screening = await Screening.findByIdAndUpdate(id, updateData, { new: true });
  if (!screening) throw new Error('Screening not found');
  return screening;
};

// Soft delete (void) screening
export const voidScreeningService = async (id, reason, voidedBy) => {
  const screening = await Screening.findById(id);
  if (!screening) throw new Error('Screening not found');

  screening.isVoided = true;
  screening.voidReason = reason;
  screening.voidedBy = voidedBy;

  await screening.save();
  return screening;
};

// Get screenings for a specific patient
export const getScreeningsByPatientService = async (patientId) => {
  return await Screening.find({ patient: patientId }).populate('createdBy');
};
