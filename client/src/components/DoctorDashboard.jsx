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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
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
        socket.emit("join", { doctorId: doctor.id });
      } catch {
        // ignore
      }
    });
    socket.on("alert", (a) => {
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
          } catch {
            // ignore fetch error and fall back to raw event
          }
          setAlerts((prev) => [a, ...(prev || [])]);
        })();
      } catch {
        // ignore
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
          prev.map((a) => (a._id === id ? { ...a, read: true } : a))
        );
      }
    } catch (e) {
      console.error("markAsRead error", e);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6">Doctor Dashboard</h2>
          <nav className="space-y-4 text-sm">
            <div>
              <Link to="/PatientDashboard">🏠 Dashboard</Link>
            </div>
            <div>
              <Link to="/appointment">👥 appointments</Link>
            </div>
            <div>💬 Messages</div>
            <div>📞 our staff</div>
            <div>⚙️ Settings</div>

            <div>
              <Link to="/login">➡️Logout</Link>
            </div>
          </nav>
        </div>
        <div className="mt-6 text-sm ">
          <img
            src="https://t4.ftcdn.net/jpg/02/60/04/09/360_F_260040900_oO6YW1sHTnKxby4GcjCvtypUCWjnQRg5.jpg"
            alt="doctor"
            className="w-16 h-16 rounded-full mx-auto mb-2"
          />
          <h4 className="text-center font-semibold">
            {doctor?.name || "Dr Nimal perera"}
          </h4>
          <p className="text-center">
            {doctor?.email || "nimalperera23@gmail.com"}
          </p>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Monday, January 28, 2019</h3>
            <p className="text-sm text-gray-500">9:00 AM</p>
          </div>
          <div></div>

          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-1 border rounded-full"
            />
            <img
              src="https://t4.ftcdn.net/jpg/02/60/04/09/360_F_260040900_oO6YW1sHTnKxby4GcjCvtypUCWjnQRg5.jpg"
              alt="Doctor"
              className="w-10 h-10 rounded-full"
            />
            <span>{doctor?.name || "Dr Nimal perera"}</span>
          </div>
        </div>
        {/* Patient Details Pie Chart */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">
              Patient Gender Distribution
            </h4>
            <div className="w-64 h-64">
              <Pie data={patientPieData} />
            </div>
          </div>
          {/* Appointments Bar Chart */}
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            <h4 className="text-md font-semibold mb-2">
              Appointments This Week
            </h4>
            <div className="w-64 h-64">
              <Bar data={appointmentsBarData} />
            </div>
          </div>
        </div>

        {/* Alerts list */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">Patient Alerts</h4>
          <div className="bg-white p-4 rounded-lg shadow">
            {loadingAlerts && (
              <div className="text-sm text-gray-500">Loading alerts...</div>
            )}
            {!loadingAlerts && alerts.length === 0 && (
              <div className="text-sm text-gray-500">No alerts.</div>
            )}
            {!loadingAlerts && alerts.length > 0 && (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div
                    key={a._id}
                    className={`p-3 border rounded ${
                      a.read ? "bg-gray-50" : "bg-red-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{a.message}</div>
                        {/* Risk badge */}
                        <div className="mt-1">
                          {a.prediction === 1 ? (
                            <span className="inline-block px-2 py-0.5 text-xs bg-red-600 text-white rounded">
                              High risk
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 text-xs bg-green-600 text-white rounded">
                              Low risk
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Patient:{" "}
                          {a.patientSnapshot?.name ||
                            a.patientSnapshot?.email ||
                            a.patientSnapshot?.number ||
                            a.patientId?.name ||
                            a.patientId?.email ||
                            "Unknown"}
                        </div>
                        {a.symptoms && a.symptoms.length > 0 && (
                          <div className="text-sm text-gray-700 mt-1">
                            Symptoms: {a.symptoms.join(", ")}
                          </div>
                        )}
                        {/* Measurement details when available */}
                        {a.measurementId &&
                          typeof a.measurementId === "object" && (
                            <div className="text-sm text-gray-800 mt-2 p-2 bg-white border rounded">
                              <div className="font-medium">Measurement</div>
                              <div>
                                Systolic: {a.measurementId.systolic ?? "-"}
                              </div>
                              <div>
                                Diastolic: {a.measurementId.diastolic ?? "-"}
                              </div>
                              <div>
                                Heart Rate: {a.measurementId.heartRate ?? "-"}
                              </div>
                              <div>
                                Glucose: {a.measurementId.glucoseLevel ?? "-"}
                              </div>
                              <div>
                                Temperature:{" "}
                                {a.measurementId.temperature ?? "-"}
                              </div>
                              <div>
                                SPO2: {a.measurementId.oxygenSaturation ?? "-"}
                              </div>
                            </div>
                          )}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(a.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {!a.read ? (
                          <button
                            onClick={() => markAsRead(a._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            Mark read
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">Read</span>
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
