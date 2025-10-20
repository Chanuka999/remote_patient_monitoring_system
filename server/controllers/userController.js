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
