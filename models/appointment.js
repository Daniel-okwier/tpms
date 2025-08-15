import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Patient', 
      required: true 
    },
    doctor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    nurse: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    appointmentDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'], 
      default: 'scheduled' 
    },
    notes: { type: String }
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
