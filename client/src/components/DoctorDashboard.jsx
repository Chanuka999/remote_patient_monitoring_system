import React, { useState } from "react";
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

const DoctorDashboard = () => {
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
          <h4 className="text-center font-semibold">Dr Nimal perera</h4>
          <p className="text-center">nimalperera23@gmail.com</p>
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
            <span>Dr Nimal perera</span>
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
      </div>
    </div>
  );
};

export default DoctorDashboard;
