import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import Appointment from "../model/Appointment.js";
import Alert from "../model/Alert.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const verifyTokenFromReq = (req) => {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length < 2) return null;
  try {
    return jwt.verify(parts[1], JWT_SECRET);
  } catch {
    return null;
  }
};

const requireAdmin = async (req, res) => {
  const payload = verifyTokenFromReq(req);
  if (!payload?.id) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }

  const user = await User.findById(payload.id).select("_id role name email");
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return null;
  }
  if (user.role !== "admin") {
    res.status(403).json({ success: false, message: "Admin access required" });
    return null;
  }
  return user;
};

export const getAdminOverview = async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAdmins,
      totalAppointments,
      pendingAppointments,
      totalAlerts,
      unreadAlerts,
      recentUsers,
      recentAppointments,
      recentAlerts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "admin" }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      Alert.countDocuments(),
      Alert.countDocuments({ read: false }),
      User.find({})
        .select("name email role number createdAt")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Appointment.find({})
        .populate("patientId", "name email")
        .populate("doctorId", "name email")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Alert.find({})
        .populate("patientId", "name email")
        .populate("doctorId", "name email")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers,
          totalDoctors,
          totalPatients,
          totalAdmins,
          totalAppointments,
          pendingAppointments,
          totalAlerts,
          unreadAlerts,
        },
        recentUsers,
        recentAppointments,
        recentAlerts,
      },
    });
  } catch (err) {
    console.error("/api/admin/overview error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const role = String(req.query?.role || "").trim();
    const search = String(req.query?.search || "").trim();
    const query = {};

    if (role && ["patient", "doctor", "admin"].includes(role)) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { number: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("name email role number createdAt")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error("/api/admin/users error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};

export const updateUserRoleByAdmin = async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const userId = req.params.userId;
    const role = String(req.body?.role || "").trim();
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId required" });
    }
    if (!["patient", "doctor", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "invalid role" });
    }
    if (String(admin._id) === String(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot change your own role" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true, runValidators: true },
    ).select("name email role number createdAt");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("/api/admin/users/:userId/role error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};

export const getAdminAppointments = async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const status = String(req.query?.status || "").trim();
    const query = {};
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    console.error("/api/admin/appointments error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};

export const getAdminAlerts = async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const riskOnly = String(req.query?.riskOnly || "").toLowerCase();
    const unreadOnly = String(req.query?.unreadOnly || "").toLowerCase();
    const query = {};
    if (riskOnly === "1" || riskOnly === "true") query.prediction = 1;
    if (unreadOnly === "1" || unreadOnly === "true") query.read = false;

    const alerts = await Alert.find(query)
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.status(200).json({ success: true, data: alerts });
  } catch (err) {
    console.error("/api/admin/alerts error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};
