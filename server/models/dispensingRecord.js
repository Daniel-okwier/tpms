import mongoose from 'mongoose';

const dispensingRecordSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient ID is required'],
    },
    drug: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drug', 
        required: [true, 'Drug ID is required'],
    },
    quantityDispensed: {
        type: Number,
        required: [true, 'Quantity dispensed is required'],
        min: 1,
    },
    dispensedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Dispenser ID is required'],
    },
    dispensingDate: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

const DispensingRecord = mongoose.model('DispensingRecord', dispensingRecordSchema);

export default DispensingRecord;