import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return Boolean(localStorage.getItem("token"));
    } catch {
      return false;
    }
  });
  const [scrolled, setScrolled] = useState(false);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem("lang", lng);
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    const syncAuth = () => {
      try {
        setIsAuthenticated(Boolean(localStorage.getItem("token")));
      } catch {
        setIsAuthenticated(false);
      }
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      /* noop */
    }
    setIsAuthenticated(false);
    setIsOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { key: "home", to: "/", icon: "🏠" },
    { key: "about", to: "/about", icon: "ℹ️" },
    { key: "contact", to: "/contact", icon: "📞" },
    { key: "hospital", to: "/hospital", icon: "🏥" },
    { key: "doctor", label: "Doctor", to: "/doctor", icon: "👨‍⚕️" },
  ];

  return (
    <nav
      className={`${
        theme === "dark"
          ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-r from-white via-blue-50 to-white"
      } ${scrolled ? "shadow-xl" : "shadow-lg"} sticky top-0 z-50 transition-all duration-300 border-b ${
        theme === "dark" ? "border-slate-700" : "border-blue-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl md:text-2xl">❤️</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                HealthSync
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Health Monitoring</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.key}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                      : theme === "dark"
                        ? "text-gray-300 hover:bg-slate-700 hover:text-blue-400"
                        : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label || t(link.key)}</span>
                    {isActive && (
                      <span className="ml-auto inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
              className={`p-2 md:p-2.5 rounded-lg transition-all duration-300 ${
                theme === "dark"
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  : "bg-amber-100 text-amber-600 hover:bg-amber-200"
              }`}
            >
              <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
            </button>

            {/* Language Selector */}
            <div className="hidden sm:block">
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                aria-label="Select language"
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-slate-700 border-slate-600 text-gray-200 hover:border-blue-500"
                    : "bg-white border-gray-200 text-gray-800 hover:border-blue-500"
                }`}
              >
                <option value="en">EN</option>
                <option value="si">සි</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>

            {/* Auth Button */}
            <button
              onClick={
                isAuthenticated ? handleLogout : () => navigate("/login")
              }
              className={`px-4 md:px-6 py-2 md:py-2.5 font-semibold rounded-lg transition-all duration-300 text-sm md:text-base flex items-center gap-2 ${
                isAuthenticated
                  ? `${
                      theme === "dark"
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/40"
              }`}
            >
              <span className="text-lg">{isAuthenticated ? "🚪" : "✨"}</span>
              {isAuthenticated ? "Logout" : "Get Start"}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-slate-700"
                  : "text-gray-700 hover:bg-blue-100"
              }`}
            >
              <span className="text-2xl">{isOpen ? <FiX /> : <FiMenu />}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <div
            className={`lg:hidden border-t transition-all duration-300 ${
              theme === "dark"
                ? "bg-slate-800 border-slate-700"
                : "bg-blue-50/50 border-blue-100"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col gap-2 mb-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.key}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                        isActive
                          ? `${
                              theme === "dark"
                                ? "bg-blue-500/30 text-blue-400"
                                : "bg-blue-200 text-blue-600"
                            }`
                          : `${
                              theme === "dark"
                                ? "text-gray-300 hover:bg-slate-700 hover:text-blue-400"
                                : "text-gray-700 hover:bg-blue-100"
                            }`
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="text-xl">{link.icon}</span>
                        <span className="flex-1">{link.label || t(link.key)}</span>
                        {isActive && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
              {/* Mobile Language & Auth */}
              <div className="border-t pt-4 space-y-2 flex sm:hidden flex-col">
                <select
                  value={i18n.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  aria-label="Select language"
                  className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                    theme === "dark"
                      ? "bg-slate-700 border-slate-600 text-gray-200"
                      : "bg-white border-gray-200 text-gray-800"
                  }`}
                >
                  <option value="en">🌍 English</option>
                  <option value="si">🇱🇰 සිංහල</option>
                  <option value="ta">🇮🇳 தமிழ்</option>
                </select>
              </div>

              <button
                onClick={() => {
                  if (isAuthenticated) {
                    handleLogout();
                  } else {
                    setIsOpen(false);
                    navigate("/login");
                  }
                }}
                className={`w-full px-4 py-2 mt-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  isAuthenticated
                    ? `${
                        theme === "dark"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-red-100 text-red-600"
                      }`
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                }`}
              >
                <span className="text-lg">{isAuthenticated ? "🚪" : "✨"}</span>
                {isAuthenticated ? "Logout" : "Get Start"}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
