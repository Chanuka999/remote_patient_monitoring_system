import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Alert from "../model/Alert.js";
import User from "../model/User.js";
import { getIo } from "../lib/socket.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const verifyTokenFromReq = (req) => {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length < 2) return null;
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
};

const sendSmsViaTwilio = async ({ to, body }) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from || !to) {
    return {
      sent: false,
      reason:
        "Twilio not fully configured (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER)",
    };
  }

  try {
    const params = new URLSearchParams();
    params.set("To", String(to));
    params.set("From", String(from));
    params.set("Body", String(body));

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      },
    );

    const text = await response.text();
    if (!response.ok) {
      return {
        sent: false,
        reason: `Twilio API error (${response.status}): ${text}`,
      };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
};

const sendEmailViaResend = async ({ to, subject, html }) => {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "alerts@healthsync.local";
  if (!resendKey || !to) {
    return {
      sent: false,
      reason: "Email not configured (RESEND_API_KEY/EMAIL_FROM)",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      return {
        sent: false,
        reason: `Email API error (${response.status}): ${text}`,
      };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
};

const toMapsUrl = (lat, lng) => {
  if (lat === undefined || lng === undefined) return "";
  return `https://maps.google.com/?q=${lat},${lng}`;
};

export const getAlertsForDoctor = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload || !payload.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const doctorId = payload.id;
    // allow filtering to risk-only alerts via ?riskOnly=1
    const riskOnly = String(req.query?.riskOnly || "").toLowerCase();
    const query = { doctorId };
    if (riskOnly === "1" || riskOnly === "true") query.prediction = 1;

    // find alerts for this doctor, newest first
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .populate("patientId", "name email")
      .populate("measurementId")
      .lean();

    return res.status(200).json({ success: true, data: alerts });
  } catch (err) {
    console.error("/api/alerts error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};

export const markAlertRead = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload || !payload.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const doctorId = payload.id;
    const alertId = req.params.id;
    if (!alertId)
      return res
        .status(400)
        .json({ success: false, message: "alert id required" });

    const alert = await Alert.findOne({ _id: alertId, doctorId });
    if (!alert)
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });

    alert.read = true;
    await alert.save();

    return res
      .status(200)
      .json({ success: true, data: { id: alert._id, read: alert.read } });
  } catch (err) {
    console.error("/api/alerts/:id/read error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};

export const markAlertUnread = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload || !payload.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const doctorId = payload.id;
    const alertId = req.params.id;
    if (!alertId)
      return res
        .status(400)
        .json({ success: false, message: "alert id required" });

    const alert = await Alert.findOne({ _id: alertId, doctorId });
    if (!alert)
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });

    alert.read = false;
    await alert.save();

    return res
      .status(200)
      .json({ success: true, data: { id: alert._id, read: alert.read } });
  } catch (err) {
    console.error("/api/alerts/:id/unread error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};

export const getAlertById = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload || !payload.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const doctorId = payload.id;
    const alertId = req.params.id;
    if (!alertId)
      return res
        .status(400)
        .json({ success: false, message: "alert id required" });

    const alert = await Alert.findOne({ _id: alertId, doctorId }).populate(
      "patientId",
      "name email",
    );
    if (!alert)
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });

    return res.status(200).json({ success: true, data: alert });
  } catch (err) {
    console.error("/api/alerts/:id error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};

export const createEmergencySOS = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload?.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const patient = await User.findById(payload.id).lean();
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });

    if (patient.role !== "patient") {
      return res
        .status(403)
        .json({ success: false, message: "Only patients can trigger SOS" });
    }

    const body = req.body || {};
    const latitude = body?.location?.latitude;
    const longitude = body?.location?.longitude;
    const address = body?.location?.address || "";
    const note = String(body?.note || "").trim();
    const mapsUrl = toMapsUrl(latitude, longitude);

    // Prefer specialists matching patient symptoms; fallback to all doctors.
    let doctors = [];
    if (Array.isArray(patient.symptoms) && patient.symptoms.length > 0) {
      doctors = await User.find({
        role: "doctor",
        symptoms: { $in: patient.symptoms },
      }).lean();
    }
    if (!doctors.length) {
      doctors = await User.find({ role: "doctor" }).limit(100).lean();
    }

    if (!doctors.length) {
      return res.status(404).json({
        success: false,
        message: "No doctors available to notify",
      });
    }

    const locationText = mapsUrl
      ? `Location: ${mapsUrl}`
      : "Location unavailable";
    const emergencyMessage = `EMERGENCY SOS: Patient ${patient.name || patient.email || patient._id} needs immediate assistance.${note ? ` Note: ${note}` : ""} ${locationText}`;

    const alertsToCreate = doctors.map((doctor) => ({
      patientId: patient._id,
      doctorId: doctor._id,
      prediction: 1,
      type: "emergency_sos",
      emergency: true,
      message: emergencyMessage,
      symptoms: patient.symptoms || [],
      patientSnapshot: {
        name: patient.name,
        email: patient.email,
        number: patient.number,
      },
      location: {
        latitude: latitude !== undefined ? Number(latitude) : undefined,
        longitude: longitude !== undefined ? Number(longitude) : undefined,
        address,
        mapsUrl,
      },
    }));

    const createdAlerts = await Alert.insertMany(alertsToCreate);

    const notificationResults = [];
    for (let i = 0; i < doctors.length; i += 1) {
      const doctor = doctors[i];
      const alert = createdAlerts[i];
      const smsResult = await sendSmsViaTwilio({
        to: doctor.number,
        body: emergencyMessage,
      });
      const emailResult = await sendEmailViaResend({
        to: doctor.email,
        subject: "Emergency SOS Alert - Immediate Attention Required",
        html: `<p><strong>Emergency SOS</strong></p><p>${emergencyMessage}</p><p>Patient: ${patient.name || "Unknown"}</p><p>Contact: ${patient.number || "N/A"}</p>`,
      });

      alert.notificationStatus = {
        smsSent: smsResult.sent,
        emailSent: emailResult.sent,
        smsError: smsResult.sent ? undefined : smsResult.reason,
        emailError: emailResult.sent ? undefined : emailResult.reason,
      };
      await alert.save();

      notificationResults.push({
        doctorId: String(doctor._id),
        smsSent: smsResult.sent,
        emailSent: emailResult.sent,
      });
    }

    // Real-time notify doctors immediately.
    try {
      const io = getIo();
      if (io) {
        createdAlerts.forEach((alert) => {
          io.to(String(alert.doctorId)).emit("alert", alert);
          io.to(String(alert.doctorId)).emit("emergency-sos", {
            type: "emergency_sos",
            alertId: alert._id,
            patientName: patient.name,
            location: alert.location,
            message: alert.message,
          });
        });
      }
    } catch (socketErr) {
      console.error("SOS socket emit error", socketErr);
    }

    return res.status(201).json({
      success: true,
      message: "Emergency SOS triggered. Doctors notified immediately.",
      data: {
        alertsCreated: createdAlerts.length,
        location: { latitude, longitude, address, mapsUrl },
        notifications: notificationResults,
      },
    });
  } catch (err) {
    console.error("/api/alerts/emergency error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};
