import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { dispenseDrug } from '../redux/slices/drugSlice';
import { fetchPatients } from '../redux/slices/patientSlice'; 

const DispenseModal = ({ show, handleClose, drug }) => {
    const dispatch = useDispatch();
    const { patients } = useSelector((state) => state.patients);
    const { loading, error } = useSelector((state) => state.drugs);

    const [patientId, setPatientId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Fetch patient list on mount
    useEffect(() => {
        dispatch(fetchPatients());
    }, [dispatch]);

    useEffect(() => {
        if (!show) {
            // Reset state when modal is closed
            setPatientId('');
            setQuantity(1);
            setNotes('');
            setSuccessMsg('');
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMsg('');

        const dispenseData = {
            patient: patientId,
            drug: drug._id,
            quantityDispensed: quantity,
            notes,
        };

        try {
            await dispatch(dispenseDrug(dispenseData)).unwrap();
            setSuccessMsg(`Successfully dispensed ${quantity} units of ${drug.name}.`);
            
            // Note: Inventory update happens via re-fetch in the thunk
            setTimeout(handleClose, 2000); 

        } catch (err) {
            // Error handling is managed by the slice state (error)
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Dispense Drug: {drug.name} ({drug.dosage})</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {successMsg && <Alert variant='success'>{successMsg}</Alert>}
                {error && <Alert variant='danger'>{error}</Alert>}
                
                <p className="font-semibold text-gray-700">
                    Available Stock: <span className="text-xl text-indigo-600">{drug.stockQuantity}</span>
                </p>

                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="patient" className="mb-3">
                        <Form.Label>Select Patient</Form.Label>
                        <Form.Select 
                            value={patientId} 
                            onChange={(e) => setPatientId(e.target.value)} 
                            required
                        >
                            <option value="">-- Choose Patient --</option>
                            {patients.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.fullName} (ID: {p.patientId})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group controlId="quantity" className="mb-3">
                        <Form.Label>Quantity to Dispense</Form.Label>
                        <Form.Control
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.min(parseInt(e.target.value, 10), drug.stockQuantity))}
                            min="1"
                            max={drug.stockQuantity}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="notes" className="mb-3">
                        <Form.Label>Notes (e.g., Duration, Next Pickup)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Form.Group>

                    <Button 
                        variant="success" 
                        type="submit" 
                        className="w-100 mt-3" 
                        disabled={loading === 'pending' || !patientId || quantity > drug.stockQuantity || quantity < 1}
                    >
                        {loading === 'pending' ? 'Processing...' : 'Record Dispense'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default DispenseModal;