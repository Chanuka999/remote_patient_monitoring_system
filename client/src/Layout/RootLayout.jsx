import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext";

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
      <Navbar />
      <main className="w-full">
        <div className="max-w-full mx-auto px-0 sm:px-0 lg:px-0">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
