import mongoose from "mongoose";

const MeasurementSchema = new mongoose.Schema({
  systolic: { type: Number, required: true },
  diastolic: { type: Number, required: true },
  heartRate: { type: Number, required: true },
  glucoseLevel: { type: Number, required: true },
  temperature: { type: Number, required: true },
  oxygenSaturation: { type: Number, required: true },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  createdAt: { type: Date, default: () => new Date() },
});

const Measurement = mongoose.model("Measurement", MeasurementSchema);

export default Measurement;
