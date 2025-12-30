import Prescription from '../models/prescription.js';

class PrescriptionService {
    // Create a new prescription
    static async createPrescription(prescriptionData) {
        const prescription = new Prescription(prescriptionData);
        await prescription.save();
        return prescription;
    }

    // Get all prescriptions
    static async getAllPrescriptions() {
        return await Prescription.find().populate('patientId drugId');
    }

    // Get a single prescription by ID
    static async getPrescriptionById(prescriptionId) {
        return await Prescription.findById(prescriptionId).populate('patientId drugId');
    }

    // Update a prescription
    static async updatePrescription(prescriptionId, updates) {
        return await Prescription.findByIdAndUpdate(prescriptionId, updates, { new: true });
    }

    // Delete a prescription
    static async deletePrescription(prescriptionId) {
        return await Prescription.findByIdAndDelete(prescriptionId);
    }
}

export default PrescriptionService;