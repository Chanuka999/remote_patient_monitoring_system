import axios from "axios";
import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const API_BASE =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email,
        password,
      });

      // server may return { success, data, token } where data is the user
      const { token, data } = response.data || {};
      const user = data || response.data?.user || null;
      if (token) localStorage.setItem("token", token);
      if (user) {
        // ensure symptoms are preserved
        const toSave = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          symptoms: user.symptoms || [],
        };
        localStorage.setItem("user", JSON.stringify(toSave));
      }
      setError("");

      if (user?.role === "patient") {
        navigate("/patientDashboard");
      } else if (user?.role === "doctor") {
        navigate("/doctorDashboard");
      } else if (user?.role === "admin") {
        navigate("/adminDashboard");
      }
    } catch (error) {
      console.error(
        "login error",
        error?.response?.data || error.message || error
      );
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
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
        <p className="text-lg text-amber-100 mt-4 max-w-md text-center">
          The digital pathway platform for healthcare providers that turns
          repetitive clinical tasks into intelligent, scalable workflows, proven
          to boost productivity, capacity, and patient flow.
        </p>
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-64 h-64 bg-[var(--color-accent)]/30 rounded-full absolute -top-32 -left-32"></div>
          <div className="w-80 h-80 bg-[var(--color-primary)]/30 rounded-full absolute bottom-0 right-0"></div>
        </div>
      </div>
      <div className="w-[50%] h-full flex justify-center items-center">
        <div className="w-[500px] p-8 backdrop-blur-xl bg-white/30 shadow-2xl rounded-2xl flex flex-col justify-center items-center gap-6 border border-[var(--color-primary)]/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Login Your Account
            </h2>

            <div className="flex flex-col space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition duration-200 bg-indigo-50 placeholder-gray-400"
                placeholder="Enter your email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

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
                name="password"
                className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition duration-200 bg-indigo-50 placeholder-gray-400"
                placeholder="Enter your password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
              >
                Login
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 text-center text-sm text-red-600">{error}</div>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-white">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-black font-medium transition duration-200 underline"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
