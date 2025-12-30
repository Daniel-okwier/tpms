// ✅ Changed require to import (added .js extension)
import StudyResult from '../models/radiology.js';

class RadiologyService {
    /**
     * @desc Get all study results with patient details
     */
    async getAllStudies() {
        return StudyResult.find()
            .populate('patientId', 'firstName lastName dateOfBirth')
            .sort({ createdAt: -1 });
    }

    /**
     * @desc Create a new study result record
     */
    async createStudy(studyData) {
        // Basic business validation
        if (!studyData.accessionNumber || !studyData.patientId || !studyData.procedureType) {
            throw new Error('Accession Number, Patient ID, and Procedure Type are mandatory.');
        }
        
        return StudyResult.create(studyData);
    }

    /**
     * @desc Get a single study result by ID
     */
    async getStudyById(id) {
        return StudyResult.findById(id).populate('patientId', 'firstName lastName dateOfBirth');
    }

    /**
     * @desc Update the radiologist's interpretation
     */
    async updateReport(id, reportData) {
        const { radiologistId, findings, conclusion, clinicalHistory } = reportData;
        
        const updateFields = { 
            radiologistId, 
            findings, 
            conclusion,
            clinicalHistory,
            status: 'Reported',
            reportDate: new Date()
        };

        const study = await StudyResult.findByIdAndUpdate(id, updateFields, {
            new: true,
            runValidators: true
        });

        if (!study) {
            throw new Error('Study Result not found.');
        }

        return study;
    }

    /**
     * @desc Delete a study result
     */
    async deleteStudy(id) {
        const study = await StudyResult.findByIdAndDelete(id);
        if (!study) {
            throw new Error('Study Result not found.');
        }
        return true;
    }
}

// ✅ Changed module.exports to export default
const radiologyServiceInstance = new RadiologyService();
export default radiologyServiceInstance;