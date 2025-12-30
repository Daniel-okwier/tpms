import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { createDrug, updateDrug } from '../redux/slices/drugSlice'; 
import { toast } from 'react-toastify';
import Button from '../components/shared/Button'; 

const DrugForm = ({ drugToEdit, onClose }) => {
    const dispatch = useDispatch();
    
    // Core Fields
    const [name, setName] = useState(drugToEdit?.name || '');
    const [dosage, setDosage] = useState(drugToEdit?.dosage || '');
    const [quantity, setQuantity] = useState(drugToEdit?.stockQuantity || '');
    
    // CRITICAL FIX: Batch Number field to satisfy unique index constraint on the server
    const [batchNumber, setBatchNumber] = useState(drugToEdit?.batchNumber || ''); 

    // Inventory/Tracking Fields
    const [lowStockThreshold, setLowStockThreshold] = useState(drugToEdit?.lowStockThreshold || 50); 
    
    // Optional Fields from Schema (Manufacturer and Price)
    const [manufacturer, setManufacturer] = useState(drugToEdit?.manufacturer || '');
    const [price, setPrice] = useState(drugToEdit?.price || '');

    const [expiryDate, setExpiryDate] = useState(() => {
        if (drugToEdit?.expiryDate) {
            // Format date for input type="date" (YYYY-MM-DD)
            return new Date(drugToEdit.expiryDate).toISOString().split('T')[0];
        }
        return '';
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial state sync 
    useEffect(() => {
        if (drugToEdit) {
            setName(drugToEdit.name || '');
            setDosage(drugToEdit.dosage || '');
            setQuantity(drugToEdit.stockQuantity || '');
            setBatchNumber(drugToEdit.batchNumber || ''); // Sync Batch Number
            setLowStockThreshold(drugToEdit.lowStockThreshold || 50); 
            setManufacturer(drugToEdit.manufacturer || '');
            setPrice(drugToEdit.price || '');
            setExpiryDate(drugToEdit.expiryDate ? new Date(drugToEdit.expiryDate).toISOString().split('T')[0] : '');
        } else {
            // Reset for Add Drug form
            setName('');
            setDosage('');
            setQuantity('');
            setBatchNumber(''); // Reset Batch Number
            setLowStockThreshold(50);
            setManufacturer('');
            setPrice('');
            setExpiryDate('');
        }
    }, [drugToEdit]);


    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Date Fix: Convert date input to ISO string for Mongoose/MongoDB
        const dateToSend = expiryDate ? new Date(expiryDate).toISOString() : null;

        const drugData = {
            name: name.trim(),
            dosage: dosage.trim(),
            stockQuantity: parseInt(quantity, 10),
            expiryDate: dateToSend,
            lowStockThreshold: parseInt(lowStockThreshold, 10), 
            batchNumber: batchNumber.trim(), // Include required Batch Number
            
            // Explicitly include optional fields
            manufacturer: manufacturer.trim() || '', 
            price: price ? parseFloat(price) : null,
        };

        // Comprehensive Frontend Validation Check
        if (!drugData.name || !drugData.dosage || isNaN(drugData.stockQuantity) || drugData.stockQuantity < 0 || !drugData.expiryDate || isNaN(drugData.lowStockThreshold) || !drugData.batchNumber) {
            toast.error("Please ensure all mandatory fields are correctly filled.");
            setIsSubmitting(false);
            return;
        }

        const action = drugToEdit 
            ? updateDrug({ id: drugToEdit._id, updateData: drugData }) 
            : createDrug(drugData);

        dispatch(action)
            .unwrap()
            .then(() => {
                toast.success(`Drug ${drugToEdit ? "updated" : "added"} successfully!`);
                onClose(); 
            })
            .catch((error) => {
                console.error("Form Submission Error:", error);
                const serverMessage = error?.response?.data?.message;
                const message = serverMessage || error?.message || `Failed to ${drugToEdit ? "update" : "save"} drug.`;
                toast.error(message);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }, [name, dosage, quantity, lowStockThreshold, expiryDate, batchNumber, manufacturer, price, drugToEdit, dispatch, onClose]);

    const isEditMode = Boolean(drugToEdit);

    return (
        <form onSubmit={handleSubmit} className="p-4 rounded-lg space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit Drug Details" : "Add New Drug"}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="flex flex-col">
                    <label htmlFor="drug-name" className="text-gray-900 font-medium mb-1">Drug Name</label>
                    <input 
                        id="drug-name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900" 
                        required 
                    />
                </div>
                
                {/* Dosage */}
                <div className="flex flex-col">
                    <label htmlFor="dosage" className="text-gray-900 font-medium mb-1">Dosage/Formulation</label>
                    <input 
                        id="dosage"
                        type="text" 
                        value={dosage} 
                        onChange={(e) => setDosage(e.target.value)} 
                        className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900" 
                        required 
                    />
                </div>

                {/* Batch Number (New Required Field) */}
                <div className="flex flex-col">
                    <label htmlFor="batchNumber" className="text-gray-900 font-medium mb-1">Batch Number</label>
                    <input 
                        id="batchNumber"
                        type="text" 
                        value={batchNumber} 
                        onChange={(e) => setBatchNumber(e.target.value)} 
                        className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900" 
                        required 
                    />
                </div>
                
                {/* Quantity */}
                <div className="flex flex-col">
                    <label htmlFor="quantity" className="text-gray-900 font-medium mb-1">Stock Quantity</label>
                    <input 
                        id="quantity"
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                        className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900" 
                        required 
                        min="0"
                    />
                </div>
                
                {/* Low Stock Threshold */}
                <div className="flex flex-col">
                    <label htmlFor="low-stock-threshold" className="text-gray-900 font-medium mb-1">Low Stock Threshold</label>
                    <input 
                        id="low-stock-threshold"
                        type="number" 
                        value={lowStockThreshold} 
                        onChange={(e) => setLowStockThreshold(e.target.value)} 
                        className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900" 
                        required 
                        min="1"
                    />
                </div>

                {/* Expiry Date */}
                <div className="flex flex-col">
                    <label htmlFor="expiry-date" className="text-gray-900 font-medium mb-1">Expiry Date</label>
                    <input 
                        id="expiry-date"
                        type="date" 
                        value={expiryDate} 
                        onChange={(e) => setExpiryDate(e.target.value)} 
                        className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900" 
                        required 
                    />
                </div>

                {/* Manufacturer (Optional Field) */}
                <div className="flex flex-col">
                    <label htmlFor="manufacturer" className="text-gray-900 font-medium mb-1">Manufacturer (Optional)</label>
                    <input 
                        id="manufacturer"
                        type="text" 
                        value={manufacturer} 
                        onChange={(e) => setManufacturer(e.target.value)} 
                        className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900" 
                    />
                </div>

                {/* Price (Optional Field) */}
                <div className="flex flex-col">
                    <label htmlFor="price" className="text-gray-900 font-medium mb-1">Price (Optional)</label>
                    <input 
                        id="price"
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900" 
                        min="0"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
                <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={onClose} 
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : isEditMode ? "Update Drug" : "Add Drug"}
                </Button>
            </div>
        </form>
    );
};

export default DrugForm;