import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [number, setNumber] = useState("");
  const [symptoms, setSymptoms] = useState([]);

  const navigate = useNavigate();

  const handleSymptomChange = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter((s) => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const API_BASE =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    axios
      .post(`${API_BASE}/register`, {
        name,
        email,
        password,
        role,
        number,
        symptoms,
      })
      .then((result) => {
        console.log("Register success", result.data);
        navigate("/login");
      })
      .catch((error) => {
        console.error(
          "Register error",
          error?.response?.data || error.message || error
        );
        alert(error?.response?.data?.message || "Registration failed");
      });
  };

  return (
    <div className="w-full h-screen bg-[url('loginBg.png')] bg-cover bg-center flex font-sans">
      <div className="w-[50%] h-full bg-gradient-to-br flex flex-col justify-center items-center relative overflow-hidden">
        <img
          src="/logo.png"
          alt="RPM Logo"
          className="w-48 h-auto mb-6 animate-pulse opacity-90"
        />
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Remote patient monitoring system
        </h1>
        <p>Register your account</p>
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-64 h-64 bg-[var(--color-accent)]/30 rounded-full absolute -top-32 -left-32"></div>
          <div className="w-80 h-80 bg-[var(--color-primary)]/30 rounded-full absolute bottom-0 right-0"></div>
        </div>
      </div>
      <div className="w-[50%] h-full flex  justify-center items-center">
        <div className="w-[500px] p-8 backdrop-blur-xl bg-white/30 shadow-2xl rounded-2xl flex flex-col justify-center items-center gap-6 border border-[var(--color-primary)]/50">
          <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Create Your Account
          </h2>
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
            onSubmit={handleSubmit}
          >
            {/* Name */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-indigo-50"
                placeholder="Enter your name"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-indigo-50"
                placeholder="Enter your email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-white"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-indigo-50"
                placeholder="Enter your password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Role Dropdown */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-white">
                Role
              </label>
              <select
                id="role"
                className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-indigo-50"
                required
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            {/* Symptoms - Visible Only for Patients */}
            {role === "patient" && (
              <div className="space-y-3 border border-purple-200 rounded-lg p-4 bg-purple-50 transition-all duration-300 md:col-span-2">
                <h3 className="text-lg font-semibold text-purple-700">
                  Select Your Symptoms
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {["Heart Disease", "Diabetes", "Hypertension", "Asthma"].map(
                    (symptom) => (
                      <label
                        key={symptom}
                        className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={symptom}
                          checked={symptoms.includes(symptom)}
                          onChange={() => handleSymptomChange(symptom)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span>{symptom}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Phone Number */}
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="number"
                className="text-sm font-medium text-white"
              >
                Phone Number
              </label>
              <input
                id="number"
                type="number"
                className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-indigo-50"
                placeholder="Enter your phone number"
                required
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-105 transition duration-200"
              >
                Sign Up
              </button>
            </div>
          </form>

          {/* Redirect to Login */}
          <div className="mt-4 text-center">
            <p className="text-sm text-white">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-black font-medium transition duration-200 underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
