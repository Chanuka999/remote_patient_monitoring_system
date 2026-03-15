import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");

  const apiBase = import.meta.env.VITE_BACKEND_URL || "";

  // Available time slots
  const timeSlots = [
    "09:00 - 09:30",
    "09:30 - 10:00",
    "10:00 - 10:30",
    "10:30 - 11:00",
    "11:00 - 11:30",
    "11:30 - 12:00",
    "14:00 - 14:30",
    "14:30 - 15:00",
    "15:00 - 15:30",
    "15:30 - 16:00",
    "16:00 - 16:30",
    "16:30 - 17:00",
  ];

  // Get current user and fetch doctors
  useEffect(() => {
    const preselectedDoctorId = searchParams.get("doctorId");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);

    if (!user.id && !user._id) {
      navigate("/login");
      return;
    }

    if (user.role !== "patient") {
      navigate("/appointment");
      return;
    }

    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${apiBase}/api/doctors`);
        const result = await response.json();
        if (result.success) {
          const doctorList = result.data || [];
          setDoctors(doctorList);

          if (preselectedDoctorId) {
            const found = doctorList.find(
              (d) => String(d._id) === String(preselectedDoctorId),
            );
            if (found) setSelectedDoctor(found);
          }
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };

    fetchDoctors();
  }, [navigate, apiBase, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedDoctor || !appointmentDate || !timeSlot || !reason.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const patientId = currentUser?.id || currentUser?._id;
      const response = await fetch(`${apiBase}/api/appointments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          doctorId: selectedDoctor._id,
          appointmentDate,
          timeSlot,
          reason,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          navigate("/appointment");
        }, 2000);
      } else {
        setError(result.message || "Failed to book appointment");
      }
    } catch (err) {
      setError("Error booking appointment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen py-8 px-4 transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
          : "bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {submitted ? (
          <div
            className={`rounded-xl shadow-2xl p-8 text-center ${
              isDark ? "bg-slate-800" : "bg-white"
            }`}
          >
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              Appointment Request Submitted!
            </h2>
            <p
              className={`mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}
            >
              Your appointment request has been sent to the doctor. They will
              review it shortly.
            </p>
            <p
              className={`text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Redirecting to appointments page...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1
                className={`text-4xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                📅 Book an Appointment
              </h1>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                Request an appointment with a doctor
              </p>
            </div>

            <div
              className={`rounded-xl shadow-2xl overflow-hidden ${
                isDark ? "bg-slate-800" : "bg-white"
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <span>👨‍⚕️</span>
                  <span>Select Doctor & Book Time</span>
                </h2>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700 font-semibold">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Doctor Selection */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-3 ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    Select a Doctor *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((doctor) => (
                      <button
                        key={doctor._id}
                        type="button"
                        onClick={() => setSelectedDoctor(doctor)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition text-left shadow ${
                          selectedDoctor?._id === doctor._id
                            ? isDark
                              ? "border-blue-500 bg-blue-950/40"
                              : "border-blue-500 bg-blue-50"
                            : isDark
                              ? "border-slate-700 bg-slate-900 hover:border-slate-500"
                              : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={
                            doctor.imageUrl ||
                            "https://ui-avatars.com/api/?name=" +
                              encodeURIComponent(doctor.name)
                          }
                          alt={doctor.name}
                          className="w-14 h-14 rounded-full object-cover border border-slate-300"
                        />
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
                          >
                            👨‍⚕️ Dr. {doctor.name}
                          </p>
                          <p
                            className={`text-xs mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}
                          >
                            📧 {doctor.email}
                          </p>
                          <p
                            className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}
                          >
                            📱 {doctor.number}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Appointment Date */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-3 ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "border-slate-600 bg-slate-900 text-white [color-scheme:dark]"
                        : "border-slate-300 bg-white text-slate-900 [color-scheme:light]"
                    }`}
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-3 ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    Preferred Time Slot *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`py-2 px-3 rounded-lg border-2 transition text-sm font-medium ${
                          timeSlot === slot
                            ? "border-blue-500 bg-blue-100 text-blue-900"
                            : isDark
                              ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500"
                              : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                        }`}
                      >
                        🕐 {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason for Appointment */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-3 ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    Reason for Appointment *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the reason for your appointment..."
                    rows="4"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "border-slate-600 bg-slate-900 text-white placeholder:text-slate-400"
                        : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>

                {/* Summary */}
                {selectedDoctor && appointmentDate && timeSlot && (
                  <div
                    className={`border-l-4 border-blue-500 p-4 rounded ${
                      isDark ? "bg-blue-950/30" : "bg-blue-50"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold mb-2 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      📋 Appointment Summary:
                    </p>
                    <ul
                      className={`text-sm space-y-1 ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                    >
                      <li>
                        👨‍⚕️ Doctor:{" "}
                        <span className="font-semibold">
                          Dr. {selectedDoctor.name}
                        </span>
                      </li>
                      <li>
                        📅 Date:{" "}
                        <span className="font-semibold">
                          {new Date(appointmentDate).toLocaleDateString()}
                        </span>
                      </li>
                      <li>
                        ⏰ Time:{" "}
                        <span className="font-semibold">{timeSlot}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold text-white transition ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg"
                    }`}
                  >
                    {loading ? "⏳ Booking..." : "✅ Request Appointment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/appointment")}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold transition ${
                      isDark
                        ? "text-slate-100 bg-slate-700 hover:bg-slate-600"
                        : "text-slate-900 bg-slate-200 hover:bg-slate-300"
                    }`}
                  >
                    ← Back to Appointments
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
