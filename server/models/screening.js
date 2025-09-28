import mongoose from 'mongoose';
import Patient from './patient.js'; 

const symptomSchema = new mongoose.Schema({
  coughWeeks: { type: Number, default: 0 },
  fever: { type: Boolean, default: false },
  nightSweats: { type: Boolean, default: false },
  weightLoss: { type: Boolean, default: false },
  hemoptysis: { type: Boolean, default: false }
}, { _id: false });

const riskSchema = new mongoose.Schema({
  hivPositive: { type: Boolean, default: false },
  onART: { type: Boolean, default: false },
  diabetes: { type: Boolean, default: false },
  closeContactTB: { type: Boolean, default: false },
  malnourished: { type: Boolean, default: false },
  smoker: { type: Boolean, default: false },
  alcoholUse: { type: Boolean, default: false },
  pregnancy: { type: Boolean, default: false }
}, { _id: false });

const vitalsSchema = new mongoose.Schema({
  heightCm: { type: Number },
  weightKg: { type: Number },
  temperatureC: { type: Number }
}, { _id: false });

const screeningSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  screeningDate: { type: Date, default: Date.now },
  facilityName: { type: String, required: true },

  symptoms: symptomSchema,
  riskFactors: riskSchema,
  vitals: vitalsSchema,

  tbHistory: {
    previousTB: { type: Boolean, default: false },
    previousRegimen: { type: String },
    treatmentOutcome: {
      type: String,
      enum: ['cured', 'completed', 'failed', 'defaulted', 'died', 'unknown'],
      default: 'unknown'
    }
  },

  notes: { type: String },

  screeningOutcome: {
    type: String,
    enum: ['suspected_tb', 'not_suspected'],
    default: 'suspected_tb'
  },

  referToLab: { type: Boolean, default: false },
  priority: { type: String, enum: ['routine', 'priority'], default: 'routine' },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Soft delete
  voided: { type: Boolean, default: false },
  voidReason: { type: String },
  voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  voidedAt: { type: Date }
}, { timestamps: true });

// Indexes
screeningSchema.index({ patient: 1, screeningDate: -1 });
screeningSchema.index({ facilityName: 1, screeningDate: -1 });
screeningSchema.index({ voided: 1 });


 // sync screening outcome with patient classification
 
screeningSchema.post('save', async function (doc) {
  try {
    if (doc.screeningOutcome === 'suspected_tb') {
      await Patient.findByIdAndUpdate(doc.patient, { classification: 'suspected' });
    } else if (doc.screeningOutcome === 'not_suspected') {
      await Patient.findByIdAndUpdate(doc.patient, { classification: 'not_suspected' });
    }
  } catch (err) {
    console.error('Error syncing screening outcome with patient classification:', err.message);
  }
});

const Screening = mongoose.model('Screening', screeningSchema);
export default Screening;
