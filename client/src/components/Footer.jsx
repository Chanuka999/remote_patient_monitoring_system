import React from "react";
import { useTheme } from "../context/ThemeContext";

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer
      className={`py-8 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-slate-900 border-t border-slate-700"
          : "bg-gray-500"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === "dark" ? "text-blue-400" : "text-gray-900"
              }`}
            >
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  About company
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  Hospital Software
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  Clinic Software
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === "dark" ? "text-blue-400" : "text-gray-900"
              }`}
            >
              Top Features
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  Success Stories
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  OPD & IPD Management
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  Doctor Portal
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === "dark" ? "text-blue-400" : "text-gray-900"
              }`}
            >
              Solutions
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  Patient Portal
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  EHR/EMR Software
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  Website for Hospital
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === "dark" ? "text-blue-400" : "text-gray-900"
              }`}
            >
              Get in Touch
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="tel:+177777777"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  +1 777-777-777
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@patientmanagement.com"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  info@patientmanagement.com
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`hover:text-blue-500 transition ${
                    theme === "dark" ? "text-gray-300" : "text-gray-300"
                  }`}
                >
                  Got a question? Need a quote?
                </a>
              </li>
            </ul>
          </div>
        </div>
        <hr
          className={`mt-8 ${
            theme === "dark" ? "border-slate-700" : "border-gray-200"
          }`}
        />
      </div>
    </footer>
  );
};

export default Footer;
