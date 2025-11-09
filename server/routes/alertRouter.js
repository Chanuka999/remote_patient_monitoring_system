import express from "express";
import {
  getAlertsForDoctor,
  markAlertRead,
  markAlertUnread,
  getAlertById,
} from "../controllers/alertController.js";

const router = express.Router();

// GET /api/alerts - list alerts for authenticated doctor
router.get("/alerts", getAlertsForDoctor);

// GET /api/alerts/:id - get a single alert (doctor only)
router.get("/alerts/:id", getAlertById);

// PATCH /api/alerts/:id/read - mark read
router.patch("/alerts/:id/read", markAlertRead);

// PATCH /api/alerts/:id/unread - mark unread
router.patch("/alerts/:id/unread", markAlertUnread);

export default router;
