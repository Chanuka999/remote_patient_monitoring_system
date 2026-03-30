import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext";

const HIDE_NAV_PATHS = [
  "/patientDashboard",
  "/doctorDashboard",
  "/adminDashboard",
  "/hypertension",
  "/Diabetics",
  "/Sympthoms",
  "/SymptomForm",
  "/patientDashboardForm",
];

const DEFAULTS = {
  dark: {
    "--app-bg": "#0F172A",
    "--app-text": "#F8FAFC",
    "--card-bg": "#1E293B",
  },
  light: {
    "--app-bg": "#F8FAFC",
    "--app-text": "#0F172A",
    "--card-bg": "#FFFFFF",
  },
};

const applyThemeVars = (theme) => {
  const vars = DEFAULTS[theme] || DEFAULTS.light;
  Object.entries(vars).forEach(([k, v]) => {
    try {
      document.documentElement.style.setProperty(k, v);
    } catch {
      /* noop */
    }
  });
};

const RootLayout = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const hideNav = HIDE_NAV_PATHS.includes(location.pathname);

  useEffect(() => {
    applyThemeVars(theme);
  }, [theme]);

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        theme === "dark"
          ? "bg-slate-900 text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      {!hideNav && <Navbar />}
      <main className="w-full">
        <div className="max-w-full mx-auto px-0 sm:px-0 lg:px-0">
          <Outlet />
        </div>
      </main>
      {!hideNav && <Footer />}
    </div>
  );
};

export default RootLayout;
