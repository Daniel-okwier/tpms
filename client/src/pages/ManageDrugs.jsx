import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDrugs, deleteDrug, clearDrugMessages } from '../redux/slices/drugSlice'; 
import DrugForm from './DrugForm';
import Modal from '../components/shared/Modal'; 
import StatCard from '../components/shared/StatCard'; 
import Button from '../components/shared/Button';
import Table from '../components/shared/Table'; 
import Spinner from '../components/shared/LoadingSpinner'; 
import { Plus, Archive, Trash2, Package, AlertTriangle, Search } from 'lucide-react'; 
import { toast } from 'react-toastify';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { items: drugs, loading, error } = useSelector((state) => state.drugs); 
    const drugList = useMemo(() => Array.isArray(drugs) ? drugs : [], [drugs]);

    const [showDrugForm, setShowDrugForm] = useState(false);
    const [editingDrug, setEditingDrug] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchDrugs());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            console.error("Dashboard Error:", error);
            toast.error(`Failed to load data: ${error}`);
            dispatch(clearDrugMessages());
        }
    }, [dispatch, error]);

    const drugStats = useMemo(() => {
        if (!drugList.length) return { totalUniqueDrugs: 0, lowStockBelowThreshold: 0, expiredDrugs: 0 }; 
        const LOW_STOCK_DEFAULT = 50;

        const lowStockCount = drugList.filter(d => d.stockQuantity <= (d.lowStockThreshold || LOW_STOCK_DEFAULT)).length;
        const expiredCount = drugList.filter(d => new Date(d.expiryDate) < new Date()).length;

        return {
            totalUniqueDrugs: drugList.length,
            lowStockBelowThreshold: lowStockCount,
            expiredDrugs: expiredCount,
        };
    }, [drugList]);

    const searchedAndFilteredDrugs = useMemo(() => {
        if (!searchTerm) {
            return drugList;
        }
        const lowercasedSearchTerm = searchTerm.toLowerCase();

        return drugList.filter(drug => {
            const matchesName = drug.name && drug.name.toLowerCase().includes(lowercasedSearchTerm);
            const matchesDosage = drug.dosage && drug.dosage.toLowerCase().includes(lowercasedSearchTerm);
            const matchesQuantity = String(drug.stockQuantity || 0).includes(lowercasedSearchTerm); 

            return matchesName || matchesDosage || matchesQuantity;
        });
    }, [drugList, searchTerm]);

    const handleAddDrug = useCallback(() => {
        setEditingDrug(null);
        setShowDrugForm(true);
    }, []);

    const handleEditDrug = useCallback((drug) => {
        if (drug?._id) {
            setEditingDrug(drug);
            setShowDrugForm(true);
        } else {
            toast.error("Invalid drug record selected for editing.");
        }
    }, []);

    const handleDeleteDrug = useCallback((id) => {
        if (id) {
            if (window.confirm("Are you sure you want to delete this drug? This cannot be undone.")) {
                dispatch(deleteDrug(id))
                    .unwrap()
                    .then(() => {
                        toast.success("Drug deleted successfully.");
                    })
                    .catch((err) => {
                        console.error("Delete Drug Error:", err);
                        toast.error(err?.message || "Failed to delete drug.");
                    });
            }
        } else {
            toast.error("Invalid drug ID selected.");
        }
    }, [dispatch]);

    const columns = useMemo(() => [
        { header: "Name", accessor: "name" },
        { header: "Dosage", accessor: "dosage" },
        { header: "Stock Qty", accessor: "stockQuantity" },
        { header: "Actions", render: (drug) => (
            // FIX: Added relative and z-20 for layering assurance
            <div className="flex space-x-2 relative z-20"> 
                <Button 
                    size="sm" 
                    variant="info"
                    onClick={() => handleEditDrug(drug)} 
                    icon={<Plus className="w-4 h-4" />}
                    disabled={!drug?._id}
                >
                    Edit
                </Button>
                <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => drug && handleDeleteDrug(drug._id)}
                    icon={<Trash2 className="w-4 h-4" />}
                    disabled={!drug?._id}
                >
                    Delete
                </Button>
            </div>
        )},
    ], [handleEditDrug, handleDeleteDrug]);

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Pharmaceutical Inventory Management</h1>

            {/* Search Bar */}
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by Name, Dosage, or Stock Quantity..."
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

            {/* Main Content Pane - Set a moderate z-index to stay below modal but above background */}
            <div className="bg-white p-6 rounded-lg shadow-xl relative z-10"> 
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Drug Inventory List</h2>
                    <Button variant="success" onClick={handleAddDrug} icon={<Plus className="w-5 h-5" />}>Add New Drug</Button>
                </div>

                {/* Loading Indicator */}
                {loading && <Spinner message={`Fetching current inventory...`} />}

                {/* Table Rendering */}
                {!loading ? (
                    searchedAndFilteredDrugs.length > 0 ? (
                        <Table data={searchedAndFilteredDrugs} columns={columns} />
                    ) : (
                        <p className="text-center py-8 text-gray-500">
                            {searchTerm ? `No drugs found matching "${searchTerm}".` : "No drug inventory records found. Click 'Add New Drug' to start."}
                        </p>
                    )
                ) : null}
            </div>

            {/* Modal for Drug Form */}
            {/* The Modal component MUST handle its own high z-index (z-50) and full removal on close */}
            {showDrugForm && (
                <Modal title={editingDrug ? "Edit Drug Record" : "Add New Drug"} onClose={() => setShowDrugForm(false)}>
                    <DrugForm drugToEdit={editingDrug} onClose={() => setShowDrugForm(false)} />
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;