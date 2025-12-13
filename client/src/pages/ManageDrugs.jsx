import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDrugs, fetchDispensingHistory } from "@/redux/slices/drugSlice";
import { Plus, Archive, History, Pill, AlertTriangle, Package } from "lucide-react";
//import { toast } from "react-toastify";

//import Button from "@/components/shared/Button"; 
import LoadingSpinner from "@/components/shared/LoadingSpinner"; 
import { Alert } from 'react-bootstrap'; 

//Helper function for dynamic class colors (used in rendering Status)
const getStatusClass = (qty, threshold) => {
    if (qty < threshold) {
        return "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800";
    }
    return "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800";
};

const ManageDrugs = () => {
    const dispatch = useDispatch();
    const { drugs, dispensingHistory, loading, error } = useSelector((state) => state.drugs);
    const [activeTab, setActiveTab] = useState('inventory');

    const LOW_STOCK_THRESHOLD = 50;

    useEffect(() => {
        if (activeTab === 'inventory') {
            dispatch(fetchDrugs());
        }
        if (activeTab === 'history' && dispensingHistory.length === 0) {
            dispatch(fetchDispensingHistory());
        }

        if (error) {
            console.error(`Error: ${error}`); 
        }
    }, [dispatch, activeTab, error, dispensingHistory.length]);
    
    // Derived state for the low stock summary card
    const lowStockDrugs = drugs.filter(d => d.stockQuantity < LOW_STOCK_THRESHOLD);
    const expiredDrugs = drugs.filter(d => new Date(d.expiryDate) < new Date());

    if (loading === 'pending' && drugs.length === 0) return <LoadingSpinner message="Loading Pharmacy Data..." />;
    
    if (error) return <Alert variant='danger' className="mt-4">{error}</Alert>;

    // --- Helper function to render table rows ---
    const renderTableRows = (data, columns) => {
        if (!data || data.length === 0) {
            return (
                <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                        {activeTab === 'inventory' ? "No drug inventory items found." : "No dispensing history records found."}
                    </td>
                </tr>
            );
        }

        return data.map((item) => (
            <tr key={item._id} className="border-b hover:bg-gray-50">
                {columns.map((col, index) => {
                    const value = col.accessor.split('.').reduce((acc, part) => acc && acc[part], item);

                    const content = col.render ? col.render(item) : value;

                    return (
                        <td key={index} className="px-4 py-2">
                            {/* Special handling for Status and Stock Qty for direct content */}
                            {col.header === "Status" ? (
                                <span className={getStatusClass(item.stockQuantity, LOW_STOCK_THRESHOLD)}>
                                    {item.stockQuantity < LOW_STOCK_THRESHOLD ? (<><AlertTriangle className="w-3 h-3 mr-1" /> Low Stock</>) : "In Stock"}
                                </span>
                            ) : col.header === "Stock Qty" ? (
                                <span className={item.stockQuantity < LOW_STOCK_THRESHOLD ? "font-extrabold text-red-600" : "font-semibold text-green-600"}>
                                    {item.stockQuantity}
                                </span>
                            ) : (
                                content
                            )}
                        </td>
                    );
                })}
            </tr>
        ));
    };

    // --- Table Headers ---
    const inventoryHeaders = ["Name", "Dosage", "Batch No.", "Stock Qty", "Unit Type", "Expiry Date", "Status", "Actions"];
    const historyHeaders = ["Date", "Patient ID", "Drug", "Quantity", "Dispensed By", "Notes"];

    const inventoryColumns = [
        { accessor: "name" },
        { accessor: "dosage" },
        { accessor: "batchNumber" },
        { accessor: "stockQuantity" },
        { accessor: "unitType" },
        { accessor: "expiryDate", render: (item) => new Date(item.expiryDate).toLocaleDateString() },
        { accessor: "status" }, // Status handled specially in renderTableRows
        { 
            accessor: "actions", 
            render: (item) => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => console.log('Dispense', item.name)}>Dispense</Button>
                    <Button size="sm" variant="info" onClick={() => console.log('Edit', item.name)}>Edit</Button>
                </div>
            )
        },
    ];

    const historyColumns = [
        { accessor: "dispensingDate", render: (item) => new Date(item.dispensingDate).toLocaleString() },
        { accessor: "patient.patientId" },
        { accessor: "drug.name", render: (item) => `${item.drug.name} (${item.drug.dosage})` },
        { accessor: "quantityDispensed" },
        { accessor: "dispensedBy.fullName" },
        { accessor: "notes" },
    ];


    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            
            <h1 className="text-3xl font-extrabold mb-6 text-gray-900 flex items-center">
                <Pill className="w-7 h-7 mr-3 text-blue-600" />
                Pharmacy Management Dashboard
            </h1>
            
            {/* Tab Navigation */}
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`py-3 px-1 text-base font-semibold transition duration-150 ${
                            activeTab === 'inventory'
                                ? 'border-b-4 border-blue-600 text-blue-800'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Archive className="inline-block w-4 h-4 mr-2" /> Drug Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`py-3 px-1 text-base font-semibold transition duration-150 ${
                            activeTab === 'history'
                                ? 'border-b-4 border-blue-600 text-blue-800'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <History className="inline-block w-4 h-4 mr-2" /> Dispensing History
                    </button>
                </nav>
            </div>

            {/* --- Low Stock KPIs/Alerts (Visible only on Inventory tab) --- */}
            {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* KPI Cards (Styled exactly like your dashboard) */}
                    <div className="p-6 bg-indigo-600 rounded-xl shadow-lg border-b-4 border-indigo-700 transition transform hover:scale-[1.01]">
                        <p className="text-sm font-semibold opacity-90 text-white">Total Unique Drugs</p>
                        <p className="text-4xl font-extrabold mt-1 text-white">{drugs.length}</p>
                    </div>

                    <div className={`p-6 rounded-xl shadow-lg border-b-4 transition transform hover:scale-[1.01] ${lowStockDrugs.length > 0 ? 'bg-red-500 border-red-700' : 'bg-emerald-500 border-emerald-700'}`}>
                        <p className="text-sm font-semibold opacity-90 text-white">Low Stock Alerts (Below {LOW_STOCK_THRESHOLD})</p>
                        <p className="text-4xl font-extrabold mt-1 text-white">{lowStockDrugs.length}</p>
                    </div>

                    <div className={`p-6 rounded-xl shadow-lg border-b-4 transition transform hover:scale-[1.01] ${expiredDrugs.length > 0 ? 'bg-yellow-500 border-yellow-700' : 'bg-gray-500 border-gray-700'}`}>
                        <p className="text-sm font-semibold opacity-90 text-white">Expired Drugs ({new Date().toLocaleDateString()})</p>
                        <p className="text-4xl font-extrabold mt-1 text-white">{expiredDrugs.length}</p>
                    </div>
                </div>
            )}


            {/* --- Main Content Area (Table View) --- */}
            <div className="bg-white p-6 rounded-xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        {activeTab === 'inventory' ? "Current Drug Inventory List" : "Recent Dispensing Records"}
                    </h2>
                    {activeTab === 'inventory' && (
                        <Button 
                            icon={<Plus className="w-5 h-5" />} 
                            variant="primary"
                            onClick={() => console.log('Open Add Drug Modal')}
                        >
                            Add New Drug
                        </Button>
                    )}
                </div>
                
                {loading === 'pending' && drugs.length > 0 && <Alert variant='info'>Updating data...</Alert>}

                <div className="overflow-x-auto">
                    <table className="w-full table-auto border border-gray-300 bg-white text-black rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                {/* Use the appropriate headers based on the active tab */}
                                {(activeTab === 'inventory' ? inventoryHeaders : historyHeaders).map((header, index) => (
                                    <th key={index} className="border px-4 py-2 text-left font-semibold">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Display loading/error/no data messages */}
                            {loading === 'pending' && drugs.length === 0 && (
                                <tr><td colSpan={activeTab === 'inventory' ? inventoryHeaders.length : historyHeaders.length} className="text-center py-4">Loading...</td></tr>
                            )}
                            
                            {/* Render rows using the helper function */}
                            {activeTab === 'inventory' ? renderTableRows(drugs, inventoryColumns) : renderTableRows(dispensingHistory, historyColumns)}

                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default ManageDrugs;