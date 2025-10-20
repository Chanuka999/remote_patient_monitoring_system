import mongoose from "mongoose";
import Hypertension from "../model/hypertention.js";

export const saveHypertension = async (req, res) => {
  try {
    const body = req.body || {};
    if (mongoose.connection.readyState !== 1) {
      return res
        .status(503)
        .json({ success: false, message: "Database not connected" });
    }

    console.log("/api/hypertension body:", body);
    const h = new Hypertension({
      systolic: Number(body.systolic) || 0,
      diastolic: Number(body.diastolic) || 0,
      heartRate: Number(body.heartRate) || 0,
      glucoseLevel: Number(body.glucoseLevel) || 0,
      temperature: Number(body.temperature) || 0,
      oxygenSaturation: Number(body.oxygenSaturation) || 0,
      age: body.age || undefined,
      saltIntake: body.saltIntake || undefined,
      stressScore: body.stressScore || undefined,
      bpHistory: body.bpHistory || undefined,
      sleepDuration: body.sleepDuration || undefined,
      bmi: body.bmi || undefined,
      medication: body.medication || undefined,
      familyHistory: body.familyHistory || undefined,
      exerciseLevel: body.exerciseLevel || undefined,
      smokingStatus: body.smokingStatus || undefined,
      patientId: body.patientId || undefined,
    });
    const saved = await h.save();
    console.log("saved hypertension id:", saved._id?.toString());
    return res.status(201).json({
      success: true,
      data: { id: saved._id, createdAt: saved.createdAt },
    });
  } catch (err) {
    console.error("/api/hypertension error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};
