import Patient from "../models/patient.js";

// ADD THIS: Get single patient by ID
export const getPatientByIdService = async (id) => {
  const patient = await Patient.findById(id);
  if (!patient) {
    throw new Error("Patient not found");
  }
  return patient;
};

// UPDATED: More robust global search for Name or MRN or Phone
export const searchPatientService = async (queryParams) => {
  const { query } = queryParams;
  const mongoQuery = { archived: false };

  if (query) {
    // This allows a single search bar to check multiple fields
    mongoQuery.$or = [
      { firstName: new RegExp(query, "i") },
      { lastName: new RegExp(query, "i") },
      { mrn: new RegExp(query, "i") },
      { "contactInfo.phone": new RegExp(query, "i") }
    ];
  }

  return await Patient.find(mongoQuery).sort({ createdAt: -1 }).limit(20);
};

// ... keep createPatientService, getActivePatientsService, updatePatientService, archivePatientService as they were
export const createPatientService = async (data, user) => {
  const patient = await Patient.create({ ...data, createdBy: user._id });
  return patient;
};

export const getActivePatientsService = async (page = 1, limit = 20) => {
  const patients = await Patient.find({ archived: false })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await Patient.countDocuments({ archived: false });
  return { patients, total, page, pages: Math.ceil(total / limit) };
};

export const updatePatientService = async (id, updates) => {
  const patient = await Patient.findByIdAndUpdate(id, updates, { new: true });
  if (!patient) throw new Error("Patient not found");
  return patient;
};

export const archivePatientService = async (id) => {
  const patient = await Patient.findByIdAndUpdate(id, { archived: true }, { new: true });
  if (!patient) throw new Error("Patient not found");
  return patient;
};

export const getArchivedPatientsService = async (page = 1, limit = 20) => {
  const patients = await Patient.find({ archived: true })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await Patient.countDocuments({ archived: true });
  return { patients, total, page, pages: Math.ceil(total / limit) };
};