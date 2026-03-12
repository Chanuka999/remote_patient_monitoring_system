import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Login = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
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

      const { token, data } = response.data || {};
      const user = data || response.data?.user || null;

      if (token) localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            symptoms: user.symptoms || [],
          }),
        );
      }

      setError("");

      if (user?.role === "patient") navigate("/patientDashboard");
      else if (user?.role === "doctor") navigate("/doctorDashboard");
      else if (user?.role === "admin") navigate("/adminDashboard");
    } catch (requestError) {
      let errorMessage = "Login failed. Please try again.";

      if (requestError?.response?.data?.message) {
        errorMessage = requestError.response.data.message;
      } else if (requestError?.response?.data?.error) {
        errorMessage = requestError.response.data.error;
      } else if (requestError?.message) {
        errorMessage = requestError.message;
      } else if (requestError?.response?.status) {
        errorMessage = `Server error: ${requestError.response.status}. Please try again.`;
      }

      console.error("Login error:", {
        status: requestError?.response?.status,
        message: errorMessage,
        details: requestError?.response?.data,
      });

      setError(errorMessage);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-10">
        <section
          className={`relative overflow-hidden rounded-[28px] border p-8 md:p-10 ${
            isDark
              ? "border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),linear-gradient(135deg,#020617,#0f172a_55%,#082f49)]"
              : "border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_24%),linear-gradient(135deg,#ffffff,#e0f2fe_55%,#f8fafc)]"
          }`}
        >
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <div className="flex items-center gap-4">
                <img
                  src="/logo.png"
                  alt="HealthLink logo"
                  className="h-14 w-auto"
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
                    HealthLink
                  </p>
                  <h1 className="text-3xl font-black sm:text-4xl">
                    Sign in to your care workspace.
                  </h1>
                </div>
              </div>
              <p
                className={`mt-6 max-w-xl text-base leading-8 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Access patient monitoring, appointment coordination, symptom
                tracking, and doctor communication from a single dashboard.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div
                className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-white/80"}`}
              >
                <p className="text-2xl font-bold">Fast</p>
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  login and role-based access
                </p>
              </div>
              <div
                className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-white/80"}`}
              >
                <p className="text-2xl font-bold">Clear</p>
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  alerts and patient context
                </p>
              </div>
              <div
                className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-white/80"}`}
              >
                <p className="text-2xl font-bold">Connected</p>
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  appointments and messaging
                </p>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 top-8 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-16 left-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl"></div>
        </section>

        <section className="flex items-center justify-center">
          <div
            className={`w-full max-w-xl rounded-[28px] border p-6 shadow-2xl md:p-8 ${
              isDark
                ? "border-slate-800 bg-slate-900 shadow-slate-950/40"
                : "border-slate-200 bg-white shadow-slate-200/80"
            }`}
          >
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
                Welcome Back
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Login to your account
              </h2>
              <p
                className={`mt-3 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Use your registered email and password to continue.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-sky-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-sky-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500"
                  }`}
                />
              </div>

              {error && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    isDark
                      ? "border-red-900 bg-red-950/50 text-red-300"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                Login
              </button>
            </form>

            <div
              className={`mt-6 rounded-2xl px-4 py-4 text-sm ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}
            >
              New here?{" "}
              <Link
                to="/register"
                className="font-semibold text-sky-500 hover:text-sky-600"
              >
                Create an account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
