import React, { useState, useEffect } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Link } from "react-router-dom";
import ioClient from "socket.io-client";
import { useTheme } from "../context/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);
// Mock data for patient details pie chart
const patientPieData = {
  labels: ["Male", "Female", "Other"],
  datasets: [
    {
      label: "Patients",
      data: [60, 35, 5],
      backgroundColor: [
        "rgba(54, 162, 235, 0.7)",
        "rgba(255, 99, 132, 0.7)",
        "rgba(255, 206, 86, 0.7)",
      ],
      borderColor: [
        "rgba(54, 162, 235, 1)",
        "rgba(255, 99, 132, 1)",
        "rgba(255, 206, 86, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

// Mock data for appointments bar chart
const appointmentsBarData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Appointments",
      data: [5, 8, 6, 10, 7, 4, 2],
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
};

// (no defaultChart needed in this view)

const DoctorDashboard = () => {
  const { theme } = useTheme();
  const [doctor, setDoctor] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
        const token = localStorage.getItem("token");

        // Load doctor account details
        try {
          const res = await fetch(`${API_BASE}/me`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.data) setDoctor(data.data);
          }
        } catch {
          // ignore
        }

        // Load alerts for this doctor
        setLoadingAlerts(true);
        try {
          // only fetch risk alerts (prediction === 1)
          const r2 = await fetch(`${API_BASE}/api/alerts?riskOnly=1`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (r2.ok) {
            const json = await r2.json();
            if (json?.data) setAlerts(json.data || []);
          }
        } catch {
          // ignore
        }
      } finally {
        setLoadingAlerts(false);
      }
    };

    load();
  }, []);

  // realtime socket: join doctor's room and receive alerts
  useEffect(() => {
    if (!doctor?.id) return;
    const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
    const socket = ioClient(API_BASE || undefined);
    socket.on("connect", () => {
      try {
        console.log(
          "socket connected (client)",
          socket.id,
          "attempt join",
          doctor.id,
        );
        socket.emit("join", { doctorId: doctor.id });
      } catch (e) {
        console.error("socket join emit error (client)", e);
      }
    });
    socket.on("alert", (a) => {
      console.log("socket alert event (client)", a?._id || a?.id || "(no id)");
      try {
        // attempt to fetch populated alert from API for richer data (measurement)
        (async () => {
          try {
            const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/alerts/${a._id}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.ok) {
              const json = await res.json();
              if (json?.data) {
                setAlerts((prev) => [json.data, ...(prev || [])]);
                return;
              }
            }
          } catch (err) {
            console.error("Failed to fetch populated alert (client)", err);
            // ignore fetch error and fall back to raw event
          }
          setAlerts((prev) => [a, ...(prev || [])]);
        })();
      } catch {
        console.error("socket alert handling error (client)");
      }
    });

    return () => {
      try {
        socket.disconnect();
      } catch {
        // ignore
      }
    };
  }, [doctor]);

  const markAsRead = async (id) => {
    try {
      const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/alerts/${id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("mark read failed");
      const json = await res.json();
      if (json?.success) {
        setAlerts((prev) =>
          prev.map((a) => (a._id === id ? { ...a, read: true } : a)),
        );
      }
    } catch (e) {
      console.error("markAsRead error", e);
    }
  };

  // Get current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Count metrics
  const highRiskAlerts = alerts.filter((a) => a.prediction === 1).length;
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 to-blue-50"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`w-72 p-6 flex flex-col justify-between fixed h-screen shadow-xl transition-colors duration-300 ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900 text-white"
            : "bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 text-white"
        }`}
      >
        <div>
          {/* Logo/Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Doctor Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">Healthcare Management</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link
              to="/doctorDashboard"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition">
                🏠
              </span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>

            <Link
              to="/appointment"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition">
                📅
              </span>
              <span className="text-sm font-medium">Appointments</span>
            </Link>

            <Link
              to="/messages"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition">
                💬
              </span>
              <span className="text-sm font-medium">Messages</span>
            </Link>

            <Link
              to="#staff"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition">
                👥
              </span>
              <span className="text-sm font-medium">Team</span>
            </Link>

            <Link
              to="/settings"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition">
                ⚙️
              </span>
              <span className="text-sm font-medium">Settings</span>
            </Link>

            <div className="pt-4 border-t border-slate-700">
              <Link
                to="/login"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-900 transition duration-200 group text-red-300"
              >
                <span className="text-xl group-hover:scale-110 transition">
                  🚪
                </span>
                <span className="text-sm font-medium">Logout</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 border border-slate-600">
          <img
            src="https://t4.ftcdn.net/jpg/02/60/04/09/360_F_260040900_oO6YW1sHTnKxby4GcjCvtypUCWjnQRg5.jpg"
            alt="doctor"
            className="w-12 h-12 rounded-full mx-auto mb-3 border-2 border-blue-400"
          />
          <h4 className="text-center font-bold text-sm truncate">
            {doctor?.name || "Dr. Nimal Perera"}
          </h4>
          <p className="text-center text-xs text-slate-400 truncate">
            {doctor?.email || "doctor@hospital.com"}
          </p>
          <p className="text-center text-xs text-slate-300 mt-2 font-medium">
            Medical Professional
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72 flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className={`text-3xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Welcome, Dr. {doctor?.name?.split(" ").pop() || "Perera"}
            </h1>
            <p
              className={`mt-1 flex items-center space-x-2 ${
                theme === "dark" ? "text-slate-300" : "text-slate-500"
              }`}
            >
              <span>📅</span>
              <span>
                {dateStr} • {timeStr}
              </span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search patients..."
              className={`px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm ${
                theme === "dark"
                  ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  : "bg-white border-slate-300 text-slate-900"
              }`}
            />
            <div
              className={`flex items-center space-x-3 px-4 py-2 rounded-full shadow-sm border ${
                theme === "dark"
                  ? "bg-slate-700 border-slate-600"
                  : "bg-white border-slate-200"
              }`}
            >
              <img
                src="https://t4.ftcdn.net/jpg/02/60/04/09/360_F_260040900_oO6YW1sHTnKxby4GcjCvtypUCWjnQRg5.jpg"
                alt="Doctor"
                className="w-8 h-8 rounded-full"
              />
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-slate-200" : "text-slate-700"
                }`}
              >
                {doctor?.name || "Dr. Nimal"}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div
            className={`rounded-xl p-6 shadow-md border-l-4 border-blue-500 hover:shadow-lg transition ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Total Alerts
                </p>
                <p
                  className={`text-3xl font-bold mt-2 ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}
                >
                  {alerts.length}
                </p>
              </div>
              <div className="text-4xl text-blue-500">🔔</div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 shadow-md border-l-4 border-red-500 hover:shadow-lg transition ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  High Risk Cases
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {highRiskAlerts}
                </p>
              </div>
              <div className="text-4xl text-red-500">⚠️</div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Unread Alerts
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {unreadAlerts}
                </p>
              </div>
              <div className="text-4xl text-yellow-500">📬</div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 shadow-md border-l-4 border-green-500 hover:shadow-lg transition ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Read Alerts
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {alerts.filter((a) => a.read).length}
                </p>
              </div>
              <div className="text-4xl text-green-500">✅</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div
            className={`rounded-xl p-6 shadow-md hover:shadow-lg transition ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              <span>📊</span>
              <span>Patient Gender Distribution</span>
            </h3>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Pie data={patientPieData} />
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 shadow-md hover:shadow-lg transition ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              <span>📈</span>
              <span>Appointments This Week</span>
            </h3>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Bar data={appointmentsBarData} />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div
          className={`rounded-xl shadow-md overflow-hidden ${
            theme === "dark" ? "bg-slate-800" : "bg-white"
          }`}
        >
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>🚨</span>
              <span>Patient Health Alerts</span>
              {unreadAlerts > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {unreadAlerts} New
                </span>
              )}
            </h3>
          </div>

          <div className="p-6">
            {loadingAlerts && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-4xl mb-3">
                  ⏳
                </div>
                <p
                  className={
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  }
                >
                  Loading alerts...
                </p>
              </div>
            )}

            {!loadingAlerts && alerts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">✨</div>
                <p
                  className={`font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}
                >
                  No alerts at this time
                </p>
                <p
                  className={`text-sm mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
                >
                  All patients are in stable condition
                </p>
              </div>
            )}

            {!loadingAlerts && alerts.length > 0 && (
              <div className="space-y-4">
                {alerts.map((a) => (
                  <div
                    key={a._id}
                    className={`rounded-lg border-2 p-5 transition ${
                      a.read
                        ? theme === "dark"
                          ? "bg-slate-700 border-slate-600"
                          : "bg-slate-50 border-slate-200"
                        : theme === "dark"
                          ? "bg-red-900/30 border-red-700 shadow-md"
                          : "bg-red-50 border-red-300 shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Alert Header */}
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="text-2xl">
                            {a.prediction === 1 ? "🔴" : "🟢"}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`font-bold text-base ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-slate-900"
                              }`}
                            >
                              {a.message}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              {a.prediction === 1 ? (
                                <span className="inline-block px-3 py-1 text-xs font-bold bg-red-600 text-white rounded-full">
                                  ⚠️ HIGH RISK
                                </span>
                              ) : (
                                <span className="inline-block px-3 py-1 text-xs font-bold bg-green-600 text-white rounded-full">
                                  ✓ LOW RISK
                                </span>
                              )}
                              {!a.read && (
                                <span className="inline-block px-3 py-1 text-xs font-bold bg-yellow-500 text-white rounded-full">
                                  🔔 UNREAD
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Patient Info */}
                        <div
                          className={`rounded-lg p-3 mb-3 border ${
                            theme === "dark"
                              ? "bg-blue-900/30 border-blue-700"
                              : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <p
                            className={`text-sm font-semibold mb-1 ${
                              theme === "dark" ? "text-white" : "text-slate-900"
                            }`}
                          >
                            👤 Patient:{" "}
                            {a.patientSnapshot?.name ||
                              a.patientSnapshot?.email ||
                              a.patientSnapshot?.number ||
                              a.patientId?.name ||
                              a.patientId?.email ||
                              "Unknown"}
                          </p>
                          <p
                            className={`text-xs ${
                              theme === "dark"
                                ? "text-slate-300"
                                : "text-slate-600"
                            }`}
                          >
                            📱 {a.patientSnapshot?.number || "N/A"}
                          </p>
                        </div>

                        {/* Symptoms */}
                        {a.symptoms && a.symptoms.length > 0 && (
                          <div className="mb-3">
                            <p
                              className={`text-sm font-semibold mb-2 ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-slate-900"
                              }`}
                            >
                              Symptoms:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {a.symptoms.map((symptom, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                                    theme === "dark"
                                      ? "bg-purple-900/50 text-purple-300"
                                      : "bg-purple-100 text-purple-700"
                                  }`}
                                >
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Measurement Details */}
                        {a.measurementId &&
                          typeof a.measurementId === "object" && (
                            <div
                              className={`rounded-lg p-4 mb-3 border ${
                                theme === "dark"
                                  ? "bg-slate-700 border-slate-600"
                                  : "bg-slate-100 border-slate-300"
                              }`}
                            >
                              <p
                                className={`text-sm font-bold mb-3 ${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-slate-900"
                                }`}
                              >
                                📊 Vital Signs
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div
                                  className={`px-3 py-2 rounded border ${
                                    theme === "dark"
                                      ? "bg-slate-800 border-slate-600"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <p
                                    className={`text-xs font-medium ${
                                      theme === "dark"
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    Systolic BP
                                  </p>
                                  <p
                                    className={`text-lg font-bold ${
                                      theme === "dark"
                                        ? "text-white"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {a.measurementId.systolic ?? "-"}
                                  </p>
                                </div>
                                <div
                                  className={`px-3 py-2 rounded border ${
                                    theme === "dark"
                                      ? "bg-slate-800 border-slate-600"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <p
                                    className={`text-xs font-medium ${
                                      theme === "dark"
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    Diastolic BP
                                  </p>
                                  <p
                                    className={`text-lg font-bold ${
                                      theme === "dark"
                                        ? "text-white"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {a.measurementId.diastolic ?? "-"}
                                  </p>
                                </div>
                                <div
                                  className={`px-3 py-2 rounded border ${
                                    theme === "dark"
                                      ? "bg-slate-800 border-slate-600"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <p
                                    className={`text-xs font-medium ${
                                      theme === "dark"
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    Heart Rate
                                  </p>
                                  <p
                                    className={`text-lg font-bold ${
                                      theme === "dark"
                                        ? "text-white"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {a.measurementId.heartRate ?? "-"}
                                  </p>
                                </div>
                                <div
                                  className={`px-3 py-2 rounded border ${
                                    theme === "dark"
                                      ? "bg-slate-800 border-slate-600"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <p
                                    className={`text-xs font-medium ${
                                      theme === "dark"
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    Glucose
                                  </p>
                                  <p
                                    className={`text-lg font-bold ${
                                      theme === "dark"
                                        ? "text-white"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {a.measurementId.glucoseLevel ?? "-"}
                                  </p>
                                </div>
                                <div
                                  className={`px-3 py-2 rounded border ${
                                    theme === "dark"
                                      ? "bg-slate-800 border-slate-600"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <p
                                    className={`text-xs font-medium ${
                                      theme === "dark"
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    Temperature
                                  </p>
                                  <p
                                    className={`text-lg font-bold ${
                                      theme === "dark"
                                        ? "text-white"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {a.measurementId.temperature ?? "-"}
                                  </p>
                                </div>
                                <div
                                  className={`px-3 py-2 rounded border ${
                                    theme === "dark"
                                      ? "bg-slate-800 border-slate-600"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <p
                                    className={`text-xs font-medium ${
                                      theme === "dark"
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    SpO2
                                  </p>
                                  <p
                                    className={`text-lg font-bold ${
                                      theme === "dark"
                                        ? "text-white"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {a.measurementId.oxygenSaturation ?? "-"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Timestamp */}
                        <p
                          className={`text-xs ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          ⏰ {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="ml-4">
                        {!a.read ? (
                          <button
                            onClick={() => markAsRead(a._id)}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap"
                          >
                            Mark as Read
                          </button>
                        ) : (
                          <span
                            className={`text-sm font-medium px-4 py-2 ${
                              theme === "dark"
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            ✓ Read
                          </span>
                        )}
                      </div>
                    </div>
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

export default DoctorDashboard;
