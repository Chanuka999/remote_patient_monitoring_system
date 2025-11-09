import { connectDb } from "../lib/db.js";
import Prediction from "../model/Prediction.js";
import Alert from "../model/Alert.js";
import Measurement from "../model/Measurement.js";
import User from "../model/User.js";

// Simple script to inspect recent high-risk predictions and related alerts
const run = async () => {
  await connectDb();

  try {
    const preds = await Prediction.find({ prediction: 1 })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (!preds || preds.length === 0) {
      console.log("No recent high-risk predictions found.");
      process.exit(0);
    }

    for (const p of preds) {
      console.log("------------------------------");
      console.log("Prediction:", p._id.toString());
      console.log("  patientId:", p.patientId);
      console.log("  measurementId:", p.measurementId);
      console.log("  model:", p.model);
      console.log("  prediction:", p.prediction);
      console.log("  createdAt:", p.createdAt);
      console.log("  features:", p.features);

      // find any corresponding alerts linked to this measurement
      const alerts = await Alert.find({
        measurementId: p.measurementId,
      }).lean();
      console.log(`  alerts found: ${alerts.length}`);
      for (const a of alerts) {
        console.log("    alertId:", a._id.toString());
        console.log("      doctorId:", a.doctorId?.toString());
        console.log("      message:", a.message);
        console.log("      symptoms:", a.symptoms);
        console.log("      read:", a.read);
      }

      // optionally show measurement values
      if (p.measurementId) {
        const m = await Measurement.findById(p.measurementId).lean();
        if (m) {
          console.log("  measurement:");
          console.log("    systolic:", m.systolic);
          console.log("    diastolic:", m.diastolic);
          console.log("    heartRate:", m.heartRate);
          console.log("    glucoseLevel:", m.glucoseLevel);
        }
      }
    }
  } catch (err) {
    console.error("check script error", err);
  } finally {
    process.exit(0);
  }
};

run();
