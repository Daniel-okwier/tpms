import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    drugId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drug',
        required: true,
    },
    dosage: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    issuedDate: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
    },
}, { timestamps: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;