import {
  ML_HOST,
  ML_PORT,
  ML_ALLOW_FALLBACK,
  mlWarn,
  isPortOpen,
} from "../lib/utils.js";

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
