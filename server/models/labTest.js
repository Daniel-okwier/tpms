import mongoose from "mongoose";

const resultCommonSchema = new mongoose.Schema(
{
resultText: { type: String },
notes: { type: String },
},
{ _id: false }
);

const geneXpertSchema = new mongoose.Schema(
{
mtbDetected: {
type: String,
enum: ["detected", "not_detected", "indeterminate"],
default: "indeterminate",
},
rifResistance: {
type: String,
enum: ["detected", "not_detected", "indeterminate"],
default: "indeterminate",
},
ctValue: { type: Number },
},
{ _id: false }
);

const smearSchema = new mongoose.Schema(
{
result: {
type: String,
enum: ["positive", "negative", "scanty"],
default: "negative",
},
grading: {
type: String,
enum: ["1+", "2+", "3+", "scanty", "none"],
default: "none",
},
},
{ _id: false }
);

const cultureSchema = new mongoose.Schema(
{
growth: {
type: String,
enum: ["positive", "negative", "contaminated", "pending"],
default: "pending",
},
organism: { type: String },
ttdDays: { type: Number },
},
{ _id: false }
);

const xraySchema = new mongoose.Schema(
{
impression: { type: String },
cavitation: { type: Boolean, default: false },
infiltrates: { type: Boolean, default: false },
laterality: {
type: String,
enum: ["left", "right", "bilateral", "unknown"],
default: "unknown",
},
},
{ _id: false }
);

const labTestSchema = new mongoose.Schema(
{
patient: {
type: mongoose.Schema.Types.ObjectId,
ref: "Patient",
required: true,
},
screening: {
type: mongoose.Schema.Types.ObjectId,
ref: "Screening",
required: false, 
},


testType: {
  type: String,
  enum: ["GeneXpert", "Smear Microscopy", "Culture", "Chest X-ray", "Other"],
  required: true,
},
priority: {
  type: String,
  enum: ["routine", "priority"],
  default: "routine",
},
clinicalNotes: { type: String },

// Order metadata
orderDate: { type: Date, default: Date.now },
orderedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},

specimenType: {
  type: String,
  enum: [
    "sputum",
    "blood",
    "tissue",
    "gastric_aspirate",
    "other",
    "not_applicable",
  ],
  default: "sputum",
},
specimenCollectedAt: { type: Date },
specimenCollector: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

status: {
  type: String,
  enum: [
    "ordered",
    "specimen_collected",
    "in_progress",
    "completed",
    "verified",
    "cancelled",
  ],
  default: "ordered",
},

// Result fields
result: { type: String }, // summary result, human-readable (e.g. "Positive", "Negative", "Pending")
resultCommon: resultCommonSchema,
geneXpert: geneXpertSchema,
smear: smearSchema,
culture: cultureSchema,
xray: xraySchema,

attachments: [{ type: String }],

verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
verifiedAt: { type: Date },

voided: { type: Boolean, default: false },
voidReason: { type: String },
voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
voidedAt: { type: Date },


},
{ timestamps: true }
);

labTestSchema.index({ patient: 1, orderDate: -1 });
labTestSchema.index({ status: 1, testType: 1 });
labTestSchema.index({ screening: 1 });
labTestSchema.index({ voided: 1 });

const LabTest = mongoose.model("LabTest", labTestSchema);
export default LabTest;
