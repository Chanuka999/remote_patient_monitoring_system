import {
  ML_HOST,
  ML_PORT,
  ML_ALLOW_FALLBACK,
  mlWarn,
  isPortOpen,
} from "../lib/utils.js";
import User from "../model/User.js";
import Alert from "../model/Alert.js";
import { getIo } from "../lib/socket.js";
import Measurement from "../model/Measurement.js";
import Prediction from "../model/Prediction.js";

// Helper to fetch with retries on 429/503 transient responses
const fetchWithRetry = async (
  url,
  options = {},
  retries = 3,
  backoffMs = 300
) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 || res.status === 503) {
        if (attempt === retries) return res;
        const wait = backoffMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      return res;
    } catch (err) {
      // network error - retry
      if (attempt === retries) throw err;
      const wait = backoffMs * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
};

// Helper: derive simple symptom names from feature values when explicit
// patient symptoms are not provided.
const deriveSymptomsFromFeatures = (features = []) => {
  // features expected: [systolic, diastolic, heartRate, glucoseLevel, temperature, oxygenSaturation]
  const res = [];
  const systolic = Number(features[0]) || 0;
  const glucose = Number(features[3]) || 0;
  const heartRate = Number(features[2]) || 0;
  const spo2 = Number(features[5]) || 100;
  if (systolic >= 140) res.push("Hypertension");
  if (glucose >= 140) res.push("Diabetes");
  if (heartRate >= 100) res.push("Heart Disease");
  if (spo2 < 92) res.push("Asthma");
  return res;
};

// Create alerts for matching doctors when prediction indicates risk
const createAlertsForRisk = async ({
  reqBody = {},
  features = [],
  prediction = 0,
  mlBody = undefined,
  measurementId = undefined,
}) => {
  try {
    if (Number(prediction) !== 1) return;

    const patientId = reqBody.patientId;
    let patient = null;
    if (patientId) {
      try {
        patient = await User.findById(patientId).lean();
      } catch (e) {
        // ignore lookup errors
      }
    }

    // Prefer explicit patient symptoms, fallback to req body, then derive from features
    let patientSymptoms =
      patient && Array.isArray(patient.symptoms) && patient.symptoms.length
        ? patient.symptoms
        : Array.isArray(reqBody.symptoms) && reqBody.symptoms.length
        ? reqBody.symptoms
        : deriveSymptomsFromFeatures(features);

    // If we couldn't derive any explicit symptoms, still notify doctors
    // Find doctors with overlapping symptoms when available, otherwise
    // fallback to notifying all doctors so risk alerts are not dropped.
    let doctors = [];
    if (patientSymptoms && patientSymptoms.length > 0) {
      doctors = await User.find({
        role: "doctor",
        symptoms: { $in: patientSymptoms },
      }).lean();
    }

    // fallback: notify all doctors (limit to a reasonable number)
    if (!doctors || doctors.length === 0) {
      doctors = await User.find({ role: "doctor" }).limit(50).lean();
      if (!doctors || doctors.length === 0) return;
    }

    const messageParts = [];
    if (patient && patient.name) messageParts.push(`Patient ${patient.name}`);
    else if (patientId) messageParts.push(`Patient ${patientId}`);
    messageParts.push("high-risk detected");
    const symptomsText =
      patientSymptoms && patientSymptoms.length > 0
        ? ` — symptoms: ${patientSymptoms.join(", ")}`
        : "";
    const message = `${messageParts.join(" ")}${symptomsText}`;

    // Create an alert document per doctor
    const alerts = doctors.map((d) => ({
      patientId: patient?._id,
      doctorId: d._id,
      measurementId: measurementId || reqBody.measurementId || undefined,
      prediction: Number(prediction) || 0,
      mlBody: mlBody || undefined,
      patientSnapshot: patient
        ? { name: patient.name, email: patient.email, number: patient.number }
        : undefined,
      message,
      symptoms: patientSymptoms,
    }));

    const created = await Alert.insertMany(alerts);
    console.log(
      `Created ${created.length} alert(s) for doctors`,
      doctors.map((d) => d._id)
    );

    // emit socket.io events to each doctor room (doctor id used as room)
    try {
      const io = getIo();
      if (io && created && Array.isArray(created)) {
        created.forEach((al) => {
          try {
            const docRoom = String(al.doctorId);
            console.log(
              "emitting alert to room",
              docRoom,
              "alertId",
              al._id?.toString()
            );
            io.to(docRoom).emit("alert", al);
          } catch (e) {
            console.error("emit alert error", e);
          }
        });
      }
    } catch (e) {
      // ignore socket errors
    }
  } catch (err) {
    console.error("createAlertsForRisk error", err);
  }
};

