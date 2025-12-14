import mongoose from 'mongoose';

const drugSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    dosage: {
        type: String,
        required: true,
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    manufacturer: {
        type: String,
    },
    expiryDate: {
        type: Date, 
        required: true, 
    },
    price: {
        type: Number,
        required: false,
    },
}, { timestamps: true });

const Drug = mongoose.model('Drug', drugSchema);

export default Drug;