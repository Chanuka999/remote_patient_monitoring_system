import mongoose from "mongoose";
import Measurement from "../model/Measurement.js";

export const saveMeasurement = async (req, res) => {
  try {
    const body = req.body || {};
    const required = [
      "systolic",
      "diastolic",
      "heartRate",
      "glucoseLevel",
      "temperature",
      "oxygenSaturation",
    ];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null) {
        return res
          .status(400)
          .json({ success: false, message: `${k} is required` });
      }
    }
    if (mongoose.connection.readyState !== 1) {
      return res
        .status(503)
        .json({ success: false, message: "Database not connected" });
    }

    const m = new Measurement({
      systolic: Number(body.systolic),
      diastolic: Number(body.diastolic),
      heartRate: Number(body.heartRate),
      glucoseLevel: Number(body.glucoseLevel),
      temperature: Number(body.temperature),
      oxygenSaturation: Number(body.oxygenSaturation),
      patientId: body.patientId || undefined,
    });
    await m.save();
    return res
      .status(201)
      .json({ success: true, data: { id: m._id, createdAt: m.createdAt } });
  } catch (err) {
    console.error("/api/measurements error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};
