import Screening from '../models/screening.js';

// Create screening
export const createScreeningService = async ({ data, userId }) => {
  const screening = new Screening({
    ...data,
    createdBy: userId,
  });
  return await screening.save();
};

// Get screenings (supports pagination, filters, search)
export const getScreeningsService = async (user, query = {}) => {
  const page = Math.max(parseInt(query.page || 1, 10), 1);
  const limit = Math.max(parseInt(query.limit || 100, 10), 1); // default large enough
  const skip = (page - 1) * limit;

  const filter = { voided: { $ne: true } };

  // If user is a patient, limit to their screenings (assumes user.linkedPatient exists)
  if (user && user.role === 'patient') {
    filter.patient = user.linkedPatient || user._id;
  }

  if (query.status) filter.screeningOutcome = query.status;
  if (query.outcome) filter.screeningOutcome = query.outcome;

  // Fetch full list with populate, then apply search in-memory (simple & safe)
  let docs = await Screening.find(filter)
    .populate('patient', 'mrn firstName lastName age gender')
    .populate('createdBy', 'name role email')
    .sort({ screeningDate: -1 });

  // Search by patient fields if provided
  if (query.q) {
    const q = query.q.toString().trim();
    const re = new RegExp(q, 'i');
    docs = docs.filter(
      (s) =>
        re.test(s.patient?.mrn ?? '') ||
        re.test(s.patient?.firstName ?? '') ||
        re.test(s.patient?.lastName ?? '') ||
        (s.patient?._id?.toString() ?? '').includes(q)
    );
  }

  const count = docs.length;
  const paged = docs.slice(skip, skip + limit);

  return { data: paged, count };
};

// Get single screening by ID
export const getScreeningByIdService = async (id, user) => {
  const screening = await Screening.findById(id)
    .populate('patient', 'mrn firstName lastName age gender createdBy')
    .populate('createdBy', 'name role email');

  if (!screening) throw new Error('Screening not found');

  // Patients can only access their own screenings
  if (user && user.role === 'patient') {
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

// Soft-void screening
export const voidScreeningService = async (id, reason, voidedBy) => {
  const screening = await Screening.findById(id);
  if (!screening) throw new Error('Screening not found');

  screening.voided = true;
  screening.voidReason = reason;
  screening.voidedBy = voidedBy;
  screening.voidedAt = Date.now();

  await screening.save();
  return screening;
};

// Hard delete screening
export const deleteScreeningService = async (id) => {
  const screening = await Screening.findByIdAndDelete(id);
  if (!screening) throw new Error('Screening not found');
  return screening;
};

// Get screenings for a specific patient (not-voided)
export const getScreeningsByPatientService = async (patientId) => {
  return await Screening.find({ patient: patientId, voided: false })
    .populate('patient', 'mrn firstName lastName age gender')
    .populate('createdBy', 'name role email')
    .sort({ screeningDate: -1 });
};
