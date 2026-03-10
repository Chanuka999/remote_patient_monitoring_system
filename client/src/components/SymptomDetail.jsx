import React from "react";
import { useParams, Link } from "react-router-dom";

const DETAILS = {
  heartDisease: {
    title: "Heart Disease",
    icon: "❤️",
    body: "Heart disease refers to several types of heart conditions. The most common is coronary artery disease which can lead to chest pain, heart attack, and other problems.",
    color: "red",
    bgColor: "from-red-50 to-red-100",
    borderColor: "border-red-200",
    buttonColor: "bg-red-600 hover:bg-red-700",
    accentColor: "text-red-700",
    dataLink: "/patientDashboardForm",
    dataLinkText: "Enter Heart Data",
    facts: [
      { label: "Prevalence", value: "Affects ~1 in 5 Americans" },
      { label: "Typical care", value: "Primary care / Cardiologist" },
      { label: "Risk factors", value: "Age, smoking, high BP" },
    ],
  },
  diabetes: {
    title: "Diabetes",
    icon: "🍬",
    body: "Diabetes is a chronic condition that affects how your body turns food into energy. It can cause high blood sugar and long-term complications if unmanaged.",
    color: "blue",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    accentColor: "text-blue-700",
    dataLink: "/Diabetics",
    dataLinkText: "Enter Diabetes Data",
    facts: [
      { label: "Prevalence", value: "Affects ~37.3 million" },
      { label: "Typical care", value: "Primary care / Endocrinologist" },
      { label: "Risk factors", value: "Family history, obesity" },
    ],
  },
  hypertension: {
    title: "Hypertension (High Blood Pressure)",
    icon: "🩸",
    body: "Hypertension is when blood pressure is consistently too high. It increases risk of heart disease, stroke, and other health issues.",
    color: "orange",
    bgColor: "from-orange-50 to-orange-100",
    borderColor: "border-orange-200",
    buttonColor: "bg-orange-600 hover:bg-orange-700",
    accentColor: "text-orange-700",
    dataLink: "/hypertension",
    dataLinkText: "Enter BP Data",
    facts: [
      { label: "Prevalence", value: "Affects ~1 in 3 adults" },
      { label: "Typical care", value: "Primary care / Specialist" },
      { label: "Risk factors", value: "Age, salt, stress" },
    ],
  },
};

const SymptomDetail = () => {
  const { id } = useParams();
  const info = DETAILS[id];

  if (!info) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Unknown Condition
          </h2>
          <p className="mt-3 text-gray-600">
            No information available for this condition.
          </p>
          <Link
            to="/Sympthoms"
            className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            ← Back to Conditions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8 flex items-center gap-2">
          <Link to="/" className="text-blue-600 hover:underline">
            🏠 Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link to="/Sympthoms" className="text-blue-600 hover:underline">
            🩺 Symptoms
          </Link>
          <span className="text-gray-400">/</span>
          <span className={`font-semibold ${info.accentColor}`}>
            {info.icon} {info.title}
          </span>
        </nav>

        {/* Hero Header */}
        <div
          className={`bg-gradient-to-br ${info.bgColor} ${info.borderColor} border-2 rounded-2xl p-8 mb-8 shadow-lg`}
        >
          <div className="flex items-start gap-4 mb-6">
            <span className="text-6xl">{info.icon}</span>
            <div>
              <h1 className={`text-4xl font-bold ${info.accentColor} mb-3`}>
                {info.title}
              </h1>
              <p className="text-gray-700 text-lg leading-relaxed max-w-2xl">
                {info.body}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to={info.dataLink}
              className={`px-6 py-3 ${info.buttonColor} text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105`}
            >
              📊 {info.dataLinkText}
            </Link>
            <Link
              to="/PatientDashboard"
              className={`px-6 py-3 bg-white ${info.borderColor} border-2 ${info.accentColor} rounded-lg font-bold hover:bg-gray-50 transition-all transform hover:scale-105`}
            >
              📈 Open Dashboard
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
              <div className={`flex items-center gap-3 mb-4`}>
                <span className="text-3xl">ℹ️</span>
                <h3 className="text-2xl font-bold text-gray-900">
                  About {info.title}
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {info.body}
              </p>
            </div>

            {/* Self-Care Tips */}
            <div
              className={`bg-gradient-to-br ${info.bgColor} ${info.borderColor} border-2 rounded-xl p-8 shadow-md`}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">💡</span>
                <h4 className={`text-2xl font-bold ${info.accentColor}`}>
                  Self-Care & Tips
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3 items-start p-3 bg-white/50 rounded-lg">
                  <span className="text-xl mt-1">✓</span>
                  <span className="text-gray-700">
                    Keep a healthy diet and watch your weight.
                  </span>
                </div>
                <div className="flex gap-3 items-start p-3 bg-white/50 rounded-lg">
                  <span className="text-xl mt-1">✓</span>
                  <span className="text-gray-700">
                    Stay physically active if your doctor approves.
                  </span>
                </div>
                <div className="flex gap-3 items-start p-3 bg-white/50 rounded-lg">
                  <span className="text-xl mt-1">✓</span>
                  <span className="text-gray-700">
                    Follow medication instructions given by your provider.
                  </span>
                </div>
                <div className="flex gap-3 items-start p-3 bg-white/50 rounded-lg">
                  <span className="text-xl mt-1">✓</span>
                  <span className="text-gray-700">
                    Seek immediate care for severe or worsening symptoms.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200 sticky top-20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📋</span>
                <h4 className="text-2xl font-bold text-gray-900">
                  Quick Facts
                </h4>
              </div>
              <div className="space-y-4">
                {info.facts.map((fact, idx) => (
                  <div
                    key={idx}
                    className={`${info.bgColor} ${info.borderColor} border rounded-lg p-4`}
                  >
                    <dt className={`font-bold ${info.accentColor} text-sm`}>
                      {fact.label}
                    </dt>
                    <dd className="text-gray-700 mt-1 text-sm">{fact.value}</dd>
                  </div>
                ))}
              </div>

              {/* Back Link */}
              <Link
                to="/Sympthoms"
                className={`mt-6 block w-full text-center py-3 ${info.buttonColor} text-white rounded-lg font-bold hover:shadow-lg transition-all`}
              >
                ← Back to Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomDetail;
