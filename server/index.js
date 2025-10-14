import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import User from "./model/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Use the global fetch available in Node 18+. If you need node-fetch, install it in server/ with `npm install node-fetch`.
import net from "net";
import Measurement from "./model/Measurement.js";
import Hypertention from "./model/hypertention.js";

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();

const PORT = 3000;

// Log whether chat API is configured (do not print keys)
const _chatApiConfigured = Boolean(
  process.env.API_CHAT_URL ||
    process.env.VITE_API_URL ||
    process.env.API_CHAT_KEY ||
    process.env.CHAT_API_KEY
);
console.log(
  "chat API configured on server:",
  _chatApiConfigured
    ? "yes"
    : "no (set API_CHAT_URL or API_CHAT_KEY in server env)"
);

// ML service configuration (env-driven)
const ML_HOST = process.env.ML_HOST || "127.0.0.1";
const ML_PORT = Number(process.env.ML_PORT) || 8000;
// If set to 'false' (string) fallback behavior will be disabled and the proxy will return 502 when ML is unreachable
const ML_ALLOW_FALLBACK = process.env.ML_ALLOW_FALLBACK !== "false";
// Rate-limit ML unreachable warnings to avoid spamming logs (ms)
const ML_WARN_COOLDOWN_MS = Number(process.env.ML_WARN_COOLDOWN_MS) || 60_000;
let _lastMlWarn = 0;
function mlWarn(message) {
  try {
    const now = Date.now();
    if (now - _lastMlWarn > ML_WARN_COOLDOWN_MS) {
      console.warn(message);
      _lastMlWarn = now;
    }
  } catch (e) {
    // best-effort; don't throw from logger
    console.warn(message);
  }
}

const connectDb = async () => {
  try {
    let MONGOURL = process.env.MONGOURL;
    if (!MONGOURL) {
      // attempt a sensible local fallback
      MONGOURL = "mongodb://127.0.0.1:27017/rpms_dev";
      console.log("MONGOURL not set; attempting local fallback:", MONGOURL);
    }
    await mongoose.connect(MONGOURL, { serverSelectionTimeoutMS: 5000 });
    console.log("mongodb connected successfully");
  } catch (error) {
    console.error(
      "mongodb failed to connect",
      error && error.message ? error.message : error
    );
  }
};

