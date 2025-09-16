import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    mrn: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      index: true
    },
    firstName: { type: String, required: true, trim: true, index: true },
    lastName: { type: String, required: true, trim: true, index: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number }, 
    contactInfo: {
      phone: { 
        type: String,
        validate: {
          validator: v => /^(\+251|0)\d{9}$/.test(v), 
          message: props => `${props.value} is not a valid phone number!`
        }
      },
      email: {
        type: String,
        lowercase: true,
        validate: {
          validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
          message: props => `${props.value} is not a valid email!`
        }
      }
    },
    address: { type: String },
    archived: { type: Boolean, default: false }, 
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

// Auto-calculate age if not provided
patientSchema.pre('save', function(next) {
  if (this.dateOfBirth) {
    const diff = Date.now() - this.dateOfBirth.getTime();
    this.age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
  next();
});

// Auto-generate MRN if not provided
patientSchema.pre('validate', async function(next) {
  if (!this.mrn) {
    const lastPatient = await mongoose.model('Patient').findOne().sort({ createdAt: -1 });
    let newNumber = 1;

    if (lastPatient && lastPatient.mrn) {
      const lastNum = parseInt(lastPatient.mrn.replace(/\D/g, '')); // strip non-numbers
      if (!isNaN(lastNum)) newNumber = lastNum + 1;
    }

    this.mrn = `PT-${String(newNumber).padStart(5, '0')}`; // e.g., PT-00001
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
