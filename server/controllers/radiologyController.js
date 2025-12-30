// ✅ Use import (with .js extension)
import * as radiologyService from '../services/radiologyService.js';

// @desc    Get all study results
export const getStudies = async (req, res) => {
    try {
        const studies = await radiologyService.getAllStudies();
        res.status(200).json({ success: true, count: studies.length, data: studies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create a new study record
export const createStudy = async (req, res) => {
    try {
        const study = await radiologyService.createStudy(req.body);
        res.status(201).json({ success: true, data: study });
    } catch (error) {
        const statusCode = error.message.includes('mandatory') || error.code === 11000 ? 400 : 500;
        res.status(statusCode).json({ success: false, error: error.message });
    }
};

// @desc    Update Interpretation (Findings and Conclusion)
export const updateReport = async (req, res) => {
    try {
        const study = await radiologyService.updateReport(req.params.id, req.body);
        res.status(200).json({ success: true, data: study });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ success: false, error: error.message });
    }
};

// @desc    Get a single study result and report
export const getStudy = async (req, res) => {
    try {
        const study = await radiologyService.getStudyById(req.params.id);
        if (!study) {
            return res.status(404).json({ success: false, error: 'Study Result not found' });
        }
        res.status(200).json({ success: true, data: study });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};