import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateReport, createStudy } from '../redux/slices/radiologySlice';
import Button from '../components/shared/Button';
import { toast } from 'react-toastify';

// Hardcode Procedure Types from your Mongoose schema for the dropdown
const PROCEDURE_TYPES = ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography', 'Nuclear Medicine'];

/**
 * ReportForm component handles both viewing/editing an existing study report (Report/Edit Mode)
 * and is structured to handle creation of new studies (Create Mode).
 * * @param {Array} props.patientList - The list of patients passed from the parent component.
 */
const ReportForm = ({ study, isCreateMode, onClose, patientList = [] }) => {
    const dispatch = useDispatch();

    // --- State for REPORTING (Edit Mode) ---
    // ❌ REMOVED: clinicalHistory and conclusion states
    const [findings, setFindings] = useState(study?.findings || '');
    
    // --- State for CREATION (New Study Mode) ---
    const [accessionNumber, setAccessionNumber] = useState(study?.accessionNumber || '');
    const [patientId, setPatientId] = useState(study?.patientId?._id || ''); 
    const [procedureType, setProcedureType] = useState(study?.procedureType || PROCEDURE_TYPES[0]); 
    const [bodyPart, setBodyPart] = useState(study?.bodyPart || '');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determine read-only status
    const isReadOnly = study?.status === 'Finalized' && !isCreateMode;
    const isWorkingOnStudy = study || isCreateMode; 

    const handleImageLink = () => {
        const accNum = study?.accessionNumber || 'N/A';
        const viewerUrl = study?.imageLink || `https://viewer.hospital.com/study/${accNum}`;
        window.open(viewerUrl, '_blank');
        toast.info(`Attempting to open images for ${accNum} in external PACS viewer...`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isReadOnly) {
            toast.info("This report is finalized and cannot be modified.");
            return;
        }
        
        // --- Validation ---
        
        // General Report Fields Validation (Only Findings remains)
        if (!findings.trim()) {
            toast.error("Findings field is required to submit a report.");
            return;
        }

        // Creation Mode Validation: Must have core identifiers
        if (isCreateMode && (!accessionNumber.trim() || !patientId.trim() || !procedureType.trim() || !bodyPart.trim())) {
             toast.error("For a new study record, Accession Number, Patient, Procedure Type, and Body Part are required.");
             return;
        }
        
        // --- Payload Construction ---
        
        // ❌ Report Payload now only includes Findings
        const reportPayload = {
            findings: findings.trim(),
            // Note: clinicalHistory and conclusion are implicitly absent
        };
        
        setIsSubmitting(true);

        if (isCreateMode) {
            // FULL PAYLOAD FOR CREATION
            const creationPayload = {
                accessionNumber: accessionNumber.trim(),
                patientId: patientId.trim(), // Selected Patient ID
                procedureType: procedureType.trim(),
                bodyPart: bodyPart.trim(),
                findings: findings.trim(), 
                status: 'Requested', 
            };

            dispatch(createStudy(creationPayload))
                .unwrap()
                .then(() => {
                    toast.success(`New Study Record (${creationPayload.accessionNumber}) created successfully!`);
                    onClose();
                })
                .catch((error) => {
                    const errorMessage = error?.response?.data?.message || error;
                    toast.error(`Study creation failed: ${errorMessage}`);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        } else if (study?._id) {
            // UPDATE REPORT MODE
            dispatch(updateReport({ id: study._id, reportData: reportPayload }))
                .unwrap()
                .then(() => {
                    toast.success(`Report for Study ${study.accessionNumber} submitted successfully!`);
                    onClose();
                })
                .catch((error) => {
                    const errorMessage = error?.response?.data?.message || error;
                    toast.error(`Submission failed: ${errorMessage}`);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }
    };

    if (!isWorkingOnStudy) {
        return <div className="p-4 text-center text-red-600">No study selected or creation mode failed to initialize.</div>;
    }


    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-5 bg-white max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800">
                {isCreateMode ? 'New Study Record Entry' : `Report: ${study.accessionNumber} (${study.procedureType} - ${study.bodyPart})`}
            </h3>
            
            {!isCreateMode && (
                <p className="text-sm text-gray-600">Patient: **{study.patientId?.firstName} {study.patientId?.lastName}**</p>
            )}
            
            {/* --- NEW STUDY CREATION FIELDS (Conditional Render) --- */}
            {isCreateMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 bg-yellow-50 rounded-lg">
                    
                    {/* Accession Number */}
                    <div>
                        <label htmlFor="accession-number" className="block text-sm font-medium text-gray-700 mb-1">Accession Number *</label>
                        <input
                            id="accession-number"
                            type="text"
                            value={accessionNumber}
                            onChange={(e) => setAccessionNumber(e.target.value)}
                            required
                            placeholder="Unique Accession ID"
                            className="border p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-gray-900" 
                        />
                    </div>

                    {/* PATIENT SELECTOR (FIXED DISPLAY) */}
                    <div>
                        <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                        <select
                            id="patient-select"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            required
                            disabled={!patientList.length || isSubmitting} 
                            className="border p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-gray-900"
                        >
                            <option value="">
                                {patientList.length === 0 ? 'No Patients Available (Load needed)' : '-- Select Patient --'}
                            </option>
                            {patientList.map(patient => (
                                <option key={patient._id} value={patient._id}>
                                    {/* ✅ FIX: Patient Name Only (Removed ID suffix) */}
                                    {patient.firstName} {patient.lastName}
                                </option>
                            ))}
                        </select>
                        {!patientList.length && <p className="text-xs text-red-500 mt-1">Patient list is empty. Cannot create study.</p>}
                    </div>

                    {/* Procedure Type Selector */}
                    <div>
                        <label htmlFor="procedure-type" className="block text-sm font-medium text-gray-700 mb-1">Procedure Type *</label>
                        <select
                            id="procedure-type"
                            value={procedureType}
                            onChange={(e) => setProcedureType(e.target.value)}
                            required
                            className="border p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-gray-900"
                        >
                            {PROCEDURE_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Body Part Input */}
                    <div>
                        <label htmlFor="body-part" className="block text-sm font-medium text-gray-700 mb-1">Body Part *</label>
                        <input
                            id="body-part"
                            type="text"
                            value={bodyPart}
                            onChange={(e) => setBodyPart(e.target.value)}
                            required
                            placeholder="e.g., Chest, Head, Lumbar Spine"
                            className="border p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-gray-900"
                        />
                    </div>
                </div>
            )}
            
            
            {/* Image Interaction Section (Visible only in Edit/Report Mode) */}
            {!isCreateMode && (
                <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center border border-blue-200">
                    <span className="text-sm font-medium text-blue-800">
                        Image Viewing: Linked by Accession No. **{study.accessionNumber}**
                    </span>
                    <Button 
                        type="button" 
                        variant="info" 
                        onClick={handleImageLink} 
                        disabled={isSubmitting}
                    >
                        Open Study in External PACS Viewer
                    </Button>
                </div>
            )}
            
            {/* Report Metadata - Status (Only shown in report/edit mode) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isCreateMode && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                        <div className={`px-3 py-2 rounded-full inline-block text-sm font-semibold ${study.status === 'Reported' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {study.status}
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ ONLY FINDINGS FIELD REMAINS */}
            <div>
                <label htmlFor="findings" className="block text-sm font-medium text-gray-700 mb-1">Findings *</label>
                <textarea
                    id="findings"
                    rows="10" 
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    required
                    disabled={isReadOnly || isSubmitting}
                    placeholder="Describe technical quality, detailed observations, and objective findings..."
                    className="border p-2 rounded w-full font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-gray-900"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-3">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                    {isReadOnly ? 'Close View' : 'Cancel'}
                </Button>
                
                {!isReadOnly && (
                    <Button type="submit" variant="primary" disabled={isSubmitting || (isCreateMode && !patientList.length)}>
                        {isSubmitting ? 'Submitting...' : isCreateMode ? 'Create New Study' : 'Submit Report'}
                    </Button>
                )}
            </div>
        </form>
    );
};

export default ReportForm;