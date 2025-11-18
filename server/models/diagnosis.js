import mongoose from 'mongoose';

const diagnosisSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    labTests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabTest',
      },
    ],
    diagnosisType: {
      type: String,
      enum: ['Pulmonary TB', 'Extra-pulmonary TB', 'No TB', 'Suspected TB'],
      required: true,
    },
    notes: { type: String },
    diagnosisDate: {
      type: Date,
      default: Date.now,
    },
    diagnosedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);
export default Diagnosis;
