import mongoose from "mongoose";
import Measurement from "../model/Measurement.js";
import Prediction from "../model/Prediction.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const verifyTokenFromReq = (req) => {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth) return null;
  const token = auth.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const distanceToRange = (value, min, max) => {
  if (value < min) return min - value;
  if (value > max) return value - max;
  return 0;
};

const calculateHealthScore = (m) => {
  if (!m) return 0;
  
  // Blood Pressure Penalties (Clinical threshold: 120/80)
  const systolicPenalty = distanceToRange(Number(m.systolic) || 0, 90, 120) * 0.8;
  const diastolicPenalty = distanceToRange(Number(m.diastolic) || 0, 60, 80) * 0.8;
  
  // Heart Rate Penalty (Normal: 60-100)
  const heartPenalty = distanceToRange(Number(m.heartRate) || 0, 60, 100) * 0.5;
  
  // Glucose Penalty (Normal Fasting: 70-100)
  const glucosePenalty = distanceToRange(Number(m.glucoseLevel) || 0, 70, 100) * 0.4;
  
  // Temperature Penalty (Normal: 36.1-37.2)
  const tempPenalty = distanceToRange(Number(m.temperature) || 0, 36.1, 37.2) * 10;
  
  // SpO2 Penalty (Normal: 95-100)
  const spo2Penalty = distanceToRange(Number(m.oxygenSaturation) || 0, 95, 100) * 6;

  const totalPenalty = systolicPenalty + diastolicPenalty + heartPenalty + glucosePenalty + tempPenalty + spo2Penalty;
  const score = 100 - totalPenalty;

  return Math.round(clamp(score, 0, 100));
};

