import React, { useState } from "react";

const PatientDashboardForm = () => {
  const [form, setForm] = useState({
    systolic: "",
    diastolic: "",
    heartRate: "",
    glucoseLevel: "",
    temperature: "",
    oxygenSaturation: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const RANGES = {
    systolic: { min: 50, max: 250 },
    diastolic: { min: 30, max: 150 },
    heartRate: { min: 20, max: 220 },
    glucoseLevel: { min: 20, max: 600 },
    temperature: { min: 30, max: 45 },
    oxygenSaturation: { min: 50, max: 100 },
  };

  const normalRanges = {
    systolic: { min: 90, max: 120 },
    diastolic: { min: 60, max: 80 },
    heartRate: { min: 60, max: 100 },
    glucoseLevel: { min: 70, max: 100 },
    temperature: { min: 36.5, max: 37.5 },
    oxygenSaturation: { min: 95, max: 100 },
  };

  const fieldsList = [
    {
      name: "systolic",
      label: "Systolic (Blood Pressure)",
      unit: "mmHg",
      placeholder: "e.g., 120",
      icon: "🩸",
      description: "Upper blood pressure reading",
    },
    {
      name: "diastolic",
      label: "Diastolic (Blood Pressure)",
      unit: "mmHg",
      placeholder: "e.g., 80",
      icon: "🩸",
      description: "Lower blood pressure reading",
    },
    {
      name: "heartRate",
      label: "Heart Rate",
      unit: "bpm",
      placeholder: "e.g., 70",
      icon: "❤️",
      description: "Beats per minute",
    },
    {
      name: "glucoseLevel",
      label: "Glucose Level",
      unit: "mg/dL",
      placeholder: "e.g., 100",
      icon: "🍬",
      description: "Blood sugar level",
    },
    {
      name: "temperature",
      label: "Temperature",
      unit: "°C",
      placeholder: "e.g., 36.6",
      icon: "🌡️",
      description: "Body temperature",
    },
    {
      name: "oxygenSaturation",
      label: "Oxygen Saturation (SpO₂)",
      unit: "%",
      placeholder: "e.g., 98",
      icon: "💨",
      description: "Blood oxygen level",
    },
  ];

  const getFieldStatus = (fieldName) => {
    const value = parseFloat(form[fieldName]);
    const range = normalRanges[fieldName];

    if (!form[fieldName]) return "empty";
    if (errors[fieldName]) return "error";
    if (value >= range.min && value <= range.max) return "normal";
    if (value < range.min) return "low";
    return "high";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "normal":
        return "border-green-400 bg-green-50";
      case "low":
      case "high":
        return "border-orange-400 bg-orange-50";
      case "error":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "normal":
        return "✅";
      case "low":
        return "📉";
      case "high":
        return "📈";
      case "error":
        return "❌";
      default:
        return "❓";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    setErrors((prev) => {
      const next = { ...prev };
      const num = Number(value);
      if (value === "" || isNaN(num))
        next[name] = "Please enter a valid number";
      else if (
        RANGES[name] &&
        (num < RANGES[name].min || num > RANGES[name].max)
      )
        next[name] =
          `Value must be between ${RANGES[name].min} and ${RANGES[name].max}`;
      else delete next[name];
      return next;
    });
  };

  const handleSubmit = async () => {
    const toCheck = [
      "systolic",
      "diastolic",
      "heartRate",
      "glucoseLevel",
      "temperature",
      "oxygenSaturation",
    ];
    const nextErrors = {};
    toCheck.forEach((k) => {
      const v = form[k];
      const num = Number(v);
      if (v === "" || isNaN(num)) nextErrors[k] = "Please enter a valid number";
      else if (RANGES[k] && (num < RANGES[k].min || num > RANGES[k].max))
        nextErrors[k] =
          `Value must be between ${RANGES[k].min} and ${RANGES[k].max}`;
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setLoading(true);
    setResult(null);

    let patientId = null;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      patientId = user.id || user._id || null;
    } catch {
      console.warn("Could not get patient ID from localStorage");
    }

    const body = {
      systolic: parseFloat(form.systolic) || 0,
      diastolic: parseFloat(form.diastolic) || 0,
      heartRate: parseFloat(form.heartRate) || 0,
      glucoseLevel: parseFloat(form.glucoseLevel) || 0,
      temperature: parseFloat(form.temperature) || 0,
      oxygenSaturation: parseFloat(form.oxygenSaturation) || 0,
      patientId: patientId,
    };

    try {
      const apiBase = import.meta.env.VITE_BACKEND_URL || "";
      const bodyWithSymptom = {
        ...body,
        symptoms: ["heart_disease"],
      };

      await fetch(`${apiBase}/api/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const res = await fetch(`${apiBase}/api/predict/heart_from_form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyWithSymptom),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));

      const prediction = data.body?.prediction || 0;
      const riskStatus = prediction === 1 ? "HIGH RISK ⚠️" : "LOW RISK ✅";
      const message =
        prediction === 1
          ? "⚠️ High risk detected! Alert sent to specialist cardiologists."
          : "✅ Your heart status appears normal. Continue monitoring.";

      setResult({
        success: true,
        prediction: prediction,
        riskStatus: riskStatus,
        features: data.body?.features,
        message: message,
      });
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    Object.keys(errors).length === 0 &&
    [
      "systolic",
      "diastolic",
      "heartRate",
      "glucoseLevel",
      "temperature",
      "oxygenSaturation",
    ].every((k) => form[k] !== "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-form-card {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-input {
          transition: all 0.3s ease;
        }
        .animate-input:focus {
          transform: scale(1.01);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        .field-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
      `}</style>

      <div className="max-w-5xl mx-auto animate-form-card">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-2 bg-blue-100 rounded-full mb-4">
            <span className="text-blue-700 font-semibold text-sm">
              📊 Health Data Entry
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Record Your Health Metrics
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Enter your vital signs for accurate health monitoring and
            personalized recommendations
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <span className="text-2xl">🎯</span>
            <p className="text-sm font-semibold text-blue-900 mt-2">
              Regular Monitoring
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Track your health patterns over time
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <span className="text-2xl">📱</span>
            <p className="text-sm font-semibold text-green-900 mt-2">
              Quick Entry
            </p>
            <p className="text-xs text-green-700 mt-1">
              Fast and easy health data input
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <span className="text-2xl">🔔</span>
            <p className="text-sm font-semibold text-purple-900 mt-2">
              Smart Alerts
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Get notified of health changes
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-xl rounded-2xl p-10">
          <div className="field-grid mb-8">
            {fieldsList.map((field) => {
              const status = getFieldStatus(field.name);
              const statusColor = getStatusColor(status);
              const statusIcon = getStatusIcon(status);

              return (
                <div
                  key={field.name}
                  className={`border-2 rounded-lg p-6 transition ${statusColor}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl">{field.icon}</span>
                      <div>
                        <label className="block text-sm font-bold text-gray-800">
                          {field.label}
                        </label>
                        <p className="text-xs text-gray-500">
                          {field.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl">{statusIcon}</span>
                  </div>

                  <div className="relative mb-2">
                    <input
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      type="number"
                      step={field.name === "temperature" ? "0.1" : "1"}
                      className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-900 animate-input focus:outline-none ${
                        status === "error"
                          ? "border-red-500 focus:ring-2 focus:ring-red-300"
                          : "border-gray-300 focus:ring-2 focus:ring-blue-300"
                      }`}
                      placeholder={field.placeholder}
                    />
                    <span className="absolute right-4 top-3 text-gray-600 font-semibold text-sm">
                      {field.unit}
                    </span>
                  </div>

                  {status === "normal" && form[field.name] && (
                    <p className="text-xs text-green-600 font-semibold">
                      ✓ Within normal range ({normalRanges[field.name].min} -{" "}
                      {normalRanges[field.name].max})
                    </p>
                  )}
                  {status === "low" && form[field.name] && (
                    <p className="text-xs text-orange-600 font-semibold">
                      Below normal range ({normalRanges[field.name].min} -{" "}
                      {normalRanges[field.name].max})
                    </p>
                  )}
                  {status === "high" && form[field.name] && (
                    <p className="text-xs text-orange-600 font-semibold">
                      Above normal range ({normalRanges[field.name].min} -{" "}
                      {normalRanges[field.name].max})
                    </p>
                  )}
                  {errors[field.name] && (
                    <p className="text-red-600 text-xs font-semibold mt-1">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="mb-6">
            {!isValid && !loading && Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
                <p className="text-red-700 font-semibold text-sm">
                  ⚠️ Please fix highlighted fields before submitting
                </p>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className={`w-full py-4 text-white font-bold rounded-xl text-lg transition transform ${
                !isValid || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Processing...</span>
                </span>
              ) : (
                <span>✅ Submit Health Data</span>
              )}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div
              className={`mt-6 p-6 border-l-4 rounded-lg animate-form-card ${
                result.error
                  ? "bg-red-50 border-red-600"
                  : result.prediction === 1
                    ? "bg-red-50 border-red-600"
                    : "bg-green-50 border-green-600"
              }`}
            >
              {result.error ? (
                <div>
                  <h4 className="text-lg font-bold text-red-700 mb-2">
                    ⚠️ An Error Occurred
                  </h4>
                  <p className="text-red-600">{result.error}</p>
                </div>
              ) : (
                <div>
                  <h4
                    className={`text-2xl font-bold mb-4 ${
                      result.prediction === 1
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    {result.riskStatus}
                  </h4>
                  <p className="text-lg mb-4 text-gray-800 font-semibold">
                    {result.message}
                  </p>

                  {result.prediction === 1 && (
                    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 mb-4">
                      <p className="text-red-800 font-bold">
                        📧 Alert has been sent to specialist cardiologists
                      </p>
                      <p className="text-red-700 text-sm mt-2">
                        A medical specialist will review your data shortly
                      </p>
                    </div>
                  )}

                  <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                    <p className="font-bold text-gray-800 mb-3">
                      📋 Your Recorded Measurements:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Systolic</p>
                        <p className="font-bold text-blue-700">
                          {result.features?.[0]} mmHg
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Diastolic</p>
                        <p className="font-bold text-blue-700">
                          {result.features?.[1]} mmHg
                        </p>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Heart Rate</p>
                        <p className="font-bold text-red-700">
                          {result.features?.[2]} bpm
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Glucose</p>
                        <p className="font-bold text-orange-700">
                          {result.features?.[3]} mg/dL
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Temperature</p>
                        <p className="font-bold text-yellow-700">
                          {result.features?.[4]} °C
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm text-gray-600">SpO₂</p>
                        <p className="font-bold text-green-700">
                          {result.features?.[5]} %
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            📌 Please enter all fields accurately for the best health assessment
          </p>
          <p className="mt-2">
            💡 Tip: Record measurements at the same time daily for consistency
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardForm;
