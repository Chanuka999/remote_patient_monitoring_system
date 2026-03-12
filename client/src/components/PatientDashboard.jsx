import React, { useEffect, useState } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Chat from "../Chat";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const getHealthStatus = (metric, value) => {
  const val = parseFloat(value);

  const ranges = {
    "Blood Pressure": {
      normal: [90, 120],
      warning: [120, 160],
      critical: [160, Infinity],
    },
    "Heart Rate": {
      normal: [60, 100],
      warning: [100, 120],
      critical: [120, Infinity],
    },
    SPO2: { normal: [95, 100], warning: [90, 95], critical: [0, 90] },
    "Respiration Rate": {
      normal: [12, 20],
      warning: [20, 25],
      critical: [25, Infinity],
    },
  };

  if (!ranges[metric]) return "neutral";

  const range = ranges[metric];
  if (val >= range.normal[0] && val <= range.normal[1]) return "healthy";
  if (val >= range.warning[0] && val <= range.warning[1]) return "warning";
  return "critical";
};

const defaultChart = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Metric",
      data: [70, 75, 72, 78, 76, 80, 77],
      borderColor: "rgb(14, 165, 233)",
      backgroundColor: "rgba(14, 165, 233, 0.12)",
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: "rgb(14, 165, 233)",
    },
  ],
};

