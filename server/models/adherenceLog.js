import mongoose from 'mongoose';

const adherenceSchema = new mongoose.Schema({
  treatment: { type: mongoose.Schema.Types.ObjectId, ref: 'Treatment', required: true }, // link to treatment
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doseDate: { type: Date, required: true }, // the date of the dose
  taken: { type: Boolean, required: true, default: false }, // true = dose taken, false = missed
  observedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who recorded the dose (nurse/chw) or null if self-report
  method: { type: String, enum: ['DOT', 'self', 'sms', 'phone'], default: 'DOT' }, // how dose was observed/reported
  notes: { type: String },
  verified: { type: Boolean, default: false }, // doctor/nurse verification
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },

  // audit / soft-delete
  voided: { type: Boolean, default: false },
  voidReason: { type: String },
  voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  voidedAt: { type: Date }
}, { timestamps: true });

// indexes for common queries
adherenceSchema.index({ patient: 1, doseDate: 1 }, { unique: true }); // one log per patient per date
adherenceSchema.index({ treatment: 1, doseDate: -1 });
adherenceSchema.index({ taken: 1, verified: 1 });

const AdherenceLog = mongoose.model('AdherenceLog', adherenceSchema);
export default AdherenceLog;
