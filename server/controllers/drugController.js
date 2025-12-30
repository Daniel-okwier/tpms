import DrugService from '../services/drugService.js';

export const createDrug = async (req, res) => {
    try {
        const drug = await DrugService.createDrug(req.body);
        res.status(201).json(drug);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllDrugs = async (req, res) => {
    try {
        const drugs = await DrugService.getAllDrugs();
        res.status(200).json(drugs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDrugById = async (req, res) => {
    try {
        const drug = await DrugService.getDrugById(req.params.id);
        if (!drug) {
            return res.status(404).json({ message: 'Drug not found' });
        }
        res.status(200).json(drug);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDrug = async (req, res) => {
    try {
        const updatedDrug = await DrugService.updateDrug(req.params.id, req.body);
        if (!updatedDrug) {
            return res.status(404).json({ message: 'Drug not found' });
        }
        res.status(200).json(updatedDrug);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteDrug = async (req, res) => {
    try {
        const deletedDrug = await DrugService.deleteDrug(req.params.id);
        if (!deletedDrug) {
            return res.status(404).json({ message: 'Drug not found' });
        }
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};