const toPeriodKey = (date, period) => {
  const d = new Date(date);
  if (period === "monthly") {
    // group monthly report by week bucket
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const diffDays = Math.floor((d - start) / (1000 * 60 * 60 * 24));
    const week = Math.floor(diffDays / 7) + 1;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-W${week}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatLastSeen = (date) => {
  if (!date) return "No data";
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const buildIndicators = (measurements = []) => {
  if (measurements.length < 4) return [];

  const mid = Math.floor(measurements.length / 2);
  const previous = measurements.slice(0, mid);
  const recent = measurements.slice(mid);
  if (!previous.length || !recent.length) return [];

  const avg = (arr, field) =>
    arr.reduce((sum, item) => sum + (Number(item[field]) || 0), 0) / arr.length;

  const indicators = [
    {
      key: "systolic",
      label: "Blood Pressure Trend",
      prevDistance: distanceToRange(avg(previous, "systolic"), 90, 120),
      recentDistance: distanceToRange(avg(recent, "systolic"), 90, 120),
      unit: "mmHg",
    },
    {
      key: "heartRate",
      label: "Heart Rate Stability",
      prevDistance: distanceToRange(avg(previous, "heartRate"), 60, 100),
      recentDistance: distanceToRange(avg(recent, "heartRate"), 60, 100),
      unit: "bpm",
    },
    {
      key: "glucoseLevel",
      label: "Glucose Balance",
      prevDistance: distanceToRange(avg(previous, "glucoseLevel"), 70, 140),
      recentDistance: distanceToRange(avg(recent, "glucoseLevel"), 70, 140),
      unit: "mg/dL",
    },
    {
      key: "oxygenSaturation",
      label: "Oxygen Saturation",
      prevDistance: distanceToRange(
        100 - avg(previous, "oxygenSaturation"),
        0,
        5,
      ),
      recentDistance: distanceToRange(
        100 - avg(recent, "oxygenSaturation"),
        0,
        5,
      ),
      unit: "%",
    },
  ];

  return indicators.map((item) => {
    const delta = item.prevDistance - item.recentDistance;
    const improved = delta > 0.2;
    const worsened = delta < -0.2;
    return {
      metric: item.key,
      label: item.label,
      direction: improved ? "up" : worsened ? "down" : "stable",
      improved,
      delta: Number(delta.toFixed(2)),
      unit: item.unit,
    };
  });
};

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

export const getHealthTrends = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Allow doctors/admins to view other patients, 
    // but patients can only view their own data.
    let targetPatientId = payload.id;
    if ((payload.role === "doctor" || payload.role === "admin") && req.query.patientId) {
      targetPatientId = req.query.patientId;
    }

    const period = req.query.period === "monthly" ? "monthly" : "weekly";
    const days = period === "monthly" ? 30 : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [measurements, predictions] = await Promise.all([
      Measurement.find({ patientId: targetPatientId, createdAt: { $gte: since } })
        .sort({ createdAt: 1 })
        .lean(),
      Prediction.find({ patientId: targetPatientId, createdAt: { $gte: since } })
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    const scorePoints = measurements.map((m) => ({
      label: toPeriodKey(m.createdAt, period),
      date: m.createdAt,
      score: calculateHealthScore(m),
    }));

    const groupedScore = scorePoints.reduce((acc, item) => {
      if (!acc[item.label])
        acc[item.label] = { total: 0, count: 0, date: item.date };
      acc[item.label].total += item.score;
      acc[item.label].count += 1;
      acc[item.label].date = item.date;
      return acc;
    }, {});

    const healthScoreTrend = Object.entries(groupedScore)
      .map(([label, val]) => ({
        label,
        date: val.date,
        score: Math.round(val.total / Math.max(val.count, 1)),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const riskPoints = predictions.map((p) => ({
      label: toPeriodKey(p.createdAt, period),
      date: p.createdAt,
      prediction: Number(p.prediction) || 0,
    }));

    const groupedRisk = riskPoints.reduce((acc, item) => {
      if (!acc[item.label]) {
        acc[item.label] = {
          totalRisk: 0,
          total: 0,
          highRiskCount: 0,
          date: item.date,
        };
      }
      acc[item.label].totalRisk += item.prediction;
      acc[item.label].total += 1;
      if (item.prediction === 1) acc[item.label].highRiskCount += 1;
      acc[item.label].date = item.date;
      return acc;
    }, {});

    const riskTrend = Object.entries(groupedRisk)
      .map(([label, val]) => ({
        label,
        date: val.date,
        avgRisk: Number((val.totalRisk / Math.max(val.total, 1)).toFixed(2)),
        highRiskCount: val.highRiskCount,
        totalPredictions: val.total,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const currentHealthScore = measurements.length
      ? calculateHealthScore(measurements[measurements.length - 1])
      : 0;

    const avgHealthScore = healthScoreTrend.length
      ? Math.round(
          healthScoreTrend.reduce((sum, p) => sum + p.score, 0) /
            healthScoreTrend.length,
        )
      : 0;

    const highRiskCount = predictions.filter(
      (p) => Number(p.prediction) === 1,
    ).length;
    const highRiskRate = predictions.length
      ? Number(((highRiskCount / predictions.length) * 100).toFixed(1))
      : 0;

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const measurementsToday = measurements.filter(
      (m) => new Date(m.createdAt) >= startOfDay,
    ).length;

    const summary = {
      measurementsCount: measurements.length,
      predictionsCount: predictions.length,
      avgHealthScore,
      currentHealthScore,
      highRiskRate,
      highRiskCount,
      lastMeasurementAt: measurements.length
        ? measurements[measurements.length - 1].createdAt
        : null,
      lastMeasurementText: measurements.length
        ? formatLastSeen(measurements[measurements.length - 1].createdAt)
        : "No measurements",
      measurementsToday,
    };

    const improvementIndicators = buildIndicators(measurements);

    // Generate trend data for each metric
    const metrics = [
      "systolic",
      "diastolic",
      "heartRate",
      "glucoseLevel",
      "temperature",
      "oxygenSaturation",
    ];

    const metricTrends = {};
    metrics.forEach((metric) => {
      const points = measurements.map((m) => ({
        label: toPeriodKey(m.createdAt, period),
        date: m.createdAt,
        value: Number(m[metric]) || 0,
      }));

      const grouped = points.reduce((acc, item) => {
        if (!acc[item.label])
          acc[item.label] = { total: 0, count: 0, date: item.date };
        acc[item.label].total += item.value;
        acc[item.label].count += 1;
        return acc;
      }, {});

      metricTrends[metric] = Object.entries(grouped)
        .map(([label, val]) => ({
          label,
          date: val.date,
          value: Number((val.total / Math.max(val.count, 1)).toFixed(1)),
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    const lastMeasurement = measurements.length
      ? measurements[measurements.length - 1]
      : null;

    return res.status(200).json({
      success: true,
      data: {
        period,
        summary,
        riskTrend,
        healthScoreTrend,
        improvementIndicators,
        metricTrends,
        lastMeasurement,
      },
    });
  } catch (err) {
    console.error("/api/measurements/trends error", err);
    return res.status(500).json({
      success: false,
      message: "server error",
      error: String(err),
    });
  }
};
