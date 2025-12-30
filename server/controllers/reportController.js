import asyncHandler from '../middleware/asyncHandler.js';
import { 
    getTrendsService, 
    getDashboardDataService, 
    generateTBPublicHealthReportService 
} from '../services/reportService.js';
import Report from '../models/report.js';

// Save generated report metadata to DB.
const saveReport = async (userId, type, filters, data) => {
    const report = new Report({
        reportType: type,
        generatedBy: userId,
        filters,
        data,
        fileUrl: null 
    });
    await report.save();
    return report;
};

// Generate and stream the Strategic Public Health Report (PDF).
export const downloadPublicHealthReport = asyncHandler(async (req, res) => {
    const filters = req.query; 
    
    try {
        // 1. Get data, generate PDF buffer, and filename from the service
        const { reportData, buffer, fileName } = await generateTBPublicHealthReportService(filters);
        
        // 2. Save metadata 
        await saveReport(
            req.user._id, 
            'quarterlyNTPReport', 
            filters, 
            reportData
        );
        
        // 3. Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', buffer.length);

        // 4. Stream the buffer (PDF) directly to the client
        res.send(buffer);

    } catch (error) {
        console.error("Report Download Failed in Controller:", error.message);
        res.status(500).json({ 
            message: error.message || 'Failed to generate report due to an internal server error.' 
        });
    }
});


// Existing operational dashboard controllers:

export const getPatientStats = asyncHandler(async (req, res) => {
    const result = await getDashboardDataService(req.query);
    await saveReport(req.user._id, 'patientStats', req.query, result.data.patients);
    res.status(200).json({ success: true, patients: result.data.patients });
});

export const getTreatmentOutcomes = asyncHandler(async (req, res) => {
    const result = await getDashboardDataService(req.query);
    await saveReport(req.user._id, 'treatmentOutcomes', req.query, result.data.treatments);
    res.status(200).json({ success: true, treatments: result.data.treatments });
});

export const getLabSummary = asyncHandler(async (req, res) => {
    const result = await getDashboardDataService(req.query);
    await saveReport(req.user._id, 'labSummary', req.query, result.data.labTests);
    res.status(200).json({ success: true, labTests: result.data.labTests });
});

export const getTrends = asyncHandler(async (req, res) => {
    const { period } = req.query;
    const result = await getTrendsService(period);
    await saveReport(req.user._id, 'trends', req.query, result.data);
    res.status(200).json({ success: true, ...result });
});

export const getFullDashboard = asyncHandler(async (req, res) => {
    const result = await getDashboardDataService(req.query);
    await saveReport(req.user._id, 'fullDashboard', req.query, result.data);
    res.status(200).json({ success: true, ...result });
});