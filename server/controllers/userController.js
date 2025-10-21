import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import { connectDb } from "../lib/db.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const registerUser = async (req, res) => {
  try {
    const body = req.body || {};
    console.log("/register body:", body);
    const { name, email, password, role, number, symptoms } = body;
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

    // Normalize symptoms to an array of strings if provided
    let normalizedSymptoms = [];
    if (Array.isArray(symptoms)) {
      normalizedSymptoms = symptoms.map((s) => String(s));
    } else if (typeof symptoms === "string" && symptoms.length > 0) {
      // allow comma-separated string from some clients
      normalizedSymptoms = symptoms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const user = new User({
      name,
      email: String(email).toLowerCase(),
      password: hash,
      role: role || "patient",
      number: number || undefined,
      symptoms: normalizedSymptoms,
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
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        symptoms: savedUser.symptoms || [],
      },
      token,
    });
  } catch (err) {
    console.error("/register error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};

export const Loginuser = async (req, res) => {
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
        symptoms: user.symptoms || [],
      },
      token,
    });
  } catch (err) {
    console.error("/login error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};

// Helper to extract token and verify
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

export const getMe = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload || !payload.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(payload.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        number: user.number,
        symptoms: user.symptoms || [],
      },
    });
  } catch (err) {
    console.error("/me error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};

export const updateSymptoms = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload || !payload.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const body = req.body || {};
    let { symptoms } = body;

    // Normalize to array of strings
    let normalized = [];
    if (Array.isArray(symptoms)) normalized = symptoms.map((s) => String(s));
    else if (typeof symptoms === "string" && symptoms.length > 0)
      normalized = symptoms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const user = await User.findById(payload.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.symptoms = normalized;
    await user.save();

    return res
      .status(200)
      .json({ success: true, data: { symptoms: user.symptoms || [] } });
  } catch (err) {
    console.error("/me/symptoms error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
};
