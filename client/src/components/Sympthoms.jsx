import React from "react";
import { Link } from "react-router-dom";

const AVAILABLE = [
  {
    id: "heartDisease",
    label: "Heart Disease",
    icon: "❤️",
    color: "from-red-50 to-red-100",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    hoverColor: "hover:bg-red-100",
  },
  {
    id: "diabetes",
    label: "Diabetes",
    icon: "🍬",
    color: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    hoverColor: "hover:bg-blue-100",
  },
  {
    id: "hypertension",
    label: "Hypertension",
    icon: "🩸",
    color: "from-orange-50 to-orange-100",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    hoverColor: "hover:bg-orange-100",
  },
];

const Sympthoms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-2 bg-blue-100 rounded-full mb-4">
            <span className="text-blue-700 font-semibold text-sm">
              🏥 Health Assessment
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Health Conditions
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Select one of 3 conditions below to enter your health data and get
            an instant risk assessment. If risk is detected, specialists will be
            automatically alerted.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {AVAILABLE.map((s) => (
            <Link
              to={`/Sympthoms/${s.id}`}
              key={s.id}
              className={`bg-gradient-to-br ${s.color} ${s.borderColor} border-2 rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group`}
            >
              {/* Icon */}
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>

              {/* Title */}
              <h3 className={`text-2xl font-bold ${s.textColor} mb-2`}>
                {s.label}
              </h3>

              {/* Description */}
              <p className={`${s.textColor} text-sm opacity-90 mb-4`}>
                Tap to view causes, symptoms, and simple self-care tips.
              </p>

              {/* Arrow */}
              <div
                className={`${s.textColor} font-bold flex items-center gap-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}
              >
                <span>Learn More</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Why Assessment?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Early Detection
                </h3>
                <p className="text-gray-600 text-sm">
                  Identify health risks before they become serious conditions
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">🩺</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Expert Analysis
                </h3>
                <p className="text-gray-600 text-sm">
                  Get instant AI-powered health insights and risk assessments
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">🔔</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Specialist Alert
                </h3>
                <p className="text-gray-600 text-sm">
                  High-risk cases are automatically sent to specialists
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sympthoms;
