import Appointment from "../model/Appointment.js";
import User from "../model/User.js";
import mongoose from "mongoose";

// Create appointment request (patient books)
export const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, timeSlot, reason } = req.body;

    if (!patientId || !doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Get patient and doctor details for snapshot
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({
        success: false,
        message: "Patient or doctor not found",
      });
    }

    const appointment = new Appointment({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      reason,
      patientSnapshot: {
        name: patient.name,
        email: patient.email,
        number: patient.number,
      },
      doctorSnapshot: {
        name: doctor.name,
        email: doctor.email,
        number: doctor.number,
      },
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment request created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get appointments for a doctor (doctor requests)
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;

    let query = { doctorId: new mongoose.Types.ObjectId(doctorId) };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate("patientId", "name email number")
      .populate("doctorId", "name email number")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get appointments for a patient
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;

    let query = { patientId: new mongoose.Types.ObjectId(patientId) };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate("patientId", "name email number")
      .populate("doctorId", "name email number")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update appointment status (doctor approves/rejects/cancels)
export const updateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["pending", "approved", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status, notes: notes || "" },
      { new: true },
    )
      .populate("patientId", "name email number")
      .populate("doctorId", "name email number");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: "Appointment updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single appointment
export const getAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId", "name email number")
      .populate("doctorId", "name email number");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
