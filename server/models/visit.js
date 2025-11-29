
import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    treatment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Treatment",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    visitDate: {
      type: Date,
      required: true,
    },
    visitType: {
      type: String,
      enum: ["Routine", "Sputum", "WeightCheck", "DrugPickup", "Other"],
      default: "Routine",
    },
    doseNumber: {
      type: Number,
    },
    phase: {
      type: String,
      enum: ["intensive", "continuation", "other"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "missed", "cancelled"],
      default: "pending",
    },
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
   
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

visitSchema.index({ patient: 1, treatment: 1, visitDate: 1 });

const Visit = mongoose.model("Visit", visitSchema);
export default Visit;
