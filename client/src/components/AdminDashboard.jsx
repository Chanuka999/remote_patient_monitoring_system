import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const EMPTY_OVERVIEW = {
  counts: {
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAdmins: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalAlerts: 0,
    unreadAlerts: 0,
  },
  recentUsers: [],
  recentAppointments: [],
  recentAlerts: [],
};

const SAMPLE_USER_IMAGES = [
  "https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80",
];

const getSampleImageForUser = (user, index) => {
  const seed = String(user?._id || user?.email || index || "0");
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const imageIndex = Math.abs(hash) % SAMPLE_USER_IMAGES.length;
  return SAMPLE_USER_IMAGES[imageIndex];
};

const getRoleCardTheme = (role, isDark) => {
  if (role === "admin") {
    return isDark
      ? {
          card: "bg-gradient-to-br from-slate-800 to-indigo-950 border-indigo-700/70",
          badge: "bg-indigo-500/20 text-indigo-200 border-indigo-400/40",
          glow: "from-indigo-500/20",
          imageRing: "border-indigo-400",
        }
      : {
          card: "bg-gradient-to-br from-indigo-50 to-white border-indigo-200",
          badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
          glow: "from-indigo-300/30",
          imageRing: "border-indigo-400",
        };
  }

  if (role === "doctor") {
    return isDark
      ? {
          card: "bg-gradient-to-br from-slate-800 to-cyan-950 border-cyan-700/70",
          badge: "bg-cyan-500/20 text-cyan-200 border-cyan-400/40",
          glow: "from-cyan-500/20",
          imageRing: "border-cyan-400",
        }
      : {
          card: "bg-gradient-to-br from-cyan-50 to-white border-cyan-200",
          badge: "bg-cyan-100 text-cyan-700 border-cyan-200",
          glow: "from-cyan-300/30",
          imageRing: "border-cyan-400",
        };
  }

  return isDark
    ? {
        card: "bg-gradient-to-br from-slate-800 to-emerald-950 border-emerald-700/70",
        badge: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
        glow: "from-emerald-500/20",
        imageRing: "border-emerald-400",
      }
    : {
        card: "bg-gradient-to-br from-emerald-50 to-white border-emerald-200",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        glow: "from-emerald-300/30",
        imageRing: "border-emerald-400",
      };
};

