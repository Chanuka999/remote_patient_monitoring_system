import express from "express";
import {
  getDoctors,
  getPatients,
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// Get all doctors
router.get("/doctors", getDoctors);

// Get all patients
router.get("/patients", getPatients);

// Get conversations for a patient
router.get("/conversations/:patientId", getConversations);

// Get messages between patient and doctor
router.get("/:patientId/:doctorId", getMessages);

// Send a message
router.post("/send", sendMessage);

export default router;
