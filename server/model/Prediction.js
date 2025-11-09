import mongoose from "mongoose";

const PredictionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    measurementId: { type: mongoose.Schema.Types.ObjectId, ref: "Measurement" },
    model: { type: String, default: "heart" },
    prediction: { type: Number, required: true },
    features: { type: [Number], default: [] },
    mlBody: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Prediction = mongoose.model("Prediction", PredictionSchema);

export default Prediction;
