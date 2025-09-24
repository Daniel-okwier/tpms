import Screening from '../models/screening.js';

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
    // ⚠️ Adjust this once you properly link User ↔ Patient
    filter.patient = user.linkedPatient || user._id;
  }

  if (query.status) filter.screeningOutcome = query.status;
  if (query.facility) filter.facilityName = query.facility;

  return await Screening.find(filter)
    .populate('patient', 'mrn firstName lastName age gender')
    .populate('createdBy', 'name role email')
    .sort({ screeningDate: -1 });
};

// Get single screening by ID
export const getScreeningByIdService = async (id, user) => {
  const screening = await Screening.findById(id)
    .populate('patient', 'mrn firstName lastName age gender')
    .populate('createdBy', 'name role email');

  if (!screening) throw new Error('Screening not found');

  if (user.role === 'patient') {
    const patientId = user.linkedPatient || user._id;
    if (screening.patient._id.toString() !== patientId.toString()) {
      throw new Error('Unauthorized access to screening');
    }
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

  screening.voided = true;  // ✅ fixed field
  screening.voidReason = reason;
  screening.voidedBy = voidedBy;
  screening.voidedAt = Date.now();

  await screening.save();
  return screening;
};

// Get screenings for a specific patient
export const getScreeningsByPatientService = async (patientId) => {
  return await Screening.find({ patient: patientId, voided: false })
    .populate('createdBy', 'name role email')
    .sort({ screeningDate: -1 });
};
