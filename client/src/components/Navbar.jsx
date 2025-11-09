import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const Navbar = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { t, i18n } = useTranslation();

  const toggleTheme = () => {
    setTheme && setTheme(theme === "dark" ? "light" : "dark");
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem("lang", lng);
    } catch {
      /* noop */
    }
  };

  const navLinks = [
    { key: "home", to: "/" },
    { key: "about", to: "/about" },
    { key: "contact", to: "/contact" },
    { key: "hospital", to: "/hospital" },
    { key: "solution", to: "/product" },
  ];

  return (
    <nav
      className={`${
        theme === "dark"
          ? "bg-gradient-to-r from-[#1e1e1e] via-[#2a1f1b] to-[#1a140f]"
          : "bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-50"
      } shadow-lg sticky top-0 z-50 transition-all duration-500`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Brand Logo */}
          <div
            onClick={() => navigate("/")}
            className="text-2xl md:text-3xl font-bold cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
          >
            HealthSync
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.key}
                to={link.to}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-semibold tracking-wide transition-all duration-300 rounded-lg ${
                    isActive
                      ? "text-blue-500"
                      : theme === "dark"
                      ? "text-gray-200 hover:text-blue-400"
                      : "text-gray-800 hover:text-blue-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {t(link.key)}
                    <span
                      className={`absolute left-0 bottom-0 h-[2px] rounded-full bg-blue-500 transition-all ${
                        isActive ? "w-full" : "w-0"
                      }`}
                    ></span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                aria-label={t("toggleTheme")}
                title={t("toggleTheme")}
                className="px-3 py-2 rounded-xl font-medium bg-gradient-to-br from-amber-400 to-amber-600 text-[#2D1B0E] hover:scale-105 shadow-md hover:shadow-amber-500/30 transition-all duration-300"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>

              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                aria-label={t("language")}
                className="px-2 py-1 rounded-md bg-transparent border border-white/20 text-sm"
              >
                <option value="en">EN</option>
                <option value="si">සි</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300"
            >
              Get Start
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-2xl text-blue-500 hover:text-blue-600 transition-all duration-300"
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <div
            className={`md:hidden overflow-hidden ${
              theme === "dark"
                ? "bg-[#1e1e1e] text-gray-200"
                : "bg-white text-gray-800"
            } shadow-inner`}
          >
            <div className="flex flex-col items-center py-4 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.key}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `w-full text-center py-2 rounded-md font-semibold transition-all ${
                      isActive
                        ? "text-blue-500 bg-blue-100/10"
                        : "hover:text-blue-500 hover:bg-blue-100/30"
                    }`
                  }
                >
                  {t(link.key)}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
