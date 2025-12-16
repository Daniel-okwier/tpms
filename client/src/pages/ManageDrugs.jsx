import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDrugs, deleteDrug, clearDrugMessages } from '../redux/slices/drugSlice'; 
import { fetchPrescriptions, deletePrescription, clearPrescriptionMessages } from '../redux/slices/prescriptionSlice'; 
import { fetchPatients, clearPatientMessages } from '../redux/slices/patientSlice'; 
import DrugForm from './DrugForm';
import PrescriptionForm from './PrescriptionForm'; 
import Modal from '../components/shared/Modal'; 
import StatCard from '../components/shared/StatCard'; 
import Button from '../components/shared/Button';
import Table from '../components/shared/Table'; 
import Spinner from '../components/shared/LoadingSpinner'; 
import { Plus, Archive, Trash2, Package, AlertTriangle, Search } from 'lucide-react'; 
import { toast } from 'react-toastify';

// Helper function to format dates
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
    }).format(new Date(dateString));
};

const Dashboard = () => {
    const dispatch = useDispatch();

    // State Hooks
    const { items: drugs, loading: drugLoading, error: drugError } = useSelector((state) => state.drugs); 
    const { items: prescriptions, loading: prescriptionLoading, error: prescriptionError } = useSelector((state) => state.prescriptions);
    const { items: patients, loading: patientLoading, error: patientError } = useSelector((state) => state.patients);
    
    const drugList = useMemo(() => Array.isArray(drugs) ? drugs : [], [drugs]);
    const prescriptionList = useMemo(() => Array.isArray(prescriptions) ? prescriptions : [], [prescriptions]);
    const patientList = useMemo(() => Array.isArray(patients) ? patients : [], [patients]);

    const [showDrugForm, setShowDrugForm] = useState(false);
    const [editingDrug, setEditingDrug] = useState(null);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch drugs, prescriptions, and patients
    useEffect(() => {
        dispatch(fetchDrugs());
        dispatch(fetchPrescriptions());
        dispatch(fetchPatients({ page: 1, limit: 20 })); // Ensure default pagination values are passed
    }, [dispatch]);

    // Handle loading errors
    useEffect(() => {
        if (drugError) {
            console.error("Drug Error:", drugError);
            toast.error(`Failed to load drugs: ${drugError}`);
            dispatch(clearDrugMessages());
        }
        if (prescriptionError) {
            console.error("Prescription Error:", prescriptionError);
            toast.error(`Failed to load prescriptions: ${prescriptionError}`);
            dispatch(clearPrescriptionMessages());
        }
        if (patientError) {
            console.error("Patient Error:", patientError);
            toast.error(`Failed to load patients: ${patientError}. Check server console for errors.`);
            dispatch(clearPatientMessages());
        }
    }, [dispatch, drugError, prescriptionError, patientError]);

    // Calculate drug statistics
    const drugStats = useMemo(() => {
        if (!drugList.length) return { totalUniqueDrugs: 0, lowStockBelowThreshold: 0, expiredDrugs: 0 }; 
        const LOW_STOCK_DEFAULT = 50;
        const now = new Date();

        const lowStockCount = drugList.filter(d => d.stockQuantity <= (d.lowStockThreshold || LOW_STOCK_DEFAULT)).length;
        const expiredCount = drugList.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length;

        return {
            totalUniqueDrugs: drugList.length,
            lowStockBelowThreshold: lowStockCount,
            expiredDrugs: expiredCount,
        };
    }, [drugList]);

    // Search for drugs
    const searchedAndFilteredDrugs = useMemo(() => {
        if (!searchTerm) return drugList;

        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return drugList.filter(drug => (
            (drug.name && drug.name.toLowerCase().includes(lowercasedSearchTerm)) ||
            (drug.dosage && drug.dosage.toLowerCase().includes(lowercasedSearchTerm)) ||
            String(drug.stockQuantity || 0).includes(lowercasedSearchTerm) ||
            (drug.batchNumber && drug.batchNumber.toLowerCase().includes(lowercasedSearchTerm)) ||
            (drug.manufacturer && drug.manufacturer.toLowerCase().includes(lowercasedSearchTerm))
        ));
    }, [drugList, searchTerm]);

    // Handlers for drugs
    const handleAddDrug = () => setShowDrugForm(true);

    const handleEditDrug = (drug) => {
        if (drug?._id) {
            setEditingDrug(drug);
            setShowDrugForm(true);
        } else {
            toast.error("Invalid drug record selected for editing.");
        }
    };

    const handleDeleteDrug = (id) => {
        if (id && window.confirm("Are you sure you want to delete this drug? This cannot be undone.")) {
            dispatch(deleteDrug(id))
                .unwrap()
                .then(() => toast.success("Drug deleted successfully."))
                .catch((err) => {
                    console.error("Delete Drug Error:", err);
                    toast.error(err?.message || "Failed to delete drug.");
                });
        } else {
            toast.error("Invalid drug ID selected.");
        }
    };

    // Drug table columns
    const drugColumns = useMemo(() => [
        { header: "Name", accessor: "name" },
        { header: "Dosage", accessor: "dosage" },
        { header: "Batch No.", accessor: "batchNumber" },
        { 
            header: "Expiry Date",
            render: (drug) => {
                const isExpired = drug.expiryDate && new Date(drug.expiryDate) < new Date();
                return (
                    <span className={isExpired ? "font-bold text-red-600" : "text-gray-700"}>
                        {formatDate(drug.expiryDate)}
                    </span>
                );
            }
        },
        { header: "Stock Qty", accessor: "stockQuantity" },
        { header: "Actions", render: (drug) => (
            <div className="flex space-x-2 relative z-20"> 
                <Button size="sm" variant="info" onClick={() => handleEditDrug(drug)} icon={<Plus className="w-4 h-4" />}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDeleteDrug(drug._id)} icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
            </div>
        )}
    ], [handleEditDrug, handleDeleteDrug]);

    // Handlers for prescriptions
    const handleAddPrescription = () => setShowPrescriptionForm(true);

    const handleEditPrescription = (prescription) => {
        if (prescription?._id) {
            setEditingPrescription(prescription);
            setShowPrescriptionForm(true);
        } else {
            toast.error("Invalid prescription record selected for editing.");
        }
    };

    const handleDeletePrescription = (id) => {
        if (id && window.confirm("Are you sure you want to delete this prescription? This cannot be undone.")) {
            dispatch(deletePrescription(id))
                .unwrap()
                .then(() => toast.success("Prescription deleted successfully."))
                .catch((err) => {
                    console.error("Delete Prescription Error:", err);
                    toast.error(err?.message || "Failed to delete prescription.");
                });
        } else {
            toast.error("Invalid prescription ID selected.");
        }
    };

    // Functions to get patient and drug names from IDs
    const getPatientName = useCallback((id) => {
        const patient = patientList.find(p => p._id === id);
        return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
    }, [patientList]);

    const getDrugName = useCallback((id) => {
        const drug = drugList.find(d => d._id === id);
        return drug ? `${drug.name} (${drug.dosage})` : 'Unknown Drug';
    }, [drugList]);

    // Prescription table columns
    const prescriptionColumns = useMemo(() => [
        { header: "Patient Name", render: (p) => getPatientName(p.patientId) },
        { header: "Medication", render: (p) => getDrugName(p.drugId) },
        { header: "Dosage", accessor: "dosage" },
        { header: "Quantity", accessor: "quantity" },
        { header: "Date Issued", render: (p) => formatDate(p.issuedDate) },
        { header: "Actions", render: (prescription) => (
            <div className="flex space-x-2 relative z-20">
                <Button size="sm" variant="info" onClick={() => handleEditPrescription(prescription)} icon={<Plus className="w-4 h-4" />}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDeletePrescription(prescription._id)} icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
            </div>
        )}
    ], [handleEditPrescription, handleDeletePrescription, getPatientName, getDrugName]);

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Pharmaceutical Management</h1>

            {/* Search Bar */}
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search drugs by Name, Dosage, Batch No, or Stock Quantity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 pl-10 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                />
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Unique Drugs" value={drugStats.totalUniqueDrugs} icon={<Package />} color="blue" />
                <StatCard title="Low Stock Items" value={drugStats.lowStockBelowThreshold} icon={<AlertTriangle />} detail="Review Thresholds" color="orange" />
                <StatCard title="Expired Drugs" value={drugStats.expiredDrugs} icon={<Archive />} detail="Requires Immediate Disposal" color="red" />
            </div>

            {/* Drug Inventory Section */}
            <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Drug Inventory List</h2>
                    <Button variant="success" onClick={handleAddDrug} icon={<Plus className="w-5 h-5" />}>Add New Drug</Button>
                </div>

                {/* Loading Indicator */}
                {(drugLoading || patientLoading) && <Spinner message={`Fetching inventory...`} />}

                {/* Drug Table Rendering */}
                {!drugLoading ? (
                    searchedAndFilteredDrugs.length > 0 ? (
                        <Table data={searchedAndFilteredDrugs} columns={drugColumns} />
                    ) : (
                        <p className="text-center py-8 text-gray-500">
                            {searchTerm ? `No drugs found matching "${searchTerm}".` : "No drug inventory records found. Click 'Add New Drug' to start."}
                        </p>
                    )
                ) : null}
            </div>

            {/* Prescription Section */}
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Prescription Management</h2>
                    <Button variant="success" onClick={handleAddPrescription} icon={<Plus className="w-5 h-5" />}>Add New Prescription</Button>
                </div>

                {/* Loading Indicator */}
                {prescriptionLoading && <Spinner message={`Fetching current prescriptions...`} />}

                {/* Prescription Table Rendering */}
                {!prescriptionLoading ? (
                    prescriptionList.length > 0 ? (
                        <Table data={prescriptionList} columns={prescriptionColumns} />
                    ) : (
                        <p className="text-center py-8 text-gray-500">No prescription records found. Click 'Add New Prescription' to start.</p>
                    )
                ) : null}
            </div>

            {/* Modal for Drug Form */}
            {showDrugForm && (
                <Modal title={editingDrug ? "Edit Drug Record" : "Add New Drug"} onClose={() => setShowDrugForm(false)}>
                    <DrugForm drugToEdit={editingDrug} onClose={() => setShowDrugForm(false)} />
                </Modal>
            )}

            {/* Modal for Prescription Form */}
            {showPrescriptionForm && (
                <Modal title={editingPrescription ? "Edit Prescription Record" : "Add New Prescription"} onClose={() => setShowPrescriptionForm(false)}>
                    <div className="max-h-[70vh] overflow-y-auto p-1 pr-4"> 
                        <PrescriptionForm 
                            prescriptionToEdit={editingPrescription} 
                            onClose={() => setShowPrescriptionForm(false)} 
                            patientList={patientList} 
                            drugList={drugList}
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;