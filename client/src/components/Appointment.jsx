import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Appointment = () => {
  const [selectedView, setSelectedView] = useState("Appointments");

  const navItems = [
    { name: "Overview", icon: "📊", to: "/doctorDashboard" },
    { name: "Appointments", icon: "📅", to: "/appointments" },
    { name: "Inventory", icon: "📦", to: "/inventory" },
    { name: "Patients", icon: "👥", to: "/patient" },
    { name: "Settings", icon: "⚙️", to: "/settings" },
  ];

  const appointments = [
    {
      time: "10:00 - 10:30",
      name: "Howard Morrison",
      cab: "#123",
      status: "Complete",
    },
    {
      time: "10:30 - 11:00",
      name: "Gerard Gregory",
      cab: "#123",
      status: "Complete",
    },
    {
      time: "12:00 - 12:30",
      name: "Timmy Olson",
      cab: "#148",
      status: "Start",
    },
    {
      time: "12:30 - 13:00",
      name: "Jimm Stephens",
      cab: "#147",
      status: "Canceled",
    },
  ];

  const user = {
    name: "Timmy Olson",
    address: "St Audrey's Close, New Jersey 28333",
    photo:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGVvcGxlfGVufDB8fDB8fHww",
    patient: {
      dob: "16 August, 1984",
      height: "184 cm",
      weight: "48kg",
      disease: "Austma",
    },
  };

  const handleLogout = () => {
    alert("Logged out!");
  };
  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Appointment</h1>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.to}
            className={`sidebar-item flex items-center p-2 rounded-lg mb-2 cursor-pointer ${
              selectedView === item.name ? "bg-green-600" : ""
            }`}
            onClick={() => setSelectedView(item.name)}
          >
            <span className="mr-2">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
        <Link
          to="/login"
          onClick={handleLogout}
          className="w-full mt-8 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 flex items-center justify-start pl-2"
        >
          <span className="mr-2">🚪</span> Log out
        </Link>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search by keywords..."
            className="w-1/3 p-2 border rounded-lg"
          />
          <div className="flex items-center space-x-4">
            <span>Today, 12 April</span>
            <span>09:32 AM</span>
            <span className="cursor-pointer">🔔</span>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Welcome, Dr. Terry!</h2>
          <p className="text-gray-600">
            Check the latest updates on your account
          </p>
        </div>

        {/* Stats */}
        <div className="flex space-x-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl">📅 28 / 45</div>
            <div>Today’s appointments</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl">❌ 13 / 45</div>
            <div>Canceled appointments</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl">👥 283</div>
            <div>Total patients</div>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-semibold">Appointments</h3>
            <div className="flex space-x-2">
              <button className="px-2 py-1 bg-gray-200 rounded">Day</button>
              <button className="px-2 py-1 bg-gray-200 rounded">Week</button>
              <button className="px-2 py-1 bg-gray-200 rounded">Month</button>
              <span>12 April</span>
              <button>⬅️</button>
              <button>➡️</button>
            </div>
          </div>
          {appointments.map((app, index) => (
            <div
              key={index}
              className="appointment-card flex items-center justify-between p-2 mb-2 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <span>{app.time}</span>
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGVvcGxlfGVufDB8fDB8fHww"
                  alt="Profile"
                  className="rounded-full h-10 w-10"
                />
                <span>{app.name}</span>
                <span>Cab: {app.cab}</span>
              </div>
              <div className="flex items-center space-x-2">
                {app.status === "Complete" && (
                  <span className="text-green-500">✔️ Complete</span>
                )}
                {app.status === "Start" && (
                  <button className="bg-black text-white px-2 py-1 rounded">
                    ▶️ Start
                  </button>
                )}
                {app.status === "Canceled" && (
                  <span className="text-red-500">❌ Canceled</span>
                )}
                <span className="text-gray-400">...</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-80 bg-white p-4 rounded-lg shadow ml-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Patient details</h3>
          <span className="cursor-pointer">❌</span>
        </div>
        <img
          src={user.photo}
          alt="User"
          className="rounded-full mb-2 mx-auto block h-40 w-40"
        />
        <h4 className="font-bold">{user.name}</h4>
        <p>{user.address}</p>
        <div className="mt-4">
          <p>D.O.B: {user.patient.dob}</p>
          <p>Height: {user.patient.height}</p>
          <p>Weight: {user.patient.weight}</p>
          <p>
            Disease:{" "}
            <span className="text-red-500">{user.patient.disease}</span>
          </p>
        </div>
        <div className="mt-4 flex space-x-2">
          <button className="bg-purple-500 text-white px-2 py-1 rounded">
            📋
          </button>
          <button className="bg-green-500 text-white px-2 py-1 rounded">
            📨
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
