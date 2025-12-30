import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: [
      
      'patientStats',
      'treatmentOutcomes',
      'labSummary',
      'trends',
      'fullDashboard',
      'treatmentSuccessRate',
      'cohortAnalysis',
      'relapseSummary',
      'quarterlyNTPReport' 
    ],
    required: true
  },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatedAt: { type: Date, default: Date.now },
  filters: { type: Object }, 
  data: { type: Object, required: true }, 
  notes: { type: String },
  fileUrl: { type: String, default: null }, 
}, { timestamps: true });

// Optional indexes for querying by type or date
reportSchema.index({ reportType: 1, generatedAt: -1 });
reportSchema.index({ generatedBy: 1, generatedAt: -1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;