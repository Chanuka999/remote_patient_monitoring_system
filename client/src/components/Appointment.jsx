import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Appointment = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [updating, setUpdating] = useState(null);

  const apiBase = import.meta.env.VITE_BACKEND_URL || "";

  // Get current user and load appointments
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);

    if (!user.id && !user._id) {
      navigate("/login");
      return;
    }

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const userId = user.id || user._id;
        const isDoctor = user.role === "doctor";

        const endpoint = isDoctor
          ? `${apiBase}/api/appointments/doctor/${userId}`
          : `${apiBase}/api/appointments/patient/${userId}`;

        const response = await fetch(endpoint);
        const result = await response.json();

        if (result.success) {
          setAppointments(result.data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate, apiBase]);

  // Update appointment status (doctor only)
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setUpdating(appointmentId);

      const response = await fetch(
        `${apiBase}/api/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId ? { ...apt, status: newStatus } : apt,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border border-green-300";
      case "completed":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✅";
      case "completed":
        return "✔️";
      case "cancelled":
        return "❌";
      default:
        return "•";
    }
  };

  const filteredAppointments = appointments.filter(
    (apt) => selectedStatus === "all" || apt.status === selectedStatus,
  );

  const isDoctor = currentUser?.role === "doctor";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-2">
            <span>📅 Appointments</span>
          </h1>
          <p className="text-slate-300">
            {isDoctor
              ? "Manage appointment requests from your patients"
              : "Book and manage your doctor appointments"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          {!isDoctor && (
            <button
              onClick={() => navigate("/book-appointment")}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition flex items-center space-x-2"
            >
              <span>+ 📅 Book New Appointment</span>
            </button>
          )}
          <Link
            to={isDoctor ? "/doctorDashboard" : "/patientDashboard"}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-600 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          {["all", "pending", "approved", "completed", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedStatus === status
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white text-slate-900 hover:bg-slate-100"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== "all" &&
                  ` (${appointments.filter((apt) => apt.status === status).length})`}
              </button>
            ),
          )}
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              {isDoctor ? "📋 Appointment Requests" : "📝 Your Appointments"}
            </h2>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-5xl mb-4">
                  ⏳
                </div>
                <p className="text-slate-600 text-lg">
                  Loading appointments...
                </p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-slate-600 text-lg font-medium">
                  {isDoctor
                    ? "No appointment requests"
                    : "No appointments booked"}
                </p>
                {!isDoctor && (
                  <button
                    onClick={() => navigate("/book-appointment")}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
                  >
                    Book Your First Appointment
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="border-2 border-slate-200 rounded-lg p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">
                            {isDoctor
                              ? `👤 ${appointment.patientSnapshot?.name || "Unknown Patient"}`
                              : `👨‍⚕️ Dr. ${appointment.doctorSnapshot?.name || "Unknown Doctor"}`}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(
                              appointment.status,
                            )}`}
                          >
                            {getStatusIcon(appointment.status)}{" "}
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">
                          📅{" "}
                          {new Date(
                            appointment.appointmentDate,
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-600">
                          ⏰ {appointment.timeSlot}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">
                          {isDoctor ? "Patient Contact" : "Doctor Contact"}
                        </p>
                        <p className="font-semibold text-slate-900">
                          📧{" "}
                          {isDoctor
                            ? appointment.patientSnapshot?.email
                            : appointment.doctorSnapshot?.email}
                        </p>
                        <p className="font-semibold text-slate-900">
                          📱{" "}
                          {isDoctor
                            ? appointment.patientSnapshot?.number
                            : appointment.doctorSnapshot?.number}
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">
                          Reason for Visit
                        </p>
                        <p className="font-semibold text-slate-900">
                          {appointment.reason}
                        </p>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="bg-green-50 p-4 rounded-lg mb-4 border-l-4 border-green-500">
                        <p className="text-sm text-slate-600 mb-1">
                          Doctor's Notes
                        </p>
                        <p className="text-slate-900">{appointment.notes}</p>
                      </div>
                    )}

                    {/* Doctor Actions */}
                    {isDoctor && appointment.status === "pending" && (
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() =>
                            updateAppointmentStatus(appointment._id, "approved")
                          }
                          disabled={updating === appointment._id}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-50"
                        >
                          {updating === appointment._id
                            ? "⏳ Approving..."
                            : "✅ Approve"}
                        </button>
                        <button
                          onClick={() =>
                            updateAppointmentStatus(
                              appointment._id,
                              "cancelled",
                            )
                          }
                          disabled={updating === appointment._id}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50"
                        >
                          {updating === appointment._id
                            ? "⏳ Rejecting..."
                            : "❌ Reject"}
                        </button>
                      </div>
                    )}

                    {/* Mark as completed (Doctor) */}
                    {isDoctor && appointment.status === "approved" && (
                      <button
                        onClick={() =>
                          updateAppointmentStatus(appointment._id, "completed")
                        }
                        disabled={updating === appointment._id}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50 mt-4"
                      >
                        {updating === appointment._id
                          ? "⏳ Marking Complete..."
                          : "✔️ Mark as Completed"}
                      </button>
                    )}

                    {/* Patient Info */}
                    <p className="text-xs text-slate-500 mt-4">
                      📋 Booked on{" "}
                      {new Date(appointment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
