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
      if (user) localStorage.setItem("user", JSON.stringify(user));
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 transform transition-all duration-300 hover:shadow-xl">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Login Your Account
          </h2>

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-indigo-700"
            >
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
              className="text-sm font-medium text-indigo-700"
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
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-purple-600 font-medium hover:text-purple-800 transition duration-200 underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