export const predict = async (req, res) => {
  try {
    console.log("/api/predict received body:", req.body);

    const mlAlive = await isPortOpen(ML_HOST, ML_PORT);
    if (!mlAlive) {
      const baseMsg = `ML service not reachable on ${ML_HOST}:${ML_PORT}`;
      if (ML_ALLOW_FALLBACK) {
        mlWarn(`${baseMsg} — returning fallback`);
      } else {
        mlWarn(`${baseMsg} — fallback disabled`);
        return res.status(502).json({
          error: "ML unreachable",
          mlHost: ML_HOST,
          mlPort: ML_PORT,
        });
      }

      const body = req.body || {};
      let features = null;
      if (Array.isArray(body.input) && body.input.length > 0) {
        features = body.input;
      } else if (body.systolic !== undefined) {
        features = [
          body.systolic,
          body.diastolic,
          body.heartRate,
          body.glucoseLevel,
          body.temperature,
          body.oxygenSaturation,
        ];
      }
      let prediction = 0;
      if (features && features.length >= 3) {
        const systolic = Number(features[0]) || 0;
        const heartRate = Number(features[2]) || 0;
        const spo2 = Number(features[5]) || 100;
        if (systolic >= 140 || heartRate >= 100 || spo2 < 92) prediction = 1;
      }
      // Save measurement to DB so we have a record linked with alert
      try {
        const patientId = req.body?.patientId;
        const m = new Measurement({
          systolic: Number(features?.[0]) || 0,
          diastolic: Number(features?.[1]) || 0,
          heartRate: Number(features?.[2]) || 0,
          glucoseLevel: Number(features?.[3]) || 0,
          temperature: Number(features?.[4]) || 0,
          oxygenSaturation: Number(features?.[5]) || 0,
          patientId: patientId || undefined,
        });
        await m.save();
        // persist prediction record for traceability
        try {
          const p = new Prediction({
            patientId: patientId || undefined,
            measurementId: m._id,
            model: "heart",
            prediction: Number(prediction) || 0,
            features: Array.isArray(features) ? features.map(Number) : [],
            mlBody: { fallback: true },
          });
          await p.save();
        } catch (predErr) {
          console.error("failed to save prediction (fallback)", predErr);
        }

        // create alerts if prediction indicates risk, include measurement id and prediction
        await createAlertsForRisk({
          reqBody: req.body,
          features,
          prediction,
          measurementId: m._id,
        });
      } catch (e) {
        console.error("createAlertsForRisk fallback error", e);
      }

      return res.status(200).json({
        fromMLStatus: "fallback",
        body: {
          model: "heart",
          prediction,
          features,
          note: "fallback prediction - ML unreachable",
        },
      });
    }

    const mlRes = await fetchWithRetry(
      `http://${ML_HOST}:${ML_PORT}/predict`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      },
      3,
      300
    );

    const text = await mlRes.text();
    let data;
    if (!text) {
      data = { message: "no content from ML service" };
    } else {
      try {
        data = JSON.parse(text);
      } catch (err) {
        data = { raw: text };
      }
    }

    if (!mlRes.ok) {
      console.error("ML service returned non-ok status", mlRes.status, data);
      return res.status(502).json({
        error: "ML service error",
        mlStatus: mlRes.status,
        mlBody: data,
      });
    }

    // Try to extract prediction from ML response and create alerts if needed
    let mlPrediction = undefined;
    if (data && typeof data === "object") {
      if (data.prediction !== undefined) mlPrediction = data.prediction;
      else if (data.body && data.body.prediction !== undefined)
        mlPrediction = data.body.prediction;
      else if (data.result && data.result.prediction !== undefined)
        mlPrediction = data.result.prediction;
    }

    try {
      // Attempt to derive features from request for alert derivation if needed
      const body = req.body || {};
      let features = null;
      if (Array.isArray(body.input) && body.input.length > 0) {
        features = body.input;
      } else if (body.systolic !== undefined) {
        features = [
          body.systolic,
          body.diastolic,
          body.heartRate,
          body.glucoseLevel,
          body.temperature,
          body.oxygenSaturation,
        ];
      }

      // Save measurement record for traceability
      try {
        const patientId = body?.patientId;
        const m = new Measurement({
          systolic: Number(features?.[0]) || 0,
          diastolic: Number(features?.[1]) || 0,
          heartRate: Number(features?.[2]) || 0,
          glucoseLevel: Number(features?.[3]) || 0,
          temperature: Number(features?.[4]) || 0,
          oxygenSaturation: Number(features?.[5]) || 0,
          patientId: patientId || undefined,
        });
        await m.save();

        try {
          const p = new Prediction({
            patientId: patientId || undefined,
            measurementId: m._id,
            model: "heart",
            prediction: Number(mlPrediction) || 0,
            features: Array.isArray(features) ? features.map(Number) : [],
            mlBody: data,
          });
          await p.save();
        } catch (predErr) {
          console.error("failed to save prediction (ml)", predErr);
        }

        await createAlertsForRisk({
          reqBody: req.body,
          features,
          prediction: mlPrediction,
          mlBody: data,
          measurementId: m._id,
        });
      } catch (saveErr) {
        console.error(
          "failed to save measurement before creating alerts",
          saveErr
        );
        // still attempt to create alerts without measurement
        await createAlertsForRisk({
          reqBody: req.body,
          features,
          prediction: mlPrediction,
          mlBody: data,
        });
      }
    } catch (e) {
      console.error("alert creation attempt failed", e);
    }

    return res.status(200).json({ fromMLStatus: mlRes.status, body: data });
  } catch (error) {
    console.error("ML proxy error:", error);

    try {
      const body = req.body || {};
      let features = null;
      if (Array.isArray(body.input) && body.input.length > 0) {
        features = body.input;
      } else if (body.systolic !== undefined) {
        features = [
          body.systolic,
          body.diastolic,
          body.heartRate,
          body.glucoseLevel,
          body.temperature,
          body.oxygenSaturation,
        ];
      }

      let prediction = 0;
      if (features && features.length >= 3) {
        const systolic = Number(features[0]) || 0;
        const heartRate = Number(features[2]) || 0;
        const spo2 = Number(features[5]) || 100;
        if (systolic >= 140 || heartRate >= 100 || spo2 < 92) prediction = 1;
      }

      // Attempt to persist measurement and prediction even on proxy error
      try {
        const patientId = body?.patientId;
        const m = new Measurement({
          systolic: Number(features?.[0]) || 0,
          diastolic: Number(features?.[1]) || 0,
          heartRate: Number(features?.[2]) || 0,
          glucoseLevel: Number(features?.[3]) || 0,
          temperature: Number(features?.[4]) || 0,
          oxygenSaturation: Number(features?.[5]) || 0,
          patientId: patientId || undefined,
        });
        await m.save();

        try {
          const p = new Prediction({
            patientId: patientId || undefined,
            measurementId: m._id,
            model: "heart",
            prediction: Number(prediction) || 0,
            features: Array.isArray(features) ? features.map(Number) : [],
            mlBody: { error: String(error) },
          });
          await p.save();
        } catch (predErr) {
          console.error(
            "failed to save prediction in proxy-error fallback",
            predErr
          );
        }
      } catch (persistErr) {
        console.error(
          "failed to persist measurement/prediction in proxy-error fallback",
          persistErr
        );
      }

      return res.status(200).json({
        fromMLStatus: "fallback",
        body: {
          model: "heart",
          prediction,
          features,
          note: "fallback prediction - ML unreachable",
        },
      });
    } catch (fallbackErr) {
      console.error("Fallback prediction failed", fallbackErr);
      return res.status(502).json({
        success: false,
        message: "ML proxy failed",
        error: String(error),
      });
    }
  }
};

