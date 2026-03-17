import React, { useState, useEffect, useRef } from "react";
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
import ReportManager from "./ReportManager";

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
  const [teamDoctors, setTeamDoctors] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [showTeam, setShowTeam] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [selectedPatientTrends, setSelectedPatientTrends] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState("weekly");
  const [activeModalTab, setActiveModalTab] = useState("trends"); // trends or reports
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const displayName = doctor?.name?.trim() || "Doctor";
  const teamSectionRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
        const token = localStorage.getItem("token");

        // Immediate fallback so UI shows logged user even before API returns
        try {
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          if (storedUser?.name) setDoctor((prev) => prev || storedUser);
        } catch {
          // ignore invalid localStorage JSON
        }

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

        // Load all doctors for Team section
        setLoadingTeam(true);
        try {
          const r3 = await fetch(`${API_BASE}/api/doctors`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (r3.ok) {
            const json = await r3.json();
            if (json?.success && Array.isArray(json.data)) {
              setTeamDoctors(json.data);
              setTeamError("");
            } else {
              setTeamDoctors([]);
              setTeamError("Unable to load team doctors.");
            }
          } else {
            setTeamDoctors([]);
            setTeamError("Unable to load team doctors.");
          }
        } catch {
          setTeamDoctors([]);
          setTeamError("Unable to load team doctors.");
        } finally {
          setLoadingTeam(false);
        }
      } finally {
        setLoadingAlerts(false);
      }
    };

    load();
  }, []);

  // realtime socket: join doctor's room and receive alerts
  useEffect(() => {
    const doctorId = doctor?.id || doctor?._id;
    if (!doctorId) return;
    const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
    const socket = ioClient(API_BASE || undefined);
    socket.on("connect", () => {
      try {
        console.log(
          "socket connected (client)",
          socket.id,
          "attempt join",
          doctorId,
        );
        socket.emit("join", { doctorId });
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

  const fetchPatientTrends = async (patientId, patientName) => {
    setTrendsLoading(true);
    setShowTrendsModal(true);
    setActiveModalTab("trends");
    setSelectedPatientId(patientId);
    try {
      const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/measurements/trends?patientId=${patientId}&period=${trendPeriod}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success) {
          setSelectedPatientTrends({
            ...json.data,
            patientName
          });
        }
      }
    } catch (err) {
      console.error("fetchPatientTrends error", err);
    } finally {
      setTrendsLoading(false);
    }
  };

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
  const doctorId = doctor?.id || doctor?._id;
  const doctorEmail = (doctor?.email || "").toLowerCase();
  const otherDoctors = teamDoctors.filter((d) => {
    const dId = d?.id || d?._id;
    const dEmail = (d?.email || "").toLowerCase();
    if (doctorId && dId && String(dId) === String(doctorId)) return false;
    if (doctorEmail && dEmail && dEmail === doctorEmail) return false;
    return true;
  });

  const handleTeamClick = (e) => {
    e.preventDefault();
    setShowTeam(true);
    setTimeout(() => {
      teamSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

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

            <button
              type="button"
              onClick={handleTeamClick}
              className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition">
                👥
              </span>
              <span className="text-sm font-medium">Team</span>
            </button>

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
              Welcome, {displayName}
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
                {displayName}
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

        {/* Team Section */}
        {showTeam && (
          <div
            id="staff"
            ref={teamSectionRef}
            className={`rounded-xl shadow-md overflow-hidden mb-8 ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            }`}
          >
            <div className="bg-gradient-to-r from-blue-700 to-cyan-700 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>👥</span>
                <span>Team Doctors</span>
              </h3>
            </div>

            <div className="p-6">
              {loadingTeam && (
                <p
                  className={
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  }
                >
                  Loading team doctors...
                </p>
              )}

              {!loadingTeam && teamError && (
                <p className="text-red-500 text-sm">{teamError}</p>
              )}

              {!loadingTeam && !teamError && otherDoctors.length === 0 && (
                <p
                  className={
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  }
                >
                  No other doctors found.
                </p>
              )}

              {!loadingTeam && !teamError && otherDoctors.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherDoctors.map((d) => (
                    <div
                      key={d._id || d.id || d.email}
                      className={`rounded-xl border p-4 shadow-sm ${
                        theme === "dark"
                          ? "bg-slate-700 border-slate-600"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src="https://t4.ftcdn.net/jpg/02/60/04/09/360_F_260040900_oO6YW1sHTnKxby4GcjCvtypUCWjnQRg5.jpg"
                          alt="Doctor"
                          className="w-11 h-11 rounded-full border-2 border-blue-400"
                        />
                        <div>
                          <p
                            className={`font-semibold ${
                              theme === "dark" ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {d.name || "Doctor"}
                          </p>
                          <p
                            className={`text-xs ${
                              theme === "dark"
                                ? "text-slate-300"
                                : "text-slate-500"
                            }`}
                          >
                            {d.role || "doctor"}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-sm truncate ${
                          theme === "dark" ? "text-slate-200" : "text-slate-700"
                        }`}
                        title={d.email || ""}
                      >
                        ✉️ {d.email || "N/A"}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          theme === "dark" ? "text-slate-200" : "text-slate-700"
                        }`}
                      >
                        📞 {d.number || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          onClick={() => fetchPatientTrends(a.patientId?._id || a.patientSnapshot?._id, a.patientSnapshot?.name || "Patient")}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition"
                        >
                          📈 View Trends
                        </button>
                        {!a.read ? (
                          <button
                            onClick={() => markAsRead(a._id)}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap"
                          >
                            Mark as Read
                          </button>
                        ) : (
                          <span
                            className={`text-center text-sm font-medium px-4 py-2 ${
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

      {showTrendsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${
            theme === "dark" ? "bg-slate-900 border border-slate-700" : "bg-white"
          }`}>
            <div className="sticky top-0 z-10 p-6 border-b flex justify-between items-center bg-inherit">
              <div>
                <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  Health Trends: {selectedPatientTrends?.patientName || "Patient"}
                </h2>
                <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  Viewing {trendPeriod} historical data patterns
                </p>
              </div>
              <button 
                onClick={() => setShowTrendsModal(false)}
                className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition`}
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-2 border-b flex gap-4 bg-inherit">
              <button 
                onClick={() => setActiveModalTab("trends")}
                className={`px-4 py-2 text-sm font-bold transition border-b-2 ${activeModalTab === 'trends' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500'}`}
              >
                Health Trends
              </button>
              <button 
                onClick={() => setActiveModalTab("reports")}
                className={`px-4 py-2 text-sm font-bold transition border-b-2 ${activeModalTab === 'reports' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500'}`}
              >
                Lab Reports
              </button>
            </div>

            <div className="p-6">
              {trendsLoading ? (
                <div className="py-20 text-center">
                  <div className="animate-spin text-4xl mb-4">⏳</div>
                  <p>Loading patient trends...</p>
                </div>
              ) : activeModalTab === "reports" ? (
                <ReportManager patientId={selectedPatientId} isDoctor={true} />
              ) : selectedPatientTrends ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Health Score Chart */}
                  <div className={`p-6 rounded-2xl border ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                    <h3 className="font-bold mb-4">Overall Health Score</h3>
                    <div className="h-64">
                      <Line 
                        data={{
                          labels: selectedPatientTrends.healthScoreTrend.map(t => t.label),
                          datasets: [{
                            label: "Health Score",
                            data: selectedPatientTrends.healthScoreTrend.map(t => t.score),
                            borderColor: "#10b981",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            fill: true,
                            tension: 0.4
                          }]
                        }}
                        options={{ responsive: true, maintainAspectRatio: false }}
                      />
                    </div>
                  </div>

                  {/* Individual Metrics */}
                  {Object.entries(selectedPatientTrends.metricTrends || {}).map(([key, trend]) => (
                    <div key={key} className={`p-6 rounded-2xl border ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                      <h3 className="font-bold mb-4 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                      <div className="h-64">
                        <Line 
                          data={{
                            labels: trend.map(t => t.label),
                            datasets: [{
                              label: key,
                              data: trend.map(t => t.value),
                              borderColor: "#3b82f6",
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                              fill: true,
                              tension: 0.4
                            }]
                          }}
                          options={{ responsive: true, maintainAspectRatio: false }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p>No trend data available for this patient.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
