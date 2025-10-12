import mongoose from "mongoose";

const HypertentionSchema = new mongoose.Schema({
  // Vital signs (optional)
  systolic: { type: Number },
  diastolic: { type: Number },
  heartRate: { type: Number },
  glucoseLevel: { type: Number },
  temperature: { type: Number },
  oxygenSaturation: { type: Number },
  // Hypertension-specific fields
  age: { type: Number },
  saltIntake: { type: Number },
  stressScore: { type: Number },
  bpHistory: { type: String },
  sleepDuration: { type: Number },
  bmi: { type: Number },
  medication: { type: String },
  familyHistory: { type: String },
  exerciseLevel: { type: String },
  smokingStatus: { type: String },

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  createdAt: { type: Date, default: () => new Date() },
});

const Hypertention = mongoose.model("Hypertention", HypertentionSchema);

export default Hypertention;
