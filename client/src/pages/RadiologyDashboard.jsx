import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudies } from '../redux/slices/radiologySlice';
import { fetchPatients } from '../redux/slices/patientSlice'; // Import patient thunk
import Button from '../components/shared/Button';
import { toast } from 'react-toastify';
import Modal from '../components/shared/Modal';
import ReportForm from './RadiologyForm'; // Assuming ReportForm path

// --- Native Date Formatting Helper ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    
    const formattedDate = date.toLocaleDateString(undefined, dateOptions);
    const formattedTime = date.toLocaleTimeString(undefined, timeOptions);
    
    return `${formattedDate} ${formattedTime}`;
};
// ------------------------------------

// Helper function for styling based on study status
const getStatusClasses = (status) => {
    switch (status) {
        case 'Requested':
            return 'bg-gray-100 text-gray-800';
        case 'Completed':
        case 'Awaiting Review':
            return 'bg-yellow-100 text-yellow-800 font-bold';
        case 'Reported':
        case 'Finalized':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-blue-100 text-blue-800';
    }
};

const RadiologyDashboard = () => {
    const dispatch = useDispatch();
    
    // Select radiology study data
    const { 
        studies, 
        isLoading: isStudiesLoading, 
        error: studiesError 
    } = useSelector(state => state.radiology);
    
    // ✅ CORRECT SELECTION: Access the patients array using the 'items' key
    const { 
        items: patients, // <-- Select 'items' and rename it to 'patients'
        loading: isPatientsLoading, 
        error: patientsError 
    } = useSelector(state => state.patients);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudy, setSelectedStudy] = useState(null);
    const [isCreateMode, setIsCreateMode] = useState(false); 

    // Fetch Studies and Patients on mount
    useEffect(() => {
        dispatch(fetchStudies());
        // Fetch patients list. We use a high limit for the dropdown.
        dispatch(fetchPatients({ page: 1, limit: 100 })); 
    }, [dispatch]);

    // Error handling for studies and patients
    useEffect(() => {
        if (studiesError) {
            toast.error(`Error loading studies: ${studiesError}`);
        }
        if (patientsError) {
             toast.error(`Error loading patient list: ${patientsError}. Cannot create new studies.`);
        }
    }, [studiesError, patientsError]);

    /**
     * Handles opening the form for REPORTING (editing) an existing study.
     */
    const handleReportAction = (study) => {
        setSelectedStudy(study);
        setIsCreateMode(false); // Set to reporting/edit mode
        setIsModalOpen(true);
    };

    /**
     * Handles opening the form for CREATING a new study record.
     */
    const handleCreateNewStudy = () => {
        if (isPatientsLoading) {
            toast.info("Please wait for the patient list to finish loading.");
            return;
        }
        setSelectedStudy(null); // No study selected for creation
        setIsCreateMode(true);  // Set to creation mode
        setIsModalOpen(true);
    };

    if (isStudiesLoading) {
        return <div className="p-6 text-center text-lg text-blue-600">Loading Radiology Studies...</div>;
    }

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Radiology Study Queue</h1>
                <Button 
                    variant="primary" 
                    onClick={handleCreateNewStudy} 
                    // Disable if patient list is loading or failed to load
                    disabled={isPatientsLoading || patientsError} 
                >
                    {isPatientsLoading ? 'Loading Patients...' : '+ Add New Study Record'}
                </Button>
            </header>

            {/* Main Table View */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accession No.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedure</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        
                        {!studies || studies.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                    No radiology studies found in the queue.
                                </td>
                            </tr>
                        ) : (
                            studies.map((study) => (
                                <tr key={study._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{study.accessionNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {study.patientId ? `${study.patientId.firstName} ${study.patientId.lastName}` : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {study.procedureType} ({study.bodyPart})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(study.status)}`}>
                                            {study.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(study.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleReportAction(study)}
                                            className="text-indigo-600 hover:text-indigo-900 font-semibold transition duration-150"
                                        >
                                            {study.status === 'Reported' || study.status === 'Finalized' ? 'View/Edit Report' : 'Start Reporting'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Display the Report/Create Form in a Modal */}
            {isModalOpen && (
                <Modal 
                    title={isCreateMode 
                        ? "Create New Radiology Study Record" 
                        : `Report Study: ${selectedStudy?.accessionNumber || 'N/A'}`
                    } 
                    onClose={() => setIsModalOpen(false)}
                >
                    <ReportForm 
                        study={selectedStudy} 
                        isCreateMode={isCreateMode}
                        onClose={() => setIsModalOpen(false)}
                        // Pass the correctly selected patient list
                        patientList={patients} 
                    />
                </Modal>
            )}
        </div>
    );
};

export default RadiologyDashboard;