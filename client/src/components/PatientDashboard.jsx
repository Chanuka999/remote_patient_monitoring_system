import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Link } from "react-router-dom";
import PatientDashboardForm from "./PatientDashboardForm";
import { useEffect } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const defaultChart = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Metric",
      data: [70, 75, 72, 78, 76, 80, 77],
      borderColor: "rgb(54, 162, 235)",
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const HealthDashboard = () => {
  const [chartData, _setChartData] = useState([
    defaultChart,
    defaultChart,
    defaultChart,
    defaultChart,
    defaultChart,
  ]);

  // Read logged-in user from localStorage (set by Login.jsx)
  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    storedUser = raw ? JSON.parse(raw) : null;
  } catch {
    storedUser = null;
  }

  const userName = storedUser?.name || storedUser?.email || "Guest";
  // email not currently used here but available on storedUser when needed
  // const userEmail = storedUser?.email || "";

  const metrics = [
    { title: "Blood Pressure", value: "120/80 mmHg" },
    { title: "Heart Rate", value: "80 bpm" },
    { title: "SPO2", value: "98%" },
    { title: "RPM Device Usage", value: "40 min" },
    { title: "Respiration Rate", value: "18 bpm" },
  ];

  // Patient symptoms state
  const [symptoms, setSymptoms] = React.useState([]);
  const [newSymptom, setNewSymptom] = React.useState("");
  const [savingSymptoms, setSavingSymptoms] = React.useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return; // ignore
        const data = await res.json();
        if (data?.data?.symptoms) setSymptoms(data.data.symptoms || []);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  const addSymptom = () => {
    const s = String(newSymptom || "").trim();
    if (!s) return;
    if (symptoms.includes(s)) {
      setNewSymptom("");
      return;
    }
    setSymptoms((prev) => [...prev, s]);
    setNewSymptom("");
  };

  const removeSymptom = (val) => {
    setSymptoms((prev) => prev.filter((p) => p !== val));
  };

  const saveSymptoms = async () => {
    setSavingSymptoms(true);
    try {
      const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/me/symptoms`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ symptoms }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      // update localStorage user copy
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : {};
      u.symptoms = data?.data?.symptoms || symptoms;
      localStorage.setItem("user", JSON.stringify(u));
    } catch {
      // ignore for now
    } finally {
      setSavingSymptoms(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br text-gray">
      <div className="w-64 bg-gray-400 bg-opacity-30 text-black p-6 flex flex-col  items-center backdrop-blur-sm ">
        <div>
          <h2 className="text-xl font-bold mb-6">Health Portal</h2>
          <nav className="space-y-4 text-sm">
            <div>
              <Link to="/PatientDashboard">🏠 Dashboard</Link>
            </div>
            <div>
              <Link to="/Sympthoms">👥 Sympthoms</Link>
            </div>
            <div>
              <Link to="/chat">💬 Messages</Link>
            </div>
            <div>📞 Telehealth</div>
            <div>⚙️ Settings</div>
            <div>
              <Link to="/login">➡️Logout</Link>
            </div>
          </nav>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Monday, January 28, 2019</h3>
            <p className="text-sm text-gray-500">9:00 AM</p>
          </div>
          <div>
            <Link
              to="/patientDashboardForm"
              className="bg-white bg-opacity-20 text-white text-lg font-semibold px-4 py-2 rounded hover:bg-opacity-30 inline-block"
            >
              Patient Input health Data
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-1 border rounded-full"
            />
            <img
              src="https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?w=500"
              alt="Doctor"
              className="w-10 h-10 rounded-full"
            />
            <span className="font-medium">{userName}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-10 p-4 rounded-lg shadow flex flex-col backdrop-blur-sm"
            >
              <h4 className="text-md font-semibold mb-1">{metric.title}</h4>
              <p className="text-sm text-white/90 mb-2">{metric.value}</p>
              {chartData[index]?.labels ? (
                <Line data={chartData[index]} />
              ) : (
                <p className="text-sm text-gray-400">Loading chart...</p>
              )}
            </div>
          ))}
        </div>

        {/* Symptoms box */}
        <div className="mt-8 max-w-2xl">
          <h4 className="text-lg font-semibold mb-2">Your Symptoms</h4>
          <div className="flex gap-2 mb-2">
            <input
              value={newSymptom}
              onChange={(e) => setNewSymptom(e.target.value)}
              placeholder="Add symptom e.g. cough"
              className="px-3 py-2 border rounded flex-1"
            />
            <button
              onClick={addSymptom}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {symptoms.length === 0 && (
              <p className="text-sm text-gray-500">No symptoms recorded.</p>
            )}
            {symptoms.map((s) => (
              <div
                key={s}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>{s}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => removeSymptom(s)}
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button
              onClick={saveSymptoms}
              disabled={savingSymptoms}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {savingSymptoms ? "Saving..." : "Save Symptoms"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
