import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPrescriptions, deletePrescription } from '../redux/slices/prescriptionSlice';
import PrescriptionForm from './PrescriptionForm'; 
import Button from '../components/shared/Button'; 
import { toast } from 'react-toastify';

const PrescriptionList = () => {
    const dispatch = useDispatch();
    const prescriptions = useSelector(state => state.prescriptions.items);
    const loading = useSelector(state => state.prescriptions.loading);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState(null);

    useEffect(() => {
        dispatch(fetchPrescriptions());
    }, [dispatch]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this prescription?")) {
            dispatch(deletePrescription(id))
                .unwrap()
                .then(() => {
                    toast.success("Prescription deleted successfully!");
                })
                .catch((error) => {
                    toast.error("Failed to delete prescription: " + error.message);
                });
        }
    };

    const handleEdit = (prescription) => {
        setEditingPrescription(prescription);
        setIsEditing(true);
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Prescription Management</h2>
            <PrescriptionForm 
                prescriptionToEdit={isEditing ? editingPrescription : null} 
                onClose={() => {
                    setIsEditing(false);
                    setEditingPrescription(null);
                }} 
            />
            {loading ? (
                <p>Loading prescriptions...</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Patient Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Medication</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {prescriptions.map((prescription) => (
                            <tr key={prescription._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{prescription.patientName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{prescription.medication}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(prescription.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Button variant="primary" onClick={() => handleEdit(prescription)}>Edit</Button>
                                    <Button variant="danger" onClick={() => handleDelete(prescription._id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PrescriptionList;