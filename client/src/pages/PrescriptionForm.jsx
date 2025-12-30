import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createPrescription, updatePrescription } from '../redux/slices/prescriptionSlice';
import { toast } from 'react-toastify';
import Button from '../components/shared/Button'; 

const PrescriptionForm = ({ prescriptionToEdit, onClose, drugList = [], patientList = [] }) => {
    const dispatch = useDispatch();

    const [patientId, setPatientId] = useState('');
    const [drugId, setDrugId] = useState(''); 
    const [dosage, setDosage] = useState(''); 
    const [quantity, setQuantity] = useState(''); 
    const [issuedDate, setIssuedDate] = useState(''); 
    const [notes, setNotes] = useState(''); 

    useEffect(() => {
        if (prescriptionToEdit) {
            setPatientId(prescriptionToEdit.patientId || '');
            setDrugId(prescriptionToEdit.drugId || ''); 
            setDosage(prescriptionToEdit.dosage || ''); 
            setQuantity(prescriptionToEdit.quantity || '');
            setNotes(prescriptionToEdit.notes || ''); 
            setIssuedDate(prescriptionToEdit.issuedDate ? new Date(prescriptionToEdit.issuedDate).toISOString().split('T')[0] : ''); 
        } else {
            setPatientId('');
            setDrugId('');
            setDosage('');
            setQuantity('');
            setNotes('');
            setIssuedDate(new Date().toISOString().split('T')[0]); // Default to today's date for new forms
        }
    }, [prescriptionToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!patientId || !drugId || !dosage.trim() || !quantity || !issuedDate) {
            toast.error("Please fill out all mandatory fields: Patient, Drug, Dosage, Quantity, and Issued Date.");
            return;
        }

        const prescriptionData = {
            patientId, 
            drugId,     
            dosage: dosage.trim(), 
            quantity: parseInt(quantity, 10),
            issuedDate: new Date(issuedDate).toISOString(), 
            notes: notes.trim(), 
        };

        const action = prescriptionToEdit 
            ? updatePrescription({ id: prescriptionToEdit._id, updateData: prescriptionData })
            : createPrescription(prescriptionData);

        dispatch(action)
            .unwrap()
            .then(() => {
                toast.success(`Prescription ${prescriptionToEdit ? "updated" : "created"} successfully!`);
                onClose();
            })
            .catch((error) => {
                console.error("Prescription Submission Error:", error);
                const message = error?.response?.data?.message || error?.message || "Failed to save prescription.";
                toast.error(message);
            });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-5 bg-white rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800">{prescriptionToEdit ? "Edit Prescription" : "Add New Prescription"}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient Selection (Required) */}
                <div>
                    <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                    <select
                        id="patient-select"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        required
                        className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                        disabled={!patientList.length}
                    >
                        <option value="">-- Select Patient --</option>
                        {patientList.map(patient => (
                            <option key={patient._id} value={patient._id}>
                                {patient.firstName} {patient.lastName} ({patient.nationalId || patient._id.slice(-4)})
                            </option>
                        ))}
                    </select>
                    {!patientList.length && <p className="text-xs text-red-500 mt-1">No patients available.</p>}
                </div>
                
                {/* Drug/Medication Selection (Required) */}
                <div>
                    <label htmlFor="drug-select" className="block text-sm font-medium text-gray-700 mb-1">Medication (Drug) *</label>
                    <select
                        id="drug-select"
                        value={drugId}
                        onChange={(e) => setDrugId(e.target.value)}
                        required
                        className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                        disabled={!drugList.length}
                    >
                        <option value="">-- Select Drug --</option>
                        {drugList.map(drug => (
                            <option key={drug._id} value={drug._id}>
                                {drug.name} ({drug.dosage}) - Stock: {drug.stockQuantity}
                            </option>
                        ))}
                    </select>
                    {!drugList.length && <p className="text-xs text-red-500 mt-1">No drugs available in inventory.</p>}
                </div>

                {/* Dosage (Required) */}
                <div>
                    <label htmlFor="dosage-input" className="block text-sm font-medium text-gray-700 mb-1">Dosage/Instructions *</label>
                    <input 
                        id="dosage-input"
                        type="text" 
                        value={dosage} 
                        onChange={(e) => setDosage(e.target.value)} 
                        required 
                        placeholder="e.g., 1 tablet three times a day for 7 days"
                        className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                    />
                </div>
                
                {/* Quantity (Required) */}
                <div>
                    <label htmlFor="quantity-dispensed" className="block text-sm font-medium text-gray-700 mb-1">Quantity Dispensed *</label>
                    <input 
                        id="quantity-dispensed"
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                        required 
                        min="1"
                        className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                    />
                </div>

                {/* Issued Date (Required) */}
                <div>
                    <label htmlFor="issued-date" className="block text-sm font-medium text-gray-700 mb-1">Issued Date *</label>
                    <input 
                        id="issued-date"
                        type="date" 
                        value={issuedDate} 
                        onChange={(e) => setIssuedDate(e.target.value)} 
                        required 
                        className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                    />
                </div>
            </div>

            {/* Notes (Optional) */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                    id="notes"
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Patient allergic to penicillin. Follow up in one week."
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-3">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary">
                    {prescriptionToEdit ? "Update Prescription" : "Add Prescription"}
                </Button>
            </div>
        </form>
    );
};

export default PrescriptionForm;