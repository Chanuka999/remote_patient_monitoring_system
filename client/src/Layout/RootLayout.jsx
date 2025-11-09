import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DEFAULTS = {
  dark: {
    "--app-bg": "#2D1B0E",
    "--app-text": "#FDE68A",
    "--card-bg": "#1F2937",
  },
  light: {
    "--app-bg": "#F8FAFC",
    "--app-text": "#0F172A",
    "--card-bg": "#FFFFFF",
  },
};

const applyThemeVars = (theme) => {
  const vars = DEFAULTS[theme] || DEFAULTS.dark;
  Object.entries(vars).forEach(([k, v]) => {
    try {
      document.documentElement.style.setProperty(k, v);
    } catch {
      /* noop */
    }
  });
};

const RootLayout = () => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "dark";
    } catch {
      /* noop */
      return "dark";
    }
  });

  useEffect(() => {
    applyThemeVars(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* noop */
    }
  }, [theme]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text)" }}
    >
      <Navbar theme={theme} setTheme={setTheme} />
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
