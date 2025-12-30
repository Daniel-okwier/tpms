import mongoose from 'mongoose'; // ✅ Change from require to import

const studyResultSchema = new mongoose.Schema({
    // 1. Core Identification & Links
    accessionNumber: {
        type: String,
        required: true,
        unique: true,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    
    // 2. Procedure Details
    procedureType: {
        type: String,
        enum: ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography', 'Nuclear Medicine'],
        required: true,
    },
    bodyPart: {
        type: String,
        required: true,
        trim: true,
    },
    
    // 3. Reporting and Interpretation
    status: {
        type: String,
        enum: ['Requested', 'Completed', 'Awaiting Review', 'Reported', 'Finalized'],
        default: 'Requested',
        required: true,
    },
    radiologistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },

    clinicalHistory: {
        type: String,
        default: '',
        required: false, 
    },
    findings: {
        type: String,
        required: true, 
    },
    conclusion: {
        type: String,
        required: false, 
    },
    
    // 4. Report Metadata
    reportDate: {
        type: Date,
    },
    
    // 5. Image/File Handling
    imageLink: {
        type: String, 
        required: false,
    },
    
}, {
    timestamps: true 
});

// ✅ Change module.exports to export default
const StudyResult = mongoose.model('StudyResult', studyResultSchema);
export default StudyResult;