// Endpoint to inspect DB connection state (0 = disconnected, 1 = connected)
app.get("/api/dbstatus", (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    res.json({ ok: true, state });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Proxy endpoint to forward ML requests to the Python FastAPI service.
// Improved error handling and logging so client gets helpful diagnostics.
app.post("/api/predict", async (req, res) => {
  try {
    console.log("/api/predict received body:", req.body);

    // Quick port check to avoid calling fetch if ML service is down
    const isPortOpen = (host, port, timeout = 500) => {
      return new Promise((resolve) => {
        const socket = new net.Socket();
        let done = false;
        socket.setTimeout(timeout);
        socket.on("connect", () => {
          done = true;
          socket.destroy();
          resolve(true);
        });
        socket.on("timeout", () => {
          if (!done) {
            done = true;
            socket.destroy();
            resolve(false);
          }
        });
        socket.on("error", () => {
          if (!done) {
            done = true;
            socket.destroy();
            resolve(false);
          }
        });
        socket.connect(port, host);
      });
    };

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
      // Provide fallback immediately (same logic as in catch)
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
    const mlRes = await fetch(`http://${ML_HOST}:${ML_PORT}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

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

    return res.status(200).json({ fromMLStatus: mlRes.status, body: data });
  } catch (error) {
    console.error("ML proxy error:", error);
    // Fallback: try to provide a safe mock prediction so the frontend remains usable.
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

      // simple heuristic fallback for heart prediction
      let prediction = 0;
      if (features && features.length >= 3) {
        const systolic = Number(features[0]) || 0;
        const heartRate = Number(features[2]) || 0;
        const spo2 = Number(features[5]) || 100;
        if (systolic >= 140 || heartRate >= 100 || spo2 < 92) prediction = 1;
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
});

// Proxy for the form-based heart prediction endpoint
app.post("/api/predict/heart_from_form", async (req, res) => {
  try {
    console.log("/api/predict/heart_from_form received body:", req.body);
    // avoid fetch errors if python is down
    const isPortOpen = (host, port, timeout = 500) => {
      return new Promise((resolve) => {
        const socket = new net.Socket();
        let done = false;
        socket.setTimeout(timeout);
        socket.on("connect", () => {
          done = true;
          socket.destroy();
          resolve(true);
        });
        socket.on("timeout", () => {
          if (!done) {
            done = true;
            socket.destroy();
            resolve(false);
          }
        });
        socket.on("error", () => {
          if (!done) {
            done = true;
            socket.destroy();
            resolve(false);
          }
        });
        socket.connect(port, host);
      });
    };

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

    const mlRes = await fetch(
      `http://${ML_HOST}:${ML_PORT}/predict/heart_from_form`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
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

    return res.status(200).json({ fromMLStatus: mlRes.status, body: data });
  } catch (err) {
    console.error("/api/predict/heart_from_form error", err);
    // Fallback similar to above
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
});

// Health endpoint to check Python ML service connectivity
app.get("/api/health", async (req, res) => {
  try {
    const mlRes = await fetch(`http://${ML_HOST}:${ML_PORT}/`);
    const text = await mlRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { raw: text };
    }
    res.status(200).json({ node: "ok", mlStatus: mlRes.status, mlBody: data });
  } catch (err) {
    console.error("/api/health error", err);
    res.status(502).json({ node: "ok", ml: "unreachable", error: String(err) });
  }
});

// Chat proxy to forward chat requests to the configured external API from the server
// This keeps API keys and sensitive endpoints on the server and prevents exposing them to the client.
app.post("/api/chat", async (req, res) => {
  try {
    const CHAT_API = process.env.API_CHAT_URL || process.env.VITE_API_URL;
    if (!CHAT_API)
      return res.status(400).json({
        error:
          "Chat API not configured on server. Set API_CHAT_URL (or VITE_API_URL) and/or API_CHAT_KEY in the server environment. Do not store keys in client/.env.",
      });

    // Forward the body as-is. Server should be responsible for adding any auth headers.
    const headers = { "Content-Type": "application/json" };
    // If an API key is configured as API_CHAT_KEY or CHAT_API_KEY, add it to headers
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
});

// Authentication endpoints (register / login)
// These endpoints will attempt a DB reconnect if the connection isn't ready yet.
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
if (!process.env.JWT_SECRET) {
  console.warn(
    "JWT_SECRET not set; using development fallback secret. Set JWT_SECRET in production."
  );
}

app.post("/register", async (req, res) => {
  try {
    const body = req.body || {};
    console.log("/register body:", body);
    const { name, email, password, role, number } = body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are required",
      });
    }

    // If DB is not connected, try one reconnect attempt to help dev environments
    if (mongoose.connection.readyState !== 1) {
      console.log(
        "DB not connected when registering - attempting to connect..."
      );
      console.log(
        "readyState before connect attempt:",
        mongoose.connection.readyState
      );
      await connectDb();
      console.log(
        "readyState after connect attempt:",
        mongoose.connection.readyState
      );
      if (mongoose.connection.readyState !== 1) {
        return res
          .status(503)
          .json({ success: false, message: "Database not connected" });
      }
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: String(email).toLowerCase(),
      password: hash,
      role: role || "patient",
      number: number || undefined,
    });

    const savedUser = await user.save();
    console.log("saved user id:", savedUser._id?.toString());

    // issue JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("/register error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
});

app.post("/login", async (req, res) => {
  try {
    const body = req.body || {};
    console.log("/login body:", body);
    const { email, password } = body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "email and password are required" });
    }

    if (mongoose.connection.readyState !== 1) {
      console.log(
        "DB not connected when logging in - attempting to connect..."
      );
      console.log(
        "readyState before connect attempt:",
        mongoose.connection.readyState
      );
      await connectDb();
      console.log(
        "readyState after connect attempt:",
        mongoose.connection.readyState
      );
      if (mongoose.connection.readyState !== 1) {
        return res
          .status(503)
          .json({ success: false, message: "Database not connected" });
      }
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res
        .status(401)
        .json({ success: false, message: "invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("/login error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
});

// Save measurement to DB
app.post("/api/measurements", async (req, res) => {
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
});

// Save hypertension-specific measurement
app.post("/api/hypertension", async (req, res) => {
  try {
    const body = req.body || {};
    // Accept payloads that may not include systolic/diastolic/heartRate
    // (clients may omit vitals). We'll coerce missing numeric values to 0.
    if (mongoose.connection.readyState !== 1) {
      return res
        .status(503)
        .json({ success: false, message: "Database not connected" });
    }

    console.log("/api/hypertension body:", body);
    const h = new Hypertention({
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
    console.log("saved hypertention id:", saved._id?.toString());
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
});

// Startup: attempt DB connect first, then start listening
(async () => {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`server is starting on ${PORT}`);
    if (mongoose.connection.readyState !== 1) {
      console.warn(
        "Server started but DB is not connected. Registrations will fail until DB is available."
      );
    }
  });
})();
