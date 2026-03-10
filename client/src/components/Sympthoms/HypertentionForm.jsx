import React, { useState } from "react";

const HypertentionForm = () => {
  const [form, setForm] = useState({
    age: "",
    saltIntake: "",
    stressScore: "",
    bpHistory: "",
    sleepDuration: "",
    bmi: "",
    medication: "",
    familyHistory: "",
    exerciseLevel: "",
    smokingStatus: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const RANGES = {
    age: { min: 0, max: 120 },
    saltIntake: { min: 0, max: 200 },
    stressScore: { min: 0, max: 100 },
    sleepDuration: { min: 0, max: 24 },
    bmi: { min: 10, max: 80 },
  };

  const numericFields = new Set([
    "age",
    "saltIntake",
    "stressScore",
    "sleepDuration",
    "bmi",
  ]);

  const fieldsList = [
    {
      name: "age",
      label: "Age",
      unit: "years",
      placeholder: "e.g., 39",
      icon: "👤",
      description: "Your age in years",
      isNumeric: true,
    },
    {
      name: "saltIntake",
      label: "Salt Intake",
      unit: "g/day",
      placeholder: "e.g., 8.9",
      icon: "🧂",
      description: "Daily salt consumption",
      isNumeric: true,
    },
    {
      name: "stressScore",
      label: "Stress Score",
      unit: "score",
      placeholder: "e.g., 50",
      icon: "😰",
      description: "Mental stress level (0-100)",
      isNumeric: true,
    },
    {
      name: "sleepDuration",
      label: "Sleep Duration",
      unit: "hours",
      placeholder: "e.g., 7.6",
      icon: "😴",
      description: "Average sleep per night",
      isNumeric: true,
    },
    {
      name: "bmi",
      label: "BMI",
      unit: "kg/m²",
      placeholder: "e.g., 27.6",
      icon: "⚖️",
      description: "Body Mass Index",
      isNumeric: true,
    },
    {
      name: "bpHistory",
      label: "BP History",
      unit: "status",
      placeholder: "e.g., Normal",
      icon: "📊",
      description: "Previous blood pressure status",
      isNumeric: false,
    },
    {
      name: "medication",
      label: "Medication",
      unit: "type",
      placeholder: "e.g., Beta Blocker",
      icon: "💊",
      description: "Current medications",
      isNumeric: false,
    },
    {
      name: "familyHistory",
      label: "Family History",
      unit: "yes/no",
      placeholder: "e.g., Yes",
      icon: "👨‍👩‍👧‍👦",
      description: "Hypertension in family",
      isNumeric: false,
    },
    {
      name: "exerciseLevel",
      label: "Exercise Level",
      unit: "intensity",
      placeholder: "e.g., High",
      icon: "🏃",
      description: "Physical activity level",
      isNumeric: false,
    },
    {
      name: "smokingStatus",
      label: "Smoking Status",
      unit: "status",
      placeholder: "e.g., Non Smoker",
      icon: "🚭",
      description: "Smoking habits",
      isNumeric: false,
    },
  ];

  const getFieldStatus = (fieldName) => {
    const value = form[fieldName];

    if (!value && value !== 0) return "empty";
    if (errors[fieldName]) return "error";
    if (numericFields.has(fieldName)) {
      const num = parseFloat(value);
      const range = RANGES[fieldName];
      if (num >= range.min && num <= range.max) return "normal";
      if (num < range.min) return "low";
      return "high";
    }
    return value ? "filled" : "empty";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "normal":
      case "filled":
        return "border-orange-400 bg-orange-50";
      case "low":
      case "high":
        return "border-red-400 bg-red-50";
      case "error":
        return "border-red-600 bg-red-100";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "normal":
      case "filled":
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
    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const next = { ...prev };
      if (numericFields.has(name)) {
        const num = Number(value);
        if (value === "" || isNaN(num))
          next[name] = "Please enter a valid number";
        else if (
          RANGES[name] &&
          (num < RANGES[name].min || num > RANGES[name].max)
        )
          next[name] =
            `Must be between ${RANGES[name].min}-${RANGES[name].max}`;
        else delete next[name];
      } else {
        if (value && next[name]) delete next[name];
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const required = [];
    const nextErrors = {};
    for (const k of required) {
      const v = form[k];
      if (v === "" || v === undefined || isNaN(Number(v)))
        nextErrors[k] = "This field is required";
    }

    for (const k of Object.keys(RANGES)) {
      const v = form[k];
      if (v !== "" && v !== undefined && !isNaN(Number(v))) {
        const num = Number(v);
        if (RANGES[k] && (num < RANGES[k].min || num > RANGES[k].max)) {
          nextErrors[k] =
            `Value must be between ${RANGES[k].min} and ${RANGES[k].max}`;
        }
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const apiBase = import.meta.env.VITE_BACKEND_URL || "";
      let patientId = null;
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        patientId = user.id || user._id || null;
      } catch {
        // ignore
      }

      const payload = {
        age: form.age || undefined,
        saltIntake: form.saltIntake || undefined,
        stressScore: form.stressScore || undefined,
        bpHistory: form.bpHistory || undefined,
        sleepDuration: form.sleepDuration || undefined,
        bmi: form.bmi || undefined,
        medication: form.medication || undefined,
        familyHistory: form.familyHistory || undefined,
        exerciseLevel: form.exerciseLevel || undefined,
        smokingStatus: form.smokingStatus || undefined,
        patientId: patientId,
      };

      // Save measurement
      await fetch(`${apiBase}/api/hypertension`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);

      const features = [
        0,
        0,
        0,
        Number(payload.age) || 0,
        Number(payload.bmi) || 0,
        Number(payload.saltIntake) || 0,
        Number(payload.stressScore) || 0,
        Number(payload.bpHistory) || 0,
        Number(payload.sleepDuration) || 0,
        0,
        0,
        0,
        Number(payload.medication) || 0,
        Number(payload.familyHistory) || 0,
        Number(payload.exerciseLevel) || 0,
        Number(payload.smokingStatus) || 0,
      ];

      const predictionBody = {
        model: "hypertention",
        input: features,
        patientId: patientId,
        symptoms: ["hypertension"],
      };

      const mlRes = await fetch(`${apiBase}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictionBody),
      });
      const mlData = await mlRes.json().catch(() => null);
      if (!mlRes.ok) {
        setResult({ error: JSON.stringify(mlData) });
        return;
      }

      const body = mlData?.body || mlData;
      const prediction = body?.prediction || 0;
      const riskStatus = prediction === 1 ? "HIGH RISK ⚠️" : "LOW RISK ✅";
      const message =
        prediction === 1
          ? "⚠️ Hypertension risk detected! Alert sent to specialist doctors."
          : "✅ Your hypertension status appears normal. Continue monitoring.";

      setResult({
        success: true,
        prediction: prediction,
        riskStatus: riskStatus,
        features: body?.features || features,
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
    Object.values(form).some((v) => v !== "" && v !== undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4">
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
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
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
          <div className="inline-block px-6 py-2 bg-orange-100 rounded-full mb-4">
            <span className="text-orange-700 font-semibold text-sm">
              🩺 Hypertension Risk Assessment
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Record Your Blood Pressure Metrics
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Enter your health parameters for accurate hypertension risk
            evaluation and personalized recommendations
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <span className="text-2xl">🎯</span>
            <p className="text-sm font-semibold text-orange-900 mt-2">
              Early Detection
            </p>
            <p className="text-xs text-orange-700 mt-1">
              Detect hypertension early
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <span className="text-2xl">📱</span>
            <p className="text-sm font-semibold text-green-900 mt-2">
              Comprehensive Assessment
            </p>
            <p className="text-xs text-green-700 mt-1">
              Complete health data input
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <span className="text-2xl">🔔</span>
            <p className="text-sm font-semibold text-red-900 mt-2">
              Instant Alerts
            </p>
            <p className="text-xs text-red-700 mt-1">
              Notify specialist doctors
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
                      type={field.isNumeric ? "number" : "text"}
                      step={field.name === "sleepDuration" ? "0.1" : "1"}
                      className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-900 animate-input focus:outline-none ${
                        status === "error"
                          ? "border-red-500 focus:ring-2 focus:ring-red-300"
                          : "border-gray-300 focus:ring-2 focus:ring-orange-300"
                      }`}
                      placeholder={field.placeholder}
                    />
                    <span className="absolute right-4 top-3 text-gray-600 font-semibold text-sm">
                      {field.unit}
                    </span>
                  </div>

                  {field.isNumeric &&
                    status === "normal" &&
                    form[field.name] && (
                      <p className="text-xs text-green-600 font-semibold">
                        ✓ Within normal range ({RANGES[field.name].min} -{" "}
                        {RANGES[field.name].max})
                      </p>
                    )}
                  {field.isNumeric && status === "low" && form[field.name] && (
                    <p className="text-xs text-orange-600 font-semibold">
                      Below normal ({RANGES[field.name].min} -{" "}
                      {RANGES[field.name].max})
                    </p>
                  )}
                  {field.isNumeric && status === "high" && form[field.name] && (
                    <p className="text-xs text-red-600 font-semibold">
                      Above normal ({RANGES[field.name].min} -{" "}
                      {RANGES[field.name].max})
                    </p>
                  )}
                  {!field.isNumeric && status === "filled" && (
                    <p className="text-xs text-orange-600 font-semibold">
                      ✓ Information provided
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
                  : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 hover:shadow-lg hover:-translate-y-0.5"
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
                        📧 Alert has been sent to specialist doctors
                      </p>
                      <p className="text-red-700 text-sm mt-2">
                        A medical specialist will review your data shortly
                      </p>
                    </div>
                  )}

                  <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                    <p className="font-bold text-gray-800 mb-3">
                      📋 Your Recorded Data:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-bold text-orange-700">
                          {form.age} yrs
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Salt Intake</p>
                        <p className="font-bold text-orange-700">
                          {form.saltIntake} g
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Stress Score</p>
                        <p className="font-bold text-orange-700">
                          {form.stressScore}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Sleep</p>
                        <p className="font-bold text-orange-700">
                          {form.sleepDuration} hrs
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">BMI</p>
                        <p className="font-bold text-orange-700">{form.bmi}</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">BP History</p>
                        <p className="font-bold text-orange-700">
                          {form.bpHistory}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Medication</p>
                        <p className="font-bold text-orange-700">
                          {form.medication}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Family Hx</p>
                        <p className="font-bold text-orange-700">
                          {form.familyHistory}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Exercise</p>
                        <p className="font-bold text-orange-700">
                          {form.exerciseLevel}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Smoking</p>
                        <p className="font-bold text-orange-700">
                          {form.smokingStatus}
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
            📌 Please enter all available information for accurate health
            assessment
          </p>
          <p className="mt-2">
            💡 Tip: Regular monitoring helps track your hypertension risk over
            time
          </p>
        </div>
      </div>
    </div>
  );
};

export default HypertentionForm;