export const predictHeartFromForm = async (req, res) => {
  try {
    console.log("/api/predict/heart_from_form received body:", req.body);

    const mlAlive = await isPortOpen(ML_HOST, ML_PORT);
    if (!mlAlive) {
      const baseMsg = `ML service not reachable on ${ML_HOST}:${ML_PORT}`;
      if (ML_ALLOW_FALLBACK) {
        mlWarn(`${baseMsg} — returning fallback`);
      } else {
        mlWarn(`${baseMsg} — fallback disabled`);
        return res.status(502).json({
          error: "ML unreachable",
          mlHost: ML_HOST,
          mlPort: ML_PORT,
        });
      }
      const b = req.body || {};
      const features = [
        Number(b.systolic) || 0,
        Number(b.diastolic) || 0,
        Number(b.heartRate) || 0,
        Number(b.glucoseLevel) || 0,
        Number(b.temperature) || 0,
        Number(b.oxygenSaturation) || 0,
      ];
      let prediction = 0;
      const systolic = features[0];
      const heartRate = features[2];
      const spo2 = features[5];
      if (systolic >= 140 || heartRate >= 100 || spo2 < 92) prediction = 1;

      // Persist measurement + prediction for form endpoint fallback
      try {
        const patientId = b?.patientId;
        const m = new Measurement({
          systolic: Number(features?.[0]) || 0,
          diastolic: Number(features?.[1]) || 0,
          heartRate: Number(features?.[2]) || 0,
          glucoseLevel: Number(features?.[3]) || 0,
          temperature: Number(features?.[4]) || 0,
          oxygenSaturation: Number(features?.[5]) || 0,
          patientId: patientId || undefined,
        });
        await m.save();

        try {
          const p = new Prediction({
            patientId: patientId || undefined,
            measurementId: m._id,
            model: "heart",
            prediction: Number(prediction) || 0,
            features: Array.isArray(features) ? features.map(Number) : [],
            mlBody: { fallback: true },
          });
          await p.save();
        } catch (predErr) {
          console.error(
            "failed to save prediction (heart_from_form fallback)",
            predErr
          );
        }

        // Create alerts for doctors if risk detected
        await createAlertsForRisk({
          reqBody: b,
          features,
          prediction,
          mlBody: { fallback: true },
          measurementId: m._id,
        });
      } catch (persistErr) {
        console.error(
          "failed to save measurement (heart_from_form fallback)",
          persistErr
        );
      }

      return res.status(200).json({
        fromMLStatus: "fallback",
        body: {
          model: "heart",
          prediction,
          features,
          note: "fallback prediction - ML unreachable",
        },
      });
    }

    const mlRes = await fetchWithRetry(
      `http://${ML_HOST}:${ML_PORT}/predict/heart_from_form`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      },
      3,
      300
    );

    const text = await mlRes.text();
    let data;
    if (!text) {
      data = { message: "no content from ML service" };
    } else {
      try {
        data = JSON.parse(text);
      } catch (err) {
        data = { raw: text };
      }
    }

    if (!mlRes.ok) {
      console.error("ML service returned non-ok status", mlRes.status, data);
      return res.status(502).json({
        error: "ML service error",
        mlStatus: mlRes.status,
        mlBody: data,
      });
    }

    // Persist measurement + prediction for heart_from_form ML-success
    try {
      const b = req.body || {};
      const features = [
        Number(b.systolic) || 0,
        Number(b.diastolic) || 0,
        Number(b.heartRate) || 0,
        Number(b.glucoseLevel) || 0,
        Number(b.temperature) || 0,
        Number(b.oxygenSaturation) || 0,
      ];
      const patientId = b?.patientId;
      const m = new Measurement({
        systolic: Number(features?.[0]) || 0,
        diastolic: Number(features?.[1]) || 0,
        heartRate: Number(features?.[2]) || 0,
        glucoseLevel: Number(features?.[3]) || 0,
        temperature: Number(features?.[4]) || 0,
        oxygenSaturation: Number(features?.[5]) || 0,
        patientId: patientId || undefined,
      });
      await m.save();

      // extract prediction if present in data
      let mlPrediction = undefined;
      if (data && typeof data === "object") {
        if (data.prediction !== undefined) mlPrediction = data.prediction;
        else if (data.body && data.body.prediction !== undefined)
          mlPrediction = data.body.prediction;
        else if (data.result && data.result.prediction !== undefined)
          mlPrediction = data.result.prediction;
      }

      try {
        const p = new Prediction({
          patientId: patientId || undefined,
          measurementId: m._id,
          model: "heart",
          prediction: Number(mlPrediction) || 0,
          features: Array.isArray(features) ? features.map(Number) : [],
          mlBody: data,
        });
        await p.save();
      } catch (predErr) {
        console.error(
          "failed to save prediction (heart_from_form ml)",
          predErr
        );
      }
    } catch (persistErr) {
      console.error(
        "failed to persist measurement/prediction (heart_from_form ml)",
        persistErr
      );
    }

    return res.status(200).json({ fromMLStatus: mlRes.status, body: data });
  } catch (err) {
    console.error("/api/predict/heart_from_form error", err);

    try {
      const b = req.body || {};
      const features = [
        Number(b.systolic) || 0,
        Number(b.diastolic) || 0,
        Number(b.heartRate) || 0,
        Number(b.glucoseLevel) || 0,
        Number(b.temperature) || 0,
        Number(b.oxygenSaturation) || 0,
      ];
      let prediction = 0;
      const systolic = features[0];
      const heartRate = features[2];
      const spo2 = features[5];
      if (systolic >= 140 || heartRate >= 100 || spo2 < 92) prediction = 1;

      return res.status(200).json({
        fromMLStatus: "fallback",
        body: {
          model: "heart",
          prediction,
          features,
          note: "fallback prediction - ML unreachable",
        },
      });
    } catch (fallbackErr) {
      console.error(
        "/api/predict/heart_from_form fallback failed",
        fallbackErr
      );
      return res.status(502).json({
        success: false,
        message: "ML proxy failed",
        error: String(err),
      });
    }
  }
};

