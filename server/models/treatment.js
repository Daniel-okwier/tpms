import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  weightKg: Number,
  pillCount: Number,
  sideEffects: String,
  notes: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const treatmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  diagnosis: { type: mongoose.Schema.Types.ObjectId, ref: 'Diagnosis', required: true }, // Link to diagnosis
  regimen: {
    type: String,
    required: true,
    enum: ['2HRZE/4HR', '6HRZE', 'MDR-TB Regimen', 'Other']
  },
  weightKg: { type: Number }, // May influence dosing
  startDate: { type: Date, required: true },
  expectedEndDate: { type: Date, required: true },
  actualEndDate: { type: Date },
  status: {
    type: String,
    enum: ['planned', 'ongoing', 'completed', 'defaulted', 'failed', 'stopped'],
    default: 'planned'
  },
  visitSchedule: [ 
    { type: Date }
  ],
  followUps: [followUpSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  archived: { type: Boolean, default: false }
}, { timestamps: true });

// Create an index on patient and startDate for efficient querying
treatmentSchema.index({ patient: 1, startDate: -1 });

const Treatment = mongoose.model('Treatment', treatmentSchema);
export default Treatment;