import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const symptomOptions = ["Heart Disease", "Diabetes", "Hypertension", "Asthma"];

const Register = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [number, setNumber] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSymptomChange = (symptom) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((selected) => selected !== symptom)
        : [...prev, symptom],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const API_BASE =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    try {
      await axios.post(`${API_BASE}/register`, {
        name,
        email,
        password,
        role,
        number,
        symptoms,
      });

      setError("");
      navigate("/login");
    } catch (requestError) {
      console.error(
        "Register error",
        requestError?.response?.data || requestError.message || requestError,
      );
      setError(requestError?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-10">
        <section className="flex items-center justify-center order-2 lg:order-1">
          <div
            className={`w-full rounded-[28px] border p-6 shadow-2xl md:p-8 ${
              isDark
                ? "border-slate-800 bg-slate-900 shadow-slate-950/40"
                : "border-slate-200 bg-white shadow-slate-200/80"
            }`}
          >
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
                New Account
              </p>
              <h2 className="mt-2 text-3xl font-black">Create your profile</h2>
              <p
                className={`mt-3 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Register as a patient, doctor, or admin and start using the
                monitoring platform with the right access.
              </p>
            </div>

            <form
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-sky-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500"
                  }`}
                />
              </div>

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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-sky-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Role
                </label>
                <select
                  id="role"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-white focus:border-sky-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 focus:border-sky-500"
                  }`}
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="number"
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Phone Number
                </label>
                <input
                  id="number"
                  type="tel"
                  required
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Enter your contact number"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-sky-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500"
                  }`}
                />
              </div>

              {(role === "patient" || role === "doctor") && (
                <div
                  className={`space-y-4 rounded-[24px] border p-5 md:col-span-2 ${
                    isDark
                      ? "border-slate-700 bg-slate-800"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div>
                    <h3 className="text-lg font-bold">
                      Select symptoms to monitor
                    </h3>
                    <p
                      className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Choose any existing conditions relevant to your
                      monitoring.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {symptomOptions.map((symptom) => (
                      <label
                        key={symptom}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                          symptoms.includes(symptom)
                            ? isDark
                              ? "border-sky-500 bg-sky-500/10 text-white"
                              : "border-sky-400 bg-sky-50 text-slate-900"
                            : isDark
                              ? "border-slate-700 bg-slate-900 text-slate-300"
                              : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={symptom}
                          checked={symptoms.includes(symptom)}
                          onChange={() => handleSymptomChange(symptom)}
                          className="h-4 w-4"
                        />
                        <span>{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm md:col-span-2 ${
                    isDark
                      ? "border-red-900 bg-red-950/50 text-red-300"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {error}
                </div>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
                >
                  Create Account
                </button>
              </div>
            </form>

            <div
              className={`mt-6 rounded-2xl px-4 py-4 text-sm ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}
            >
              Already registered?{" "}
              <Link
                to="/login"
                className="font-semibold text-sky-500 hover:text-sky-600"
              >
                Log in here
              </Link>
            </div>
          </div>
        </section>

        <section
          className={`relative order-1 overflow-hidden rounded-[28px] border p-8 md:p-10 lg:order-2 ${
            isDark
              ? "border-slate-800 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_24%),linear-gradient(135deg,#082f49,#0f172a_55%,#020617)]"
              : "border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(135deg,#f8fafc,#e0f2fe_55%,#ffffff)]"
          }`}
        >
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <img
                src="/logo.png"
                alt="HealthLink logo"
                className="h-14 w-auto"
              />
              <h1 className="mt-6 text-3xl font-black sm:text-4xl">
                Join a platform designed for practical remote care.
              </h1>
              <p
                className={`mt-5 max-w-xl text-base leading-8 ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                Create your account to manage symptoms, share health data, book
                appointments, and collaborate with care teams more easily.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div
                className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-white/80"}`}
              >
                <p className="text-2xl font-bold">Patients</p>
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  report symptoms and measurements
                </p>
              </div>
              <div
                className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-white/80"}`}
              >
                <p className="text-2xl font-bold">Doctors</p>
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  review alerts and follow up faster
                </p>
              </div>
              <div
                className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-white/80"}`}
              >
                <p className="text-2xl font-bold">Admins</p>
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  manage access and system flow
                </p>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl"></div>
        </section>
      </div>
    </div>
  );
};

export default Register;
