import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDrugs, deleteDrug } from '../../redux/slices/drugSlice';
import DrugForm from '../forms/DrugForm';

const DrugInventoryList = () => {
    const dispatch = useDispatch();
    const { drugs: inventory, loading, error } = useSelector((state) => state.drugs);
    // const userRole = useSelector(selectUserRole); 
    const userRole = 'admin'; 

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDrug, setEditingDrug] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch the initial inventory list
        dispatch(fetchDrugs());
    }, [dispatch]);

    // --- Action Handlers ---
    
    const handleAddDrug = () => {
        setEditingDrug(null);
        setIsFormOpen(true);
    };

    const handleEditDrug = (drug) => {
        setEditingDrug(drug);
        setIsFormOpen(true);
    };

    const handleDeleteDrug = (id, name) => {
        if (userRole !== 'admin') {
            alert('Only Admins can delete drug batches.');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the drug batch for: ${name}?`)) {
            dispatch(deleteDrug(id));
        }
    };
    
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingDrug(null);
    };

    // --- Filtering Logic ---
    const filteredInventory = inventory.filter(drug => 
        drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));

    // --- Conditional Rendering ---
    if (loading === 'pending' && inventory.length === 0) {
        return <p>Loading drug inventory...</p>;
    }

    return (
        <div className="drug-inventory-list">
            <h2>Drug Inventory Management</h2>
            
            {error && <p className="error">{error}</p>}
            
            {/* Control Panel */}
            <div className="control-panel flex justify-between mb-4">
                <input 
                    type="text" 
                    placeholder="Search by name or batch number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border rounded"
                />
                
                {(userRole === 'admin') && (
                    <button onClick={handleAddDrug} className="btn-primary">
                        + Add New Drug Batch
                    </button>
                )}
            </div>
            
            {/* Drug Form Modal/Overlay */}
            {isFormOpen && (
                <div className="modal-overlay">
                    <DrugForm drugToEdit={editingDrug} onClose={handleCloseForm} />
                </div>
            )}
            
            {/* Inventory Table */}
            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Name (Dosage)</th>
                            <th>Batch No.</th>
                            <th>Stock Qty</th>
                            <th>Threshold</th>
                            <th>Expiry Date</th>
                            <th>Manufacturer</th>
                            {(userRole === 'admin') && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.map((drug) => {
                            const isLowStock = drug.stockQuantity <= drug.lowStockThreshold;
                            const isExpired = new Date(drug.expiryDate) < new Date();
                            const rowClass = isExpired ? 'expired-row' : isLowStock ? 'low-stock-row' : '';
                            
                            return (
                                <tr key={drug._id} className={rowClass}>
                                    <td>{drug.name} ({drug.dosage})</td>
                                    <td>{drug.batchNumber}</td>
                                    <td>
                                        {drug.stockQuantity} {drug.unitType}
                                        {isLowStock && <span className="text-red-500 ml-2">(Low!)</span>}
                                    </td>
                                    <td>{drug.lowStockThreshold}</td>
                                    <td>
                                        {new Date(drug.expiryDate).toLocaleDateString()}
                                        {isExpired && <span className="text-red-700 ml-2 font-bold">(EXPIRED)</span>}
                                    </td>
                                    <td>{drug.manufacturer}</td>
                                    
                                    {(userRole === 'admin') && (
                                        <td className="actions-cell">
                                            <button onClick={() => handleEditDrug(drug)} className="btn-edit mr-2">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteDrug(drug._id, drug.name)} className="btn-delete">
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DrugInventoryList;