// New endpoint for symptom-based risk prediction
export const predictFromSymptoms = async (req, res) => {
  try {
    console.log("/api/predict/symptoms received body:", req.body);

    const body = req.body || {};
    const { patientId, symptoms = [] } = body;

    // Extract measurement features
    let features = null;
    if (body.systolic !== undefined) {
      features = [
        body.systolic,
        body.diastolic,
        body.heartRate,
        body.glucoseLevel,
        body.temperature,
        body.oxygenSaturation,
      ];
    }

    // Check ML service availability
    const mlAlive = await isPortOpen(ML_HOST, ML_PORT);
    let prediction = 0;

    if (mlAlive) {
      try {
        const mlRes = await fetchWithRetry(
          `http://${ML_HOST}:${ML_PORT}/predict`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
          3,
          300
        );

        const text = await mlRes.text();
        let mlData;
        if (!text) {
          mlData = { message: "no content from ML service" };
        } else {
          try {
            mlData = JSON.parse(text);
          } catch (err) {
            mlData = { raw: text };
          }
        }

        if (mlRes.ok && mlData.body?.prediction !== undefined) {
          prediction = mlData.body.prediction;
        }
      } catch (mlErr) {
        console.warn("ML service call failed, using fallback", mlErr);
        // Use fallback prediction logic
        if (features && features.length >= 3) {
          const systolic = Number(features[0]) || 0;
          const heartRate = Number(features[2]) || 0;
          const spo2 = Number(features[5]) || 100;
          if (systolic >= 140 || heartRate >= 100 || spo2 < 92) prediction = 1;
        }
      }
    } else {
      // ML not available, use fallback
      if (features && features.length >= 3) {
        const systolic = Number(features[0]) || 0;
        const heartRate = Number(features[2]) || 0;
        const spo2 = Number(features[5]) || 100;
        if (systolic >= 140 || heartRate >= 100 || spo2 < 92) prediction = 1;
      }
    }

    // Save measurement
    try {
      const m = new Measurement({
        systolic: Number(features?.[0]) || 0,
        diastolic: Number(features?.[1]) || 0,
        heartRate: Number(features?.[2]) || 0,
        glucoseLevel: Number(features?.[3]) || 0,
        temperature: Number(features?.[4]) || 0,
        oxygenSaturation: Number(features?.[5]) || 0,
        patientId: patientId || undefined,
      });
      await m.save();

      // Save prediction record
      try {
        const p = new Prediction({
          patientId: patientId || undefined,
          measurementId: m._id,
          model: "symptom_based",
          prediction: Number(prediction) || 0,
          features: Array.isArray(features) ? features.map(Number) : [],
          mlBody: { symptoms, prediction },
        });
        await p.save();
      } catch (predErr) {
        console.error("failed to save prediction", predErr);
      }

      // Create alerts if high risk detected
      if (prediction === 1) {
        await createAlertsForRisk({
          reqBody: { ...body, patientId, symptoms },
          features,
          prediction,
          measurementId: m._id,
        });
      }
    } catch (saveErr) {
      console.error("failed to save measurement", saveErr);
    }

    return res.status(200).json({
      success: true,
      body: {
        model: "symptom_based",
        prediction: Number(prediction),
        features: features || [],
        symptoms: symptoms || [],
      },
    });
  } catch (error) {
    console.error("Symptom prediction error:", error);
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
};

export const chat = async (req, res) => {
  try {
    const CHAT_API = process.env.API_CHAT_URL || process.env.VITE_API_URL;
    if (!CHAT_API)
      return res.status(400).json({
        error:
          "Chat API not configured on server. Set API_CHAT_URL (or VITE_API_URL) and/or API_CHAT_KEY in the server environment. Do not store keys in client/.env.",
      });

    const headers = { "Content-Type": "application/json" };
    const apiKey = process.env.API_CHAT_KEY || process.env.CHAT_API_KEY;
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    const r = await fetch(CHAT_API, {
      method: "POST",
      headers,
      body: JSON.stringify(req.body),
    });
    const text = await r.text();
    try {
      const json = JSON.parse(text);
      return res.status(r.status).json(json);
    } catch (e) {
      return res.status(r.status).send(text);
    }
  } catch (err) {
    console.error("/api/chat error", err);
    return res.status(502).json({ error: String(err) });
  }
};
