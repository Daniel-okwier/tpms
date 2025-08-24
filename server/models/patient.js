import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    mrn: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number }, 
    contactInfo: {
      phone: { type: String },
      email: { type: String }
    },
    address: { type: String },
    
     archived: { // For soft delete
      type: Boolean,
      default: false
    },
    registrationDate: { type: Date, default: Date.now },
    facilityName: { type: String, required: true },
    initialStatus: {
      type: String,
      enum: ['suspected_tb', 'confirmed_tb'],
      default: 'suspected_tb'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
