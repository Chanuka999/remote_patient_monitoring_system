import mongoose from "mongoose";
import { ML_HOST, ML_PORT } from "../lib/utils.js";

export const getHealth = async (req, res) => {
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
};

export const getDbStatus = (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    res.json({ ok: true, state });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
};
