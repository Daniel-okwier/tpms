import Patient from "../models/patient.js";

// Create new patient
export const createPatientService = async (data, user) => {
  
  const { mrn, ...rest } = data;
  const patient = await Patient.create({ ...rest, createdBy: user._id });
  return patient;
};


// Get active patients with pagination
export const getActivePatientsService = async (page = 1, limit = 20) => {
  const patients = await Patient.find({ archived: false })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await Patient.countDocuments({ archived: false });
  return { patients, total, page, pages: Math.ceil(total / limit) };
};


// Search patient by MRN, name, or phone


export const searchPatientService = async ({ mrn, name, phone }) => {
  const query = { archived: false };

  if (mrn) query.mrn = mrn;
  if (phone) query["contactInfo.phone"] = phone;

  if (name) {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      // Single word → match either first OR last name
      query.$or = [
        { firstName: new RegExp(parts[0], "i") },
        { lastName: new RegExp(parts[0], "i") },
      ];
    } else if (parts.length >= 2) {
      // Two+ words → try to match first + last combo
      const first = parts[0];
      const last = parts.slice(1).join(" "); // in case of compound last names
      query.$and = [
        { firstName: new RegExp(first, "i") },
        { lastName: new RegExp(last, "i") },
      ];
    }
  }

  return await Patient.find(query).limit(20);
};



// Update patient
export const updatePatientService = async (id, updates) => {
  const patient = await Patient.findByIdAndUpdate(id, updates, { new: true });
  if (!patient) throw new Error("Patient not found");
  return patient;
};

// Archive patient (soft delete)
export const archivePatientService = async (id) => {
  const patient = await Patient.findByIdAndUpdate(id, { archived: true }, { new: true });
  if (!patient) throw new Error("Patient not found");
  return patient;
};

// Get archived patients
export const getArchivedPatientsService = async () => {
  return await Patient.find({ archived: true });
};
