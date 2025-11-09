import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Alert from "../model/Alert.js";
import User from "../model/User.js";

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
      "name email"
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
