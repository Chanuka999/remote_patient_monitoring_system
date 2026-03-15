import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const buildInitials = (name = "Doctor") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "DR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const buildAvatarDataUri = (name = "Doctor") => {
  const initials = buildInitials(name);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#06b6d4'/>
        <stop offset='100%' stop-color='#2563eb'/>
      </linearGradient>
    </defs>
    <rect width='200' height='200' rx='24' fill='url(#g)'/>
    <text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial, sans-serif' font-size='64' font-weight='700'>${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const SAMPLE_DOCTOR_IMAGE =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80";

const Doctors = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const apiBase = import.meta.env.VITE_BACKEND_URL || "";
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${apiBase}/api/doctors`);
        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Failed to load doctors");
        }

        setDoctors(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        setError(
          err.message || "Unable to fetch doctor information right now.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [apiBase]);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((doc) => {
      const name = (doc?.name || "").toLowerCase();
      const email = (doc?.email || "").toLowerCase();
      const number = (doc?.number || "").toLowerCase();
      return name.includes(q) || email.includes(q) || number.includes(q);
    });
  }, [doctors, search]);

  const handleBookWithDoctor = (doctor) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || user._id;

    if (!userId) {
      navigate("/login");
      return;
    }

    if (user.role !== "patient") {
      navigate("/appointment");
      return;
    }

    navigate(`/book-appointment?doctorId=${encodeURIComponent(doctor._id)}`);
  };

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-b from-cyan-50 via-white to-blue-50"
      }`}
    >
      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-16">
        <section
          className={`relative overflow-hidden rounded-3xl border px-6 py-10 shadow-xl md:px-10 ${
            isDark
              ? "border-slate-700 bg-slate-900/70 text-slate-100"
              : "border-slate-200 bg-white/90 text-slate-800"
          }`}
        >
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="inline-flex rounded-full bg-cyan-500/15 px-4 py-1 text-sm font-semibold text-cyan-500">
                Our Medical Team
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                Meet Our Doctors
              </h1>
              <p
                className={`mt-4 max-w-2xl leading-7 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Explore our available doctors and quickly find the right
                specialist for your care. Every card includes contact details
                and doctor profile information pulled from your registered
                doctor data.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className={`rounded-xl border p-4 ${
                  isDark
                    ? "border-slate-700 bg-slate-800/60"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className="text-sm text-cyan-500">Total Doctors</p>
                <p className="mt-1 text-2xl font-bold">{doctors.length}</p>
              </div>
              <div
                className={`rounded-xl border p-4 ${
                  isDark
                    ? "border-slate-700 bg-slate-800/60"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className="text-sm text-cyan-500">Displayed</p>
                <p className="mt-1 text-2xl font-bold">
                  {filteredDoctors.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div
            className={`rounded-2xl border p-4 md:p-5 ${
              isDark
                ? "border-slate-700 bg-slate-900/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <label htmlFor="doctor-search" className="sr-only">
              Search doctors
            </label>
            <input
              id="doctor-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or phone"
              className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                isDark
                  ? "border-slate-600 bg-slate-800 text-slate-100 focus:ring-cyan-500/40"
                  : "border-slate-300 bg-white text-slate-900 focus:ring-cyan-500/30"
              }`}
            />
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className={`h-64 animate-pulse rounded-2xl border ${
                    isDark
                      ? "border-slate-700 bg-slate-800/60"
                      : "border-slate-200 bg-white"
                  }`}
                />
              ))}
            </div>
          ) : error ? (
            <div
              className={`rounded-2xl border p-6 text-center ${
                isDark
                  ? "border-red-700/50 bg-red-500/10 text-red-300"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {error}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div
              className={`rounded-2xl border p-10 text-center ${
                isDark
                  ? "border-slate-700 bg-slate-900/70 text-slate-300"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              No doctors matched your search.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <article
                  key={doctor._id || doctor.email || doctor.name}
                  className={`overflow-hidden rounded-2xl border shadow-sm transition-transform duration-300 hover:-translate-y-1 ${
                    isDark
                      ? "border-slate-700 bg-slate-900/70 text-slate-100"
                      : "border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <img
                    src={SAMPLE_DOCTOR_IMAGE}
                    alt="Sample doctor"
                    className="h-36 w-full object-cover"
                  />

                  <div className="p-5">
                    <div className="mb-4 flex items-center gap-4">
                      <img
                        src={buildAvatarDataUri(doctor.name)}
                        alt={`${doctor.name || "Doctor"} profile`}
                        className="h-16 w-16 rounded-xl object-cover shadow"
                      />
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold">
                          Dr. {doctor.name || "Unknown"}
                        </h3>
                        <p className="text-sm text-cyan-500">
                          Medical Specialist
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div
                        className={`rounded-lg border p-3 ${
                          isDark
                            ? "border-slate-700 bg-slate-800/60"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <p className="text-xs uppercase tracking-wide text-cyan-500">
                          Email
                        </p>
                        <p className="mt-1 break-all font-medium">
                          {doctor.email || "Not provided"}
                        </p>
                      </div>

                      <div
                        className={`rounded-lg border p-3 ${
                          isDark
                            ? "border-slate-700 bg-slate-800/60"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <p className="text-xs uppercase tracking-wide text-cyan-500">
                          Phone
                        </p>
                        <p className="mt-1 font-medium">
                          {doctor.number || "Not provided"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isDark
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          Available
                        </span>
                        <span
                          className={`text-xs ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          ID: {(doctor._id || "N/A").toString().slice(-6)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBookWithDoctor(doctor)}
                        className="mt-3 w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 hover:shadow-lg"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Doctors;
