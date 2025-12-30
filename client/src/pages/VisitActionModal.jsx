import React, { useState, useEffect } from "react";

const VisitActionModal = ({ open, date, action, initialData, onClose, onSubmit }) => {
    // Determine initial status based on action or initial data
    const initialStatus = initialData.status || (action === 'complete' ? 'completed' : action === 'missed' ? 'missed' : '');

    // Initialize form data and status override
    const [formData, setFormData] = useState({
        weightKg: initialData.weightKg || "",
        notes: initialData.notes || "",
    });
    
    const [statusOverride, setStatusOverride] = useState(initialStatus); 

    // Reset form data and status when initialData or action prop changes
    useEffect(() => {
        setFormData({
            weightKg: initialData.weightKg || "",
            notes: initialData.notes || "",
        });
        setStatusOverride(initialStatus);
    }, [initialData, action, initialStatus]);

    if (!open) return null;

    const displayDate = date ? new Date(date).toLocaleDateString() : 'N/A';
    const isClinicalDataEntry = statusOverride === 'completed';
    const isNotesRequired = true;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusToggle = (newStatus) => {
        if (action === 'edit') {
            setStatusOverride(newStatus);
            if (newStatus === 'missed') {
                // Clear weight if status is toggled to missed during edit
                setFormData(prev => ({ ...prev, weightKg: "" }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Determine the status that will be sent for the follow-up record
        const finalStatus = action === 'edit' 
            ? statusOverride 
            : action === 'complete' ? 'completed' : action === 'missed' ? 'missed' : '';


        if (finalStatus === 'completed' && !formData.weightKg) {
            alert("Weight is required for a completed visit.");
            return;
        }
        if (isNotesRequired && !formData.notes) {
            alert("Notes/Reason are required for this action.");
            return;
        }

        // 2. Prepare the payload with the explicit finalStatus
        const payload = {
            // Only include weight if the final status is 'completed'
            weightKg: finalStatus === 'completed' ? Number(formData.weightKg) : undefined,
            notes: formData.notes,
            // 🔥 FIX APPLIED: Ensure the status is always present in the payload
            status: finalStatus,
        };

        onSubmit(payload);
    };

    const getTitle = () => {
        switch (action) {
            case 'complete': return `Mark Visit Complete: ${displayDate}`;
            case 'missed': return `Mark Visit Missed: ${displayDate}`;
            case 'edit': return `Edit Follow-up Data/Status: ${displayDate}`;
            default: return 'Visit Action';
        }
    };

    return (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">{getTitle()}</h2>

                <form onSubmit={handleSubmit}>
                    {/* STATUS TOGGLE - ONLY VISIBLE WHEN EDITING */}
                    {action === 'edit' && (
                        <div className="mb-4 p-3 bg-gray-50 border rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Visit Status</label>
                            <div className="flex space-x-3">
                                {['completed', 'missed'].map(status => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => handleStatusToggle(status)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                                            statusOverride === status 
                                                ? (status === 'completed' ? 'bg-green-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md') 
                                                : 'bg-white text-gray-700 border hover:bg-gray-100'
                                        }`}
                                    >
                                        Mark {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* WEIGHT FIELD - Only shown for complete status */}
                    {isClinicalDataEntry && (
                        <div className="mb-4">
                            <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700">
                                **Weight (kg)** <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="weightKg"
                                name="weightKg"
                                value={formData.weightKg}
                                onChange={handleChange}
                                step="0.1"
                                className="mt-1 block w-full px-3 py-2 border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                                required={isClinicalDataEntry}
                            />
                        </div>
                    )}

                    {/* NOTES FIELD - Always shown and required */}
                    <div className="mb-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            **Notes** (Reason for Missed/Details for Complete) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                            required={isNotesRequired}
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            {action === 'edit' ? 'Update Data & Status' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VisitActionModal;