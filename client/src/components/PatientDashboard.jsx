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
  const [chartData, setChartData] = useState([
    defaultChart,
    defaultChart,
    defaultChart,
    defaultChart,
    defaultChart,
  ]);

  const metrics = [
    { title: "Blood Pressure", value: "120/80 mmHg" },
    { title: "Heart Rate", value: "80 bpm" },
    { title: "SPO2", value: "98%" },
    { title: "RPM Device Usage", value: "40 min" },
    { title: "Respiration Rate", value: "18 bpm" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">
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
        <div className="mt-6 text-sm ">
          <img
            src="https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?w=500"
            alt="Patient"
            className="w-16 h-16 rounded-full mx-auto mb-2"
          />
          <h4 className="text-center font-semibold">Chanuka randitha</h4>
          <p className="text-center">chanukaranditha99@gmail.com</p>
          <div className="mt-2">
            <p>🩺 High Blood Pressure</p>
            <p>😴 Sleep Apnea</p>
            <p>🚬 Smoking</p>
          </div>
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
              className="bg-gray-600 text-white text-lg font-semibold px-4 py-2 rounded hover:bg-gray-700 inline-block"
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
            <span>chanuka randitha</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow flex flex-col"
            >
              <h4 className="text-md font-semibold mb-1">{metric.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{metric.value}</p>
              {chartData[index]?.labels ? (
                <Line data={chartData[index]} />
              ) : (
                <p className="text-sm text-gray-400">Loading chart...</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
