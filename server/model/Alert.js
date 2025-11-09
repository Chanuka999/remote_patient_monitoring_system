import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    measurementId: { type: mongoose.Schema.Types.ObjectId, ref: "Measurement" },
    // prediction flag produced by ML or fallback: 1 = high risk, 0 = ok/low
    prediction: { type: Number, required: false },
    // optional ML response body/raw data for debugging or display
    mlBody: { type: mongoose.Schema.Types.Mixed, required: false },
    // snapshot of patient data at time of alert (copies fields to avoid extra lookups)
    patientSnapshot: {
      name: { type: String, required: false },
      email: { type: String, required: false },
      number: { type: String, required: false },
    },
    message: { type: String, required: true },
    symptoms: { type: [String], default: [] },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Alert = mongoose.model("Alert", AlertSchema);

export default Alert;