const metricCards = [
  { title: "Blood Pressure", value: "120/80 mmHg" },
  { title: "Heart Rate", value: "80 bpm" },
  { title: "SPO2", value: "98%" },
  { title: "RPM Device Usage", value: "40 min" },
  { title: "Respiration Rate", value: "18 bpm" },
];

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
  const [chartData] = useState([
    defaultChart,
    defaultChart,
    defaultChart,
    defaultChart,
    defaultChart,
  ]);
  const [reportPeriod, setReportPeriod] = useState("weekly");
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendSummary, setTrendSummary] = useState({
    measurementsCount: 0,
    predictionsCount: 0,
    avgHealthScore: 0,
    currentHealthScore: 0,
    highRiskRate: 0,
    highRiskCount: 0,
    lastMeasurementText: "No measurements",
    measurementsToday: 0,
  });
  const [riskTrendData, setRiskTrendData] = useState([]);
  const [healthScoreTrendData, setHealthScoreTrendData] = useState([]);
  const [improvementIndicators, setImprovementIndicators] = useState([]);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosMessage, setSosMessage] = useState("");
  const [sosError, setSosError] = useState("");
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [hospitalError, setHospitalError] = useState("");
  const [patientLocation, setPatientLocation] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [hospitalAutoLoaded, setHospitalAutoLoaded] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [symptoms, setSymptoms] = useState([]);
  const [newSymptom, setNewSymptom] = useState("");
  const [savingSymptoms, setSavingSymptoms] = useState(false);

  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    storedUser = raw ? JSON.parse(raw) : null;
  } catch {
    storedUser = null;
  }

  const userName = storedUser?.name || storedUser?.email || "Guest";

  useEffect(() => {
    const load = async () => {
      try {
        const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data?.data?.symptoms) setSymptoms(data.data.symptoms || []);
      } catch {
        // ignore
      }
    };

    load();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const loadHealthTrends = async () => {
      setTrendLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE}/api/measurements/trends?period=${reportPeriod}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );

        if (!response.ok) return;
        const data = await response.json();
        const payload = data?.data;
        if (!payload) return;

        setTrendSummary((prev) => ({ ...prev, ...(payload.summary || {}) }));
        setRiskTrendData(payload.riskTrend || []);
        setHealthScoreTrendData(payload.healthScoreTrend || []);
        setImprovementIndicators(payload.improvementIndicators || []);
      } catch {
        // ignore and keep existing fallback dashboard values
      } finally {
        setTrendLoading(false);
      }
    };

    loadHealthTrends();
  }, [API_BASE, reportPeriod]);

  const addSymptom = () => {
    const symptom = String(newSymptom || "").trim();
    if (!symptom) return;
    if (symptoms.includes(symptom)) {
      setNewSymptom("");
      return;
    }
    setSymptoms((prev) => [...prev, symptom]);
    setNewSymptom("");
  };

  const removeSymptom = (value) => {
    setSymptoms((prev) => prev.filter((item) => item !== value));
  };

  const saveSymptoms = async () => {
    setSavingSymptoms(true);
    try {
      const API_BASE = import.meta.env.VITE_BACKEND_URL || "";
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/me/symptoms`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) throw new Error("Failed to save");

      const data = await response.json();
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : {};
      user.symptoms = data?.data?.symptoms || symptoms;
      localStorage.setItem("user", JSON.stringify(user));
    } catch {
      // ignore for now
    } finally {
      setSavingSymptoms(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      // noop
    }
    navigate("/login");
  };

  const getIpBasedLocation = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const d = await res.json();
      if (d?.latitude && d?.longitude)
        return { latitude: Number(d.latitude), longitude: Number(d.longitude) };
    } catch {}
    return null;
  };

  const getBrowserLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        getIpBasedLocation().then(resolve);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: Number(position.coords.latitude),
            longitude: Number(position.coords.longitude),
          });
        },
        async () => resolve(await getIpBasedLocation()),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
      );
    });

  const triggerEmergencySOS = async () => {
    setSosMessage("");
    setSosError("");

    const proceed = window.confirm(
      "Trigger Emergency SOS? This will notify doctors immediately.",
    );
    if (!proceed) return;

    setSosLoading(true);
    try {
      const token = localStorage.getItem("token");
      const location = await getBrowserLocation();

      const response = await fetch(`${API_BASE}/api/alerts/emergency`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          location,
          note: "Triggered from Patient Dashboard SOS button",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to trigger SOS");
      }

      setSosMessage("Emergency alert sent. Doctors were notified immediately.");
    } catch (err) {
      setSosError(err?.message || "Failed to trigger Emergency SOS.");
    } finally {
      setSosLoading(false);
    }
  };

  const loadNearbyHospitals = async () => {
    setHospitalError("");
    setHospitalLoading(true);

    try {
      const token = localStorage.getItem("token");
      const location = await getBrowserLocation();
      if (!location) {
        throw new Error(
          "Location access is required to find nearby hospitals.",
        );
      }

      setPatientLocation(location);

      const response = await fetch(
        `${API_BASE}/api/hospitals/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=10000`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load nearby hospitals");
      }

      setNearbyHospitals(data?.data?.hospitals || []);
      setEmergencyContacts(data?.data?.emergencyContacts || []);
    } catch (err) {
      setHospitalError(err?.message || "Unable to load nearby hospitals.");
      setNearbyHospitals([]);
    } finally {
      setHospitalLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: isDark ? "#94a3b8" : "#64748b" },
        grid: {
          color: isDark ? "rgba(148,163,184,0.08)" : "rgba(148,163,184,0.18)",
        },
      },
      y: {
        ticks: { color: isDark ? "#94a3b8" : "#64748b" },
        grid: {
          color: isDark ? "rgba(148,163,184,0.08)" : "rgba(148,163,184,0.18)",
        },
      },
    },
  };

  const overallStatus =
    trendSummary.currentHealthScore >= 80
      ? "Healthy"
      : trendSummary.currentHealthScore >= 60
        ? "Stable"
        : "Needs Attention";

  const summaryCards = [
    {
      title: "Overall Status",
      value: overallStatus,
      icon: "💚",
      tone: "green",
    },
    {
      title: "Last Measurement",
      value: trendSummary.lastMeasurementText || "No measurements",
      icon: "⏱️",
      tone: "blue",
    },
    {
      title: "Measurements Today",
      value: String(trendSummary.measurementsToday || 0),
      icon: "📊",
      tone: "purple",
    },
    {
      title: "High Risk Cases",
      value: String(trendSummary.highRiskCount || 0),
      icon: "🎯",
      tone: "orange",
    },
  ];

  const toneClasses = {
    green: isDark
      ? "border-green-500 bg-green-900/30 text-green-300"
      : "border-green-500 bg-green-50 text-green-700",
    blue: isDark
      ? "border-blue-500 bg-blue-900/30 text-blue-300"
      : "border-blue-500 bg-blue-50 text-blue-700",
    purple: isDark
      ? "border-purple-500 bg-purple-900/30 text-purple-300"
      : "border-purple-500 bg-purple-50 text-purple-700",
    orange: isDark
      ? "border-orange-500 bg-orange-900/30 text-orange-300"
      : "border-orange-500 bg-orange-50 text-orange-700",
  };

  const mergedLabels = [
    ...new Set([
      ...riskTrendData.map((item) => item.label),
      ...healthScoreTrendData.map((item) => item.label),
    ]),
  ];

  const showHospitalFinder =
    Number(trendSummary.highRiskRate || 0) >= 20 ||
    Number(trendSummary.currentHealthScore || 0) < 60 ||
    Number(trendSummary.highRiskCount || 0) > 0;

  useEffect(() => {
    if (!showHospitalFinder || hospitalAutoLoaded || hospitalLoading) return;
    setHospitalAutoLoaded(true);
    loadNearbyHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHospitalFinder, hospitalAutoLoaded, hospitalLoading]);

  const riskTrendChart = {
    labels: mergedLabels,
    datasets: [
      {
        label: "Risk Trend",
        data: mergedLabels.map(
          (label) =>
            (riskTrendData.find((item) => item.label === label)?.avgRisk || 0) *
            100,
        ),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: "Health Score",
        data: mergedLabels.map(
          (label) =>
            healthScoreTrendData.find((item) => item.label === label)?.score ||
            0,
        ),
        borderColor: "rgb(14, 165, 233)",
        backgroundColor: "rgba(14, 165, 233, 0.12)",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}
    >
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside
          className={`w-full shrink-0 lg:w-72 ${
            isDark
              ? "border-b border-slate-800 bg-slate-900 lg:border-b-0 lg:border-r"
              : "border-b border-slate-200 bg-white lg:border-b-0 lg:border-r"
          }`}
        >
          <div className="sticky top-0 p-6 lg:h-screen lg:overflow-y-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-lg text-white">
                  ❤️
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
                    HealthLink
                  </p>
                  <h2 className="text-2xl font-black">Patient Portal</h2>
                </div>
              </div>
              <p
                className={`mt-4 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Track daily health, manage symptoms, and stay connected with
                your care team.
              </p>
            </div>

            <nav className="space-y-2">
              <Link
                to="/patientDashboard"
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isDark
                    ? "bg-sky-500/10 text-white ring-1 ring-sky-500/20"
                    : "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                }`}
              >
                <span>🏠</span>
                <span>Dashboard</span>
              </Link>
              <Link
                to="/Sympthoms"
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isDark
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>🩺</span>
                <span>Symptoms</span>
              </Link>
              <Link
                to="/messages"
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isDark
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>💬</span>
                <span>Messages</span>
              </Link>
              <Link
                to="/book-appointment"
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isDark
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>📅</span>
                <span>Appointments</span>
              </Link>
              <Link
                to="/settings"
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isDark
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>⚙️</span>
                <span>Settings</span>
              </Link>
            </nav>

            <div
              className={`mt-8 rounded-[24px] p-5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
                Quick Tip
              </p>
              <p
                className={`mt-3 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                Log symptoms as soon as they appear so your care team sees the
                most useful context.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className={`mt-8 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isDark
                  ? "bg-red-950/40 text-red-300 hover:bg-red-950/70"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            <section
              className={`overflow-hidden rounded-[28px] border p-6 md:p-8 ${
                isDark
                  ? "border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_25%),linear-gradient(135deg,#0f172a,#111827_55%,#082f49)]"
                  : "border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_25%),linear-gradient(135deg,#ffffff,#e0f2fe_55%,#f8fafc)]"
              }`}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
                    Patient Dashboard
                  </p>
                  <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                    Welcome back, {userName}!
                  </h1>
                  <p
                    className={`mt-3 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}
                  >
                    {now.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {now.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={triggerEmergencySOS}
                    disabled={sosLoading}
                    className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                      sosLoading
                        ? "bg-red-300 text-white cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {sosLoading ? "Sending SOS..." : "🚨 Emergency SOS"}
                  </button>
                  <Link
                    to="/patientDashboardForm"
                    className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
                  >
                    Add Health Data
                  </Link>
                  <Link
                    to="/book-appointment"
                    className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                      isDark
                        ? "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                        : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>

              {(sosMessage || sosError) && (
                <div
                  className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
                    sosError
                      ? isDark
                        ? "bg-red-950/50 text-red-300"
                        : "bg-red-50 text-red-700"
                      : isDark
                        ? "bg-emerald-950/40 text-emerald-300"
                        : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {sosError || sosMessage}
                </div>
              )}
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div
                  key={card.title}
                  className={`rounded-[24px] border-l-4 p-5 shadow-sm ${toneClasses[card.tone]}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{card.title}</p>
                      <p className="mt-2 text-2xl font-black">{card.value}</p>
                    </div>
                    <span className="text-3xl">{card.icon}</span>
                  </div>
                </div>
              ))}
            </section>

            <section className="mt-8">
              <div
                className={`rounded-[28px] border p-6 md:p-8 ${
                  isDark
                    ? "border-slate-800 bg-slate-900"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black">
                      Health Trend Analysis
                    </h2>
                    <p
                      className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Long-term progress, risk trends, and improvement
                      indicators.
                    </p>
                  </div>
                  <div className="inline-flex rounded-full p-1 bg-sky-500/10 ring-1 ring-sky-500/20">
                    <button
                      onClick={() => setReportPeriod("weekly")}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        reportPeriod === "weekly"
                          ? "bg-sky-500 text-white"
                          : isDark
                            ? "text-slate-300 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-sky-100"
                      }`}
                    >
                      Weekly Report
                    </button>
                    <button
                      onClick={() => setReportPeriod("monthly")}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        reportPeriod === "monthly"
                          ? "bg-sky-500 text-white"
                          : isDark
                            ? "text-slate-300 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-sky-100"
                      }`}
                    >
                      Monthly Report
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div
                    className={`rounded-2xl border p-4 ${
                      isDark
                        ? "border-slate-700 bg-slate-800"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-sky-500">
                      Current Health Score
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {trendSummary.currentHealthScore || 0}
                      <span className="ml-1 text-sm font-semibold">/ 100</span>
                    </p>
                  </div>
                  <div
                    className={`rounded-2xl border p-4 ${
                      isDark
                        ? "border-slate-700 bg-slate-800"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-sky-500">
                      Average Health Score
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {trendSummary.avgHealthScore || 0}
                      <span className="ml-1 text-sm font-semibold">/ 100</span>
                    </p>
                  </div>
                  <div
                    className={`rounded-2xl border p-4 ${
                      isDark
                        ? "border-slate-700 bg-slate-800"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-sky-500">
                      High Risk Rate
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {trendSummary.highRiskRate || 0}
                      <span className="ml-1 text-sm font-semibold">%</span>
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-6 h-72 rounded-2xl border p-4 ${
                    isDark
                      ? "border-slate-700 bg-slate-800"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {trendLoading ? (
                    <div
                      className={`flex h-full items-center justify-center text-sm ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Loading trend analysis...
                    </div>
                  ) : mergedLabels.length ? (
                    <Line
                      data={riskTrendChart}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: {
                            display: true,
                            labels: {
                              color: isDark ? "#cbd5e1" : "#334155",
                            },
                          },
                        },
                        scales: {
                          ...chartOptions.scales,
                          y: {
                            ...(chartOptions.scales?.y || {}),
                            min: 0,
                            max: 100,
                          },
                        },
                      }}
                    />
                  ) : (
                    <div
                      className={`flex h-full items-center justify-center text-sm ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Add more measurements to generate trend reports.
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold">
                    Patient Improvement Indicators
                  </h3>
                  {improvementIndicators.length === 0 ? (
                    <p
                      className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Not enough historical data yet. Keep recording health
                      values.
                    </p>
                  ) : (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {improvementIndicators.map((item) => (
                        <div
                          key={item.metric}
                          className={`rounded-2xl border p-4 ${
                            isDark
                              ? "border-slate-700 bg-slate-800"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p
                            className={`mt-2 text-sm font-bold ${
                              item.direction === "up"
                                ? "text-emerald-500"
                                : item.direction === "down"
                                  ? "text-red-500"
                                  : "text-amber-500"
                            }`}
                          >
                            {item.direction === "up" && "▲ Improving"}
                            {item.direction === "down" && "▼ Needs Attention"}
                            {item.direction === "stable" && "■ Stable"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">Health Metrics</h2>
                  <p
                    className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Review recent patterns in your key measurements.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {metricCards.map((metric, index) => {
                  const status = getHealthStatus(metric.title, metric.value);
                  const statusClasses = {
                    healthy: isDark
                      ? "border-green-500 bg-slate-900"
                      : "border-green-500 bg-white",
                    warning: isDark
                      ? "border-yellow-500 bg-slate-900"
                      : "border-yellow-500 bg-white",
                    critical: isDark
                      ? "border-red-500 bg-slate-900"
                      : "border-red-500 bg-white",
                    neutral: isDark
                      ? "border-sky-500 bg-slate-900"
                      : "border-sky-300 bg-white",
                  };

                  const statusTextClass =
                    status === "healthy"
                      ? "text-green-500"
                      : status === "warning"
                        ? "text-yellow-500"
                        : status === "critical"
                          ? "text-red-500"
                          : "text-sky-500";

                  return (
                    <article
                      key={metric.title}
                      className={`rounded-[24px] border-l-4 p-6 shadow-lg ${statusClasses[status]} ${
                        isDark
                          ? "border border-slate-800"
                          : "border border-slate-200"
                      }`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h3
                            className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                          >
                            {metric.title}
                          </h3>
                          <p
                            className={`mt-2 text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}
                          >
                            {metric.value}
                          </p>
                        </div>
                        <span className="text-3xl">
                          {status === "healthy" && "✅"}
                          {status === "warning" && "⚠️"}
                          {status === "critical" && "🔴"}
                          {status === "neutral" && "📊"}
                        </span>
                      </div>
                      <p
                        className={`mb-4 text-sm font-semibold ${statusTextClass}`}
                      >
                        {status === "healthy" && "Optimal"}
                        {status === "warning" && "Needs Attention"}
                        {status === "critical" && "Critical"}
                        {status === "neutral" && "Monitor"}
                      </p>
                      <div
                        className={`h-44 rounded-2xl border p-3 ${
                          isDark
                            ? "border-slate-800 bg-slate-800"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        {chartData[index]?.labels ? (
                          <Line
                            data={chartData[index]}
                            options={chartOptions}
                          />
                        ) : (
                          <div
                            className={`flex h-full items-center justify-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
                          >
                            Loading chart...
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {showHospitalFinder && (
              <section className="mt-8">
                <div
                  className={`rounded-[28px] border p-6 md:p-8 ${
                    isDark
                      ? "border-red-900 bg-gradient-to-br from-slate-900 to-red-950/30"
                      : "border-red-200 bg-gradient-to-br from-red-50 to-white"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-red-500">
                        Nearby Hospital Finder
                      </h2>
                      <p
                        className={`mt-1 text-sm ${
                          isDark ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        High risk detected. Find nearest hospitals, open maps,
                        and use emergency contacts.
                      </p>
                    </div>
                    <button
                      onClick={loadNearbyHospitals}
                      disabled={hospitalLoading}
                      className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                        hospitalLoading
                          ? "bg-red-300 text-white cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {hospitalLoading
                        ? "Finding Hospitals..."
                        : "🏥 Find Nearest Hospitals"}
                    </button>
                  </div>

                  {hospitalError && (
                    <div
                      className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
                        isDark
                          ? "bg-red-950/50 text-red-300"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {hospitalError}
                    </div>
                  )}

                  {patientLocation && (
                    <div
                      className={`mt-5 rounded-2xl border p-4 ${
                        isDark
                          ? "border-slate-700 bg-slate-800"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <p className="text-sm font-semibold text-sky-500 mb-3">
                        Map Integration
                      </p>
                      <div className="h-64 overflow-hidden rounded-xl border border-slate-300">
                        <iframe
                          title="Nearby hospitals map"
                          src={`https://www.google.com/maps?q=${patientLocation.latitude},${patientLocation.longitude}&z=13&output=embed`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  )}

                  {(nearbyHospitals.length > 0 ||
                    emergencyContacts.length > 0) && (
                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                      <div>
                        <h3 className="text-lg font-bold mb-3">
                          Nearest Hospitals
                        </h3>
                        <div className="grid gap-3">
                          {nearbyHospitals.slice(0, 6).map((hospital) => (
                            <div
                              key={`${hospital.placeId}-${hospital.name}`}
                              className={`rounded-2xl border p-4 ${
                                isDark
                                  ? "border-slate-700 bg-slate-800"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <p className="font-bold">{hospital.name}</p>
                                  <p
                                    className={`text-sm mt-1 ${
                                      isDark
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {hospital.address}
                                  </p>
                                  <p className="text-xs text-amber-500 mt-1">
                                    ⭐ {hospital.rating || "N/A"} (
                                    {hospital.userRatingsTotal || 0} reviews)
                                  </p>
                                  {hospital.emergencyContact && (
                                    <p className="text-xs text-emerald-500 mt-1">
                                      Emergency Contact:{" "}
                                      {hospital.emergencyContact}
                                    </p>
                                  )}
                                </div>
                                {hospital.mapsUrl && (
                                  <a
                                    href={hospital.mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600"
                                  >
                                    Open in Google Maps
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold mb-3">
                          Emergency Contact
                        </h3>
                        <div className="grid gap-3">
                          {emergencyContacts.map((contact) => (
                            <a
                              key={`${contact.label}-${contact.number}`}
                              href={`tel:${contact.number}`}
                              className={`rounded-2xl border p-4 transition ${
                                isDark
                                  ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
                                  : "border-slate-200 bg-white hover:bg-slate-100"
                              }`}
                            >
                              <p className="text-sm font-semibold text-red-500">
                                {contact.label}
                              </p>
                              <p className="text-xl font-black mt-1">
                                {contact.number}
                              </p>
                            </a>
                          ))}
                          {!emergencyContacts.length && (
                            <p
                              className={`text-sm ${
                                isDark ? "text-slate-400" : "text-slate-600"
                              }`}
                            >
                              Emergency contacts will appear after hospital
                              search.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div
                className={`rounded-[28px] border p-6 md:p-8 ${
                  isDark
                    ? "border-slate-800 bg-slate-900"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-black">Your Symptoms</h2>
                  <p
                    className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Add symptoms you are experiencing so your doctor has better
                    context.
                  </p>
                </div>

                <div className="mb-6">
                  <label
                    className={`mb-2 block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}
                  >
                    Add a symptom
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={newSymptom}
                      onChange={(e) => setNewSymptom(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSymptom();
                        }
                      }}
                      placeholder="e.g. headache, fever, cough"
                      className={`flex-1 rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-sky-500"
                          : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-500"
                      }`}
                    />
                    <button
                      onClick={addSymptom}
                      className="rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
                    >
                      Add Symptom
                    </button>
                  </div>
                </div>

                {symptoms.length === 0 ? (
                  <div
                    className={`rounded-[24px] border border-dashed p-6 text-center ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-slate-300"
                        : "border-slate-300 bg-slate-50 text-slate-600"
                    }`}
                  >
                    No symptoms recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {symptoms.map((symptom) => (
                      <div
                        key={symptom}
                        className={`flex flex-col gap-3 rounded-[22px] border p-4 sm:flex-row sm:items-center sm:justify-between ${
                          isDark
                            ? "border-orange-900 bg-orange-950/20"
                            : "border-orange-200 bg-orange-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-orange-500">•</span>
                          <span
                            className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}
                          >
                            {symptom}
                          </span>
                        </div>
                        <button
                          onClick={() => removeSymptom(symptom)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            isDark
                              ? "bg-red-950/50 text-red-300 hover:bg-red-950/80"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={saveSymptoms}
                  disabled={savingSymptoms}
                  className="mt-6 w-full rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {savingSymptoms ? "Saving..." : "Save Symptoms"}
                </button>
              </div>

              <div className="space-y-6">
                <div
                  className={`rounded-[28px] border p-6 md:p-8 ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <h3 className="text-xl font-black">Quick Actions</h3>
                  <div className="mt-5 grid gap-3">
                    <Link
                      to="/patientDashboardForm"
                      className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                        isDark
                          ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                          : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      Submit new health measurement
                    </Link>
                    <Link
                      to="/messages"
                      className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                        isDark
                          ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                          : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      Message your care team
                    </Link>
                    <Link
                      to="/book-appointment"
                      className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                        isDark
                          ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                          : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      Schedule or review an appointment
                    </Link>
                  </div>
                </div>

                <div
                  className={`rounded-[28px] border p-6 md:p-8 ${
                    isDark
                      ? "border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800"
                      : "border-slate-200 bg-gradient-to-br from-sky-50 to-white"
                  }`}
                >
                  <h3 className="text-xl font-black">Health Tips</h3>
                  <ul
                    className={`mt-5 space-y-3 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}
                  >
                    <li>
                      Record vital signs regularly for more accurate monitoring.
                    </li>
                    <li>
                      Stay hydrated and maintain a consistent sleep schedule.
                    </li>
                    <li>
                      Contact your doctor when you notice unusual health
                      patterns.
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      <Chat />
    </div>
  );
};

export default PatientDashboard;
