import express from "express";
import {
  createAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointment,
  getAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

// Create appointment (patient books)
router.post("/create", createAppointment);

// Get appointments for a doctor
router.get("/doctor/:doctorId", getDoctorAppointments);

// Get appointments for a patient
router.get("/patient/:patientId", getPatientAppointments);

// Get single appointment
router.get("/:appointmentId", getAppointment);

// Update appointment status
router.patch("/:appointmentId", updateAppointment);

// Delete appointment
router.delete("/:appointmentId", deleteAppointment);

export default router;
