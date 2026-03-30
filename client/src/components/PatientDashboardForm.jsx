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
    systolic: { min: 90, max: 120, label: "Normal" },
    diastolic: { min: 60, max: 80, label: "Normal" },
    heartRate: { min: 60, max: 100, label: "Normal" },
    glucoseLevel: { min: 70, max: 100, label: "Normal" },
    temperature: { min: 36.1, max: 37.2, label: "Normal" },
    oxygenSaturation: { min: 95, max: 100, label: "Normal" },
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

  const getHealthAnalysis = (name, valueStr) => {
    if (!valueStr) return { status: "empty", condition: "Pending", riskLevel: 0, conditionLabel: "Pending", risk: "None", color: "border-gray-200 bg-gray-50", text: "text-gray-500", icon: "⚪" };
    if (errors[name]) return { status: "error", condition: "Invalid Input", riskLevel: 0, conditionLabel: "Invalid", risk: "None", color: "border-red-400 bg-red-50", text: "text-red-500", icon: "❌" };
    
    const val = parseFloat(valueStr);
    
    if (name === "systolic") {
      if (val < 90) return { status: "low", condition: "Hypotension", riskLevel: 2, conditionLabel: "Low", risk: "Moderate", color: "border-blue-400 bg-blue-50", text: "text-blue-700", icon: "📉" };
      if (val < 120) return { status: "normal", condition: "Normal", riskLevel: 0, conditionLabel: "Normal", risk: "Low", color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅" };
      if (val < 130) return { status: "elevated", condition: "Elevated BP", riskLevel: 1, conditionLabel: "Elevated", risk: "Low-Moderate", color: "border-yellow-400 bg-yellow-50", text: "text-yellow-700", icon: "⚠️" };
      if (val < 140) return { status: "high", condition: "Hypertension Stage 1", riskLevel: 2, conditionLabel: "High", risk: "Moderate", color: "border-orange-400 bg-orange-50", text: "text-orange-700", icon: "📈" };
      if (val < 180) return { status: "high", condition: "Hypertension Stage 2", riskLevel: 3, conditionLabel: "Stable High", risk: "High", color: "border-red-400 bg-red-50", text: "text-red-700", icon: "🚨" };
      return { status: "critical", condition: "Hypertensive Crisis", riskLevel: 4, conditionLabel: "Critical", risk: "Emergency", color: "border-red-600 bg-red-100", text: "text-red-900", icon: "🆘" };
    }

    if (name === "diastolic") {
      if (val < 60) return { status: "low", condition: "Hypotension", riskLevel: 2, conditionLabel: "Low", risk: "Moderate", color: "border-blue-400 bg-blue-50", text: "text-blue-700", icon: "📉" };
      if (val < 80) return { status: "normal", condition: "Normal", riskLevel: 0, conditionLabel: "Normal", risk: "Low", color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅" };
      if (val < 90) return { status: "high", condition: "Hypertension Stage 1", riskLevel: 2, conditionLabel: "High", risk: "Moderate", color: "border-orange-400 bg-orange-50", text: "text-orange-700", icon: "📈" };
      if (val < 120) return { status: "high", condition: "Hypertension Stage 2", riskLevel: 3, conditionLabel: "Stable High", risk: "High", color: "border-red-400 bg-red-50", text: "text-red-700", icon: "🚨" };
      return { status: "critical", condition: "Hypertensive Crisis", riskLevel: 4, conditionLabel: "Critical", risk: "Emergency", color: "border-red-600 bg-red-100", text: "text-red-900", icon: "🆘" };
    }

    if (name === "heartRate") {
      if (val < 60) return { status: "low", condition: "Bradycardia", riskLevel: 2, conditionLabel: "Low", risk: "Moderate", color: "border-blue-400 bg-blue-50", text: "text-blue-700", icon: "📉" };
      if (val <= 100) return { status: "normal", condition: "Normal", riskLevel: 0, conditionLabel: "Normal", risk: "Low", color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅" };
      return { status: "high", condition: "Tachycardia", riskLevel: 2, conditionLabel: "High", risk: "Moderate", color: "border-orange-400 bg-orange-50", text: "text-orange-700", icon: "📈" };
    }

    if (name === "glucoseLevel") {
      if (val < 70) return { status: "critical", condition: "Hypoglycemia", riskLevel: 4, conditionLabel: "Critical", risk: "Emergency", color: "border-red-600 bg-red-100", text: "text-red-900", icon: "🆘" };
      if (val < 100) return { status: "normal", condition: "Normal (Fasting)", riskLevel: 0, conditionLabel: "Normal", risk: "Low", color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅" };
      if (val < 126) return { status: "elevated", condition: "Prediabetes", riskLevel: 2, conditionLabel: "High", risk: "Moderate", color: "border-yellow-400 bg-yellow-50", text: "text-yellow-700", icon: "⚠️" };
      return { status: "high", condition: "Diabetes Range", riskLevel: 3, conditionLabel: "High", risk: "High", color: "border-red-400 bg-red-50", text: "text-red-700", icon: "🚨" };
    }

    if (name === "temperature") {
      if (val < 35) return { status: "critical", condition: "Hypothermia", riskLevel: 4, conditionLabel: "Critical", risk: "Emergency", color: "border-blue-600 bg-blue-100", text: "text-blue-900", icon: "🆘" };
      if (val < 36.1) return { status: "low", condition: "Low Temperature", riskLevel: 1, conditionLabel: "Low", risk: "Low-Moderate", color: "border-blue-400 bg-blue-50", text: "text-blue-700", icon: "📉" };
      if (val <= 37.2) return { status: "normal", condition: "Normal", riskLevel: 0, conditionLabel: "Normal", risk: "Low", color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅" };
      if (val <= 38.5) return { status: "high", condition: "Low Fever", riskLevel: 2, conditionLabel: "High", risk: "Moderate", color: "border-yellow-400 bg-yellow-50", text: "text-yellow-700", icon: "🌡️" };
      return { status: "high", condition: "High Fever", riskLevel: 3, conditionLabel: "High", risk: "High", color: "border-red-400 bg-red-50", text: "text-red-700", icon: "🚨" };
    }

    if (name === "oxygenSaturation") {
      if (val >= 95) return { status: "normal", condition: "Normal", riskLevel: 0, conditionLabel: "Normal", risk: "Low", color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅" };
      if (val >= 90) return { status: "low", condition: "Mild Hypoxia", riskLevel: 2, conditionLabel: "Low", risk: "Moderate", color: "border-orange-400 bg-orange-50", text: "text-orange-700", icon: "⚠️" };
      return { status: "critical", condition: "Severe Hypoxia", riskLevel: 4, conditionLabel: "Critical", risk: "Emergency", color: "border-red-600 bg-red-100", text: "text-red-900", icon: "🆘" };
    }

    return { status: "unknown", condition: "Unknown", riskLevel: 0, conditionLabel: "Unknown", risk: "Unknown", color: "border-gray-200 bg-gray-50", text: "text-gray-500", icon: "❓" };
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
    const toCheck = fieldsList.map(f => f.name);
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

      // Calculate manual risk escalation based on thresholds
      const analyzedFields = fieldsList.map(f => getHealthAnalysis(f.name, form[f.name]));
      const maxRiskLevel = Math.max(...analyzedFields.map(a => a.riskLevel));
      const elevatedFields = analyzedFields.filter(a => a.riskLevel >= 1);

      const prediction = data.body?.prediction || 0;
      
      let riskStatus = "LOW RISK ✅";
      let message = "✅ Your heart status appears normal. Continue monitoring.";
      let predictionSource = "AI Predictive Model";

      if (prediction === 1 || maxRiskLevel >= 3) {
        riskStatus = "HIGH RISK 🚨";
        message = "⚠️ High risk detected! Your metrics or AI prediction indicate potential clinical concerns. Alert sent to specialists.";
        predictionSource = prediction === 1 ? "AI Heart Model" : "Clinical Vital Sign Thresholds";
      } else if (maxRiskLevel >= 1) {
        riskStatus = "MODERATE RISK ⚠️";
        message = `⚠️ Caution: Some of your metrics are outside the normal range (${elevatedFields.map(f => f.condition).join(", ")}). Please consult a doctor.`;
        predictionSource = "Metric Deviation Analysis";
      }

      setResult({
        success: true,
        prediction: prediction,
        riskStatus: riskStatus,
        features: data.body?.features,
        message: message,
        predictionSource: predictionSource,
        isEscalated: (prediction === 0 && maxRiskLevel > 0)
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
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
      `}</style>

      <div className="max-w-5xl mx-auto animate-form-card">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-2 bg-blue-100 rounded-full mb-4">
            <span className="text-blue-700 font-semibold text-sm">
              📊Heart Disease
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
              const analysis = getHealthAnalysis(field.name, form[field.name]);

              return (
                <div
                  key={field.name}
                  className={`border-2 rounded-xl p-5 transition-all duration-300 transform hover:scale-[1.02] shadow-sm ${analysis.color}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl filter drop-shadow-sm">{field.icon}</span>
                      <div>
                        <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-tight">
                          {field.label}
                        </label>
                        <p className="text-[10px] uppercase font-bold text-gray-500 opacity-80">
                          {field.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className={`text-2xl ${analysis.status === 'critical' ? 'animate-pulse-slow' : ''}`}>{analysis.icon}</span>
                       {form[field.name] && !errors[field.name] && (
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                           analysis.riskLevel === 0 ? 'bg-green-200 text-green-800' : 
                           analysis.riskLevel <= 2 ? 'bg-yellow-200 text-yellow-800' :
                           analysis.riskLevel === 3 ? 'bg-red-200 text-red-800' : 'bg-red-600 text-white'
                         }`}>
                           {analysis.risk} Risk
                         </span>
                       )}
                    </div>
                  </div>

                  <div className="relative mb-3">
                    <input
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      type="number"
                      step={field.name === "temperature" ? "0.1" : "1"}
                      className={`w-full px-4 py-3.5 border-2 rounded-xl bg-white text-gray-900 font-bold text-lg animate-input focus:outline-none ${
                        errors[field.name]
                          ? "border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:ring-4 focus:ring-blue-100"
                      }`}
                      placeholder={field.placeholder}
                    />
                    <span className="absolute right-4 top-4 text-gray-400 font-bold text-sm">
                      {field.unit}
                    </span>
                  </div>

                  {form[field.name] && !errors[field.name] && (
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm font-black tracking-tight ${analysis.text}`}>
                          {analysis.condition}
                        </p>
                      </div>
                      <p className="text-[10px] font-medium opacity-70">
                        Goal: {normalRanges[field.name].min} - {normalRanges[field.name].max} {field.unit}
                      </p>
                    </div>
                  )}
                  
                  {errors[field.name] && (
                    <p className="text-red-600 text-xs font-bold mt-2 flex items-center">
                      <span className="mr-1">⚠️</span> {errors[field.name]}
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
              className={`mt-6 p-6 border-l-8 rounded-2xl shadow-lg animate-form-card ${
                result.error
                  ? "bg-red-50 border-red-600"
                  : result.riskStatus.includes("HIGH")
                    ? "bg-red-50 border-red-500"
                    : result.riskStatus.includes("MODERATE")
                      ? "bg-orange-50 border-orange-500"
                      : "bg-green-50 border-green-500"
              }`}
            >
              {result.error ? (
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <h4 className="text-lg font-bold text-red-700">
                      An Error Occurred
                    </h4>
                    <p className="text-red-600">{result.error}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4
                      className={`text-3xl font-black ${
                        result.riskStatus.includes("HIGH")
                          ? "text-red-700"
                          : result.riskStatus.includes("MODERATE")
                            ? "text-orange-700"
                            : "text-green-700"
                      }`}
                    >
                      {result.riskStatus}
                    </h4>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      result.riskStatus.includes("HIGH") ? "bg-red-200 text-red-800" : 
                      result.riskStatus.includes("MODERATE") ? "bg-orange-200 text-orange-800" : "bg-green-200 text-green-800"
                    }`}>
                      {result.predictionSource}
                    </div>
                  </div>

                  <p className="text-lg mb-4 text-gray-800 font-semibold">
                    {result.message}
                  </p>

                  {(result.prediction === 1 || result.riskStatus.includes("HIGH")) && (
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
                      <div className="bg-blue-50 p-3 rounded text-center">
                        <p className="text-xs text-gray-600 font-bold uppercase">Systolic</p>
                        <p className="font-black text-blue-700 text-lg">
                          {result.features?.[0]} <span className="text-[10px]">mmHg</span>
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded text-center">
                        <p className="text-xs text-gray-600 font-bold uppercase">Diastolic</p>
                        <p className="font-black text-blue-700 text-lg">
                          {result.features?.[1]} <span className="text-[10px]">mmHg</span>
                        </p>
                      </div>
                      <div className="bg-red-50 p-3 rounded text-center">
                        <p className="text-xs text-gray-600 font-bold uppercase">Heart Rate</p>
                        <p className="font-black text-red-700 text-lg">
                          {result.features?.[2]} <span className="text-[10px]">bpm</span>
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded text-center">
                        <p className="text-xs text-gray-600 font-bold uppercase">Glucose</p>
                        <p className="font-black text-orange-700 text-lg">
                          {result.features?.[3]} <span className="text-[10px]">mg/dL</span>
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded text-center">
                        <p className="text-xs text-gray-600 font-bold uppercase">Temp</p>
                        <p className="font-black text-yellow-700 text-lg">
                          {result.features?.[4]} <span className="text-[10px]">°C</span>
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded text-center">
                        <p className="text-xs text-gray-600 font-bold uppercase">SpO₂</p>
                        <p className="font-black text-green-700 text-lg">
                          {result.features?.[5]} <span className="text-[10px]">%</span>
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