const USER_CARD_ANIMATION_CSS = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const AdminDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const [adminUser, setAdminUser] = useState(null);
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchJson = async (url, options = {}) => {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("application/json")) {
      const raw = await response.text();
      const preview = raw.replace(/\s+/g, " ").trim().slice(0, 120);
      throw new Error(
        `Invalid server response (expected JSON). Check backend URL and server status. ${preview}`,
      );
    }

    let body;
    try {
      body = await response.json();
    } catch {
      throw new Error("Server returned invalid JSON response");
    }

    return { response, body };
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const { response: meRes, body: meJson } = await fetchJson(
        `${apiBase}/me`,
        {
          headers: authHeaders,
        },
      );
      if (!meRes.ok || !meJson?.data) {
        navigate("/login");
        return;
      }
      if (meJson.data.role !== "admin") {
        navigate("/login");
        return;
      }
      setAdminUser(meJson.data);

      const userQuery = new URLSearchParams();
      if (roleFilter !== "all") userQuery.set("role", roleFilter);
      if (search.trim()) userQuery.set("search", search.trim());

      const [overviewResult, usersResult, appointmentsResult, alertsResult] =
        await Promise.all([
          fetchJson(`${apiBase}/api/admin/overview`, { headers: authHeaders }),
          fetchJson(`${apiBase}/api/admin/users?${userQuery.toString()}`, {
            headers: authHeaders,
          }),
          fetchJson(`${apiBase}/api/admin/appointments`, {
            headers: authHeaders,
          }),
          fetchJson(`${apiBase}/api/admin/alerts`, { headers: authHeaders }),
        ]);

      const overviewRes = overviewResult.response;

      const overviewJson = overviewResult.body;
      const usersJson = usersResult.body;
      const appointmentsJson = appointmentsResult.body;
      const alertsJson = alertsResult.body;

      if (!overviewRes.ok || !overviewJson?.success) {
        throw new Error(
          overviewJson?.message || "Failed to load admin overview",
        );
      }

      setOverview(overviewJson.data || EMPTY_OVERVIEW);
      setUsers(usersJson?.data || []);
      setAppointments(appointmentsJson?.data || []);
      setAlerts(alertsJson?.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadAdminData();
    }, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, search]);

  const changeUserRole = async (userId, role) => {
    try {
      setUpdatingUserId(userId);
      const { response: res, body: json } = await fetchJson(
        `${apiBase}/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ role }),
        },
      );
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Role update failed");
      }

      setUsers((prev) =>
        prev.map((u) =>
          String(u._id) === String(userId) ? { ...u, role: json.data.role } : u,
        ),
      );

      setOverview((prev) => {
        const next = { ...prev, counts: { ...prev.counts } };
        const target = users.find((u) => String(u._id) === String(userId));
        if (!target) return prev;
        if (target.role === json.data.role) return prev;
        if (target.role === "doctor") next.counts.totalDoctors -= 1;
        if (target.role === "patient") next.counts.totalPatients -= 1;
        if (target.role === "admin") next.counts.totalAdmins -= 1;
        if (json.data.role === "doctor") next.counts.totalDoctors += 1;
        if (json.data.role === "patient") next.counts.totalPatients += 1;
        if (json.data.role === "admin") next.counts.totalAdmins += 1;
        return next;
      });
    } catch (err) {
      setError(err?.message || "Role update failed");
    } finally {
      setUpdatingUserId("");
    }
  };

  const isDark = theme === "dark";

  return (
    <>
      <style>{USER_CARD_ANIMATION_CSS}</style>
      <div
        className={`flex min-h-screen ${
          isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        <aside
          className={`w-72 p-6 fixed h-screen border-r ${
            isDark
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <h2 className="text-2xl font-bold">Admin Portal</h2>
          <p className={isDark ? "text-slate-400 mt-1" : "text-slate-500 mt-1"}>
            System Management
          </p>

          <nav className="mt-8 space-y-2">
            {[
              ["overview", "Overview"],
              ["users", "Users"],
              ["appointments", "Appointments"],
              ["alerts", "Alerts"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  activeTab === id
                    ? isDark
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-700"
                    : isDark
                      ? "hover:bg-slate-800"
                      : "hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
            <Link
              to="/login"
              className="block w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20"
            >
              Logout
            </Link>
          </nav>
        </aside>

        <main className="ml-72 flex-1 p-8">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {adminUser?.name || "Admin"}
              </h1>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                Manage users, appointments, alerts, and system health.
              </p>
            </div>
            <button
              type="button"
              onClick={loadAdminData}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className={isDark ? "text-slate-300" : "text-slate-600"}>
              Loading admin data...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div
                  className={`rounded-xl p-5 border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                    Total Users
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {overview.counts.totalUsers}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-5 border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                    Doctors
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {overview.counts.totalDoctors}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-5 border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                    Patients
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {overview.counts.totalPatients}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-5 border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                    Pending Appointments
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {overview.counts.pendingAppointments}
                  </p>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <section
                    className={`rounded-xl border p-5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                  >
                    <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
                    <div className="space-y-3">
                      {overview.recentUsers.map((u) => (
                        <div
                          key={u._id}
                          className={`rounded-lg px-3 py-2 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}
                        >
                          <p className="font-semibold">{u.name}</p>
                          <p
                            className={
                              isDark
                                ? "text-slate-400 text-sm"
                                : "text-slate-600 text-sm"
                            }
                          >
                            {u.email} • {u.role}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section
                    className={`rounded-xl border p-5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                  >
                    <h2 className="text-xl font-semibold mb-4">
                      Recent Alerts
                    </h2>
                    <div className="space-y-3 max-h-[380px] overflow-auto">
                      {overview.recentAlerts.map((a) => (
                        <div
                          key={a._id}
                          className={`rounded-lg px-3 py-2 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}
                        >
                          <p className="font-semibold">{a.message}</p>
                          <p
                            className={
                              isDark
                                ? "text-slate-400 text-sm"
                                : "text-slate-600 text-sm"
                            }
                          >
                            {a.patientId?.name ||
                              a.patientSnapshot?.name ||
                              "Unknown patient"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "users" && (
                <section
                  className={`rounded-xl border p-5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div className="flex flex-wrap gap-3 mb-4">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className={`px-3 py-2 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"}`}
                    >
                      <option value="all">All roles</option>
                      <option value="admin">Admin</option>
                      <option value="doctor">Doctor</option>
                      <option value="patient">Patient</option>
                    </select>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name/email/number"
                      className={`px-3 py-2 rounded-lg border min-w-[240px] ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {users.map((u, index) =>
                      (() => {
                        const roleTheme = getRoleCardTheme(u.role, isDark);
                        return (
                          <div
                            key={u._id}
                            style={{
                              animation: "fadeInUp 420ms ease-out",
                              animationDelay: `${index * 55}ms`,
                              animationFillMode: "both",
                            }}
                            className={`relative overflow-hidden rounded-2xl border p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${roleTheme.card}`}
                          >
                            <div
                              className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${roleTheme.glow} to-transparent blur-2xl pointer-events-none`}
                            ></div>

                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span
                                className={`text-[11px] uppercase tracking-wide font-semibold px-2 py-1 rounded-full border ${roleTheme.badge}`}
                              >
                                {u.role}
                              </span>
                              <span
                                className={`text-xs font-semibold ${
                                  updatingUserId === u._id
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {updatingUserId === u._id
                                  ? "Updating..."
                                  : "Ready"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={getSampleImageForUser(u, index)}
                                alt={u.name || "User"}
                                className={`w-14 h-14 rounded-full object-cover border-2 shadow-sm ${roleTheme.imageRing}`}
                              />
                              <div className="min-w-0">
                                <p className="font-semibold truncate">
                                  {u.name}
                                </p>
                                <p
                                  className={`text-xs truncate ${
                                    isDark ? "text-slate-400" : "text-slate-600"
                                  }`}
                                  title={u.email}
                                >
                                  {u.email}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm mb-3">
                              <p
                                className={
                                  isDark ? "text-slate-300" : "text-slate-700"
                                }
                              >
                                <span className="font-medium">Phone:</span>{" "}
                                {u.number || "-"}
                              </p>
                              <p
                                className={
                                  isDark ? "text-slate-300" : "text-slate-700"
                                }
                              >
                                <span className="font-medium">Joined:</span>{" "}
                                {u.createdAt
                                  ? new Date(u.createdAt).toLocaleDateString()
                                  : "-"}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <select
                                value={u.role}
                                onChange={(e) =>
                                  changeUserRole(u._id, e.target.value)
                                }
                                disabled={
                                  updatingUserId === u._id ||
                                  String(u._id) === String(adminUser?.id)
                                }
                                className={`px-2 py-1 rounded border text-sm ${
                                  isDark
                                    ? "bg-slate-900 border-slate-600"
                                    : "bg-white border-slate-300"
                                }`}
                              >
                                <option value="admin">admin</option>
                                <option value="doctor">doctor</option>
                                <option value="patient">patient</option>
                              </select>

                              <span
                                className={
                                  isDark
                                    ? "text-xs text-slate-400"
                                    : "text-xs text-slate-500"
                                }
                              >
                                role modify
                              </span>
                            </div>
                          </div>
                        );
                      })(),
                    )}
                  </div>
                </section>
              )}

              {activeTab === "appointments" && (
                <section
                  className={`rounded-xl border p-5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <h2 className="text-xl font-semibold mb-4">
                    All Appointments
                  </h2>
                  <div className="space-y-3 max-h-[520px] overflow-auto">
                    {appointments.map((a) => (
                      <div
                        key={a._id}
                        className={`rounded-lg p-3 border ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                      >
                        <p className="font-semibold">
                          {a.patientId?.name ||
                            a.patientSnapshot?.name ||
                            "Unknown patient"}{" "}
                          with{" "}
                          {a.doctorId?.name ||
                            a.doctorSnapshot?.name ||
                            "Unknown doctor"}
                        </p>
                        <p
                          className={
                            isDark
                              ? "text-slate-400 text-sm"
                              : "text-slate-600 text-sm"
                          }
                        >
                          {new Date(
                            a.appointmentDate || a.createdAt,
                          ).toLocaleString()}{" "}
                          • {a.status}
                        </p>
                        <p
                          className={
                            isDark
                              ? "text-slate-300 text-sm mt-1"
                              : "text-slate-700 text-sm mt-1"
                          }
                        >
                          {a.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === "alerts" && (
                <section
                  className={`rounded-xl border p-5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <h2 className="text-xl font-semibold mb-4">All Alerts</h2>
                  <div className="space-y-3 max-h-[520px] overflow-auto">
                    {alerts.map((a) => (
                      <div
                        key={a._id}
                        className={`rounded-lg p-3 border ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                      >
                        <p className="font-semibold">{a.message}</p>
                        <p
                          className={
                            isDark
                              ? "text-slate-400 text-sm"
                              : "text-slate-600 text-sm"
                          }
                        >
                          Patient:{" "}
                          {a.patientId?.name ||
                            a.patientSnapshot?.name ||
                            "Unknown"}{" "}
                          • Doctor: {a.doctorId?.name || "Unknown"}
                        </p>
                        <p
                          className={
                            isDark
                              ? "text-slate-300 text-sm mt-1"
                              : "text-slate-700 text-sm mt-1"
                          }
                        >
                          Risk: {a.prediction === 1 ? "High" : "Low"} •{" "}
                          {a.read ? "Read" : "Unread"}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
