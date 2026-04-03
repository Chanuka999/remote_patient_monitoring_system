import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const SectionSidebar = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const displayName = currentUser?.name?.trim() || "My Account";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const dashboardPath =
    currentUser?.role === "doctor"
      ? "/doctorDashboard"
      : currentUser?.role === "admin"
        ? "/adminDashboard"
        : "/patientDashboard";

  const links = [
    { label: "Dashboard", to: dashboardPath, icon: "🏠" },
    { label: "Symptoms", to: "/Sympthoms", icon: "🩺" },
    { label: "Messages", to: "/messages", icon: "💬" },
    { label: "Appointments", to: "/appointment", icon: "🗓️" },
    { label: "Settings", to: "/settings", icon: "⚙️" },
  ];

  const isDark = theme === "dark";

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      // ignore storage errors
    }
    navigate("/login");
  };

  return (
    <aside
      className={`sticky top-3 h-fit overflow-hidden rounded-[32px] border shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-md lg:top-4 lg:-translate-x-2 ${
        isDark
          ? "border-slate-800 bg-[linear-gradient(180deg,#0f172a_0%,#111827_52%,#0b1220_100%)]"
          : "border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_52%,#eef6ff_100%)]"
      }`}
    >
      <div className="p-5 lg:p-6">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-sky-400">
            {currentUser?.role === "doctor"
              ? "Doctor Portal"
              : "Patient Portal"}
          </p>
          <p
            className={`mt-4 max-w-xs text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-600"}`}
          >
            Track daily health, manage symptoms, and stay connected with your
            care team.
          </p>
        </div>

        <div
          className={`mb-8 rounded-[26px] p-5 ${
            isDark
              ? "bg-white/5 ring-1 ring-white/10"
              : "bg-white/70 ring-1 ring-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-xl font-black text-white shadow-lg">
              {initials || "U"}
            </div>
            <div className="min-w-0">
              <h3
                className={`truncate text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {displayName}
              </h3>
              <p
                className={`truncate text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {currentUser?.email || "Logged-in user"}
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-3">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-[22px] px-4 py-4 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-sky-500 text-white shadow-[0_14px_30px_rgba(14,165,233,0.28)]"
                    : isDark
                      ? "text-slate-200 hover:bg-white/5 hover:text-white"
                      : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                }`
              }
            >
              <span className="text-lg leading-none">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          className={`mt-8 rounded-[24px] p-5 ${
            isDark
              ? "bg-white/5 ring-1 ring-white/10"
              : "bg-slate-100/80 ring-1 ring-slate-200"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sky-400">
            Quick Tip
          </p>
          <p
            className={`mt-3 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            Log symptoms as soon as they appear so your care team sees the most
            useful context.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className={`mt-8 w-full rounded-[22px] px-4 py-4 text-sm font-semibold transition-all duration-200 ${
            isDark
              ? "bg-red-950/35 text-red-300 hover:bg-red-950/55"
              : "bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default SectionSidebar;
