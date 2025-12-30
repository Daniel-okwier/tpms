import PrescriptionService from '../services/prescriptionService.js';

export const createPrescription = async (req, res) => {
    try {
        const prescription = await PrescriptionService.createPrescription(req.body);
        res.status(201).json(prescription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllPrescriptions = async (req, res) => {
    try {
        const prescriptions = await PrescriptionService.getAllPrescriptions();
        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPrescriptionById = async (req, res) => {
    try {
        const prescription = await PrescriptionService.getPrescriptionById(req.params.id);
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        res.status(200).json(prescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePrescription = async (req, res) => {
    try {
        const updatedPrescription = await PrescriptionService.updatePrescription(req.params.id, req.body);
        if (!updatedPrescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        res.status(200).json(updatedPrescription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deletePrescription = async (req, res) => {
    try {
        const deletedPrescription = await PrescriptionService.deletePrescription(req.params.id);
        if (!deletedPrescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};