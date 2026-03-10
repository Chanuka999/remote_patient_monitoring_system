import React, { useState } from "react";

const DiabeticsForm = () => {
  const [form, setForm] = useState({
    Pregnancies: "",
    Glucose: "",
    BloodPressure: "",
    SkinThickness: "",
    Insulin: "",
    BMI: "",
    DiabetesPedigreeFunction: "",
    Age: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const numericFields = new Set([
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
  ]);

  const normalRanges = {
    Pregnancies: { min: 0, max: 17 },
    Glucose: { min: 70, max: 100 },
    BloodPressure: { min: 60, max: 80 },
    SkinThickness: { min: 15, max: 30 },
    Insulin: { min: 16, max: 120 },
    BMI: { min: 18.5, max: 24.9 },
    DiabetesPedigreeFunction: { min: 0.08, max: 0.6 },
    Age: { min: 20, max: 65 },
  };

  const fieldsList = [
    {
      name: "Pregnancies",
      label: "Pregnancies",
      unit: "times",
      placeholder: "e.g., 2",
      icon: "👶",
      description: "Number of times pregnant",
    },
    {
      name: "Glucose",
      label: "Glucose Level",
      unit: "mg/dL",
      placeholder: "e.g., 148",
      icon: "🍬",
      description: "Fasting blood glucose",
    },
    {
      name: "BloodPressure",
      label: "Blood Pressure",
      unit: "mmHg",
      placeholder: "e.g., 72",
      icon: "🩸",
      description: "Diastolic blood pressure",
    },
    {
      name: "SkinThickness",
      label: "Skin Thickness",
      unit: "mm",
      placeholder: "e.g., 35",
      icon: "📏",
      description: "Triceps skin fold thickness",
    },
    {
      name: "Insulin",
      label: "Insulin Level",
      unit: "μU/ml",
      placeholder: "e.g., 0",
      icon: "💉",
      description: "2-Hour serum insulin",
    },
    {
      name: "BMI",
      label: "BMI",
      unit: "kg/m²",
      placeholder: "e.g., 33.6",
      icon: "⚖️",
      description: "Body Mass Index",
    },
    {
      name: "DiabetesPedigreeFunction",
      label: "Diabetes Pedigree Function",
      unit: "score",
      placeholder: "e.g., 0.627",
      icon: "👨‍👩‍👧‍👦",
      description: "Genetic predisposition score",
    },
    {
      name: "Age",
      label: "Age",
      unit: "years",
      placeholder: "e.g., 50",
      icon: "🎂",
      description: "Your age in years",
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
        return "border-blue-400 bg-blue-50";
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
    setForm((p) => ({ ...p, [name]: value }));

    setErrors((prev) => {
      const next = { ...prev };
      if (numericFields.has(name)) {
        const num = Number(value);
        if (value === "" || isNaN(num))
          next[name] = "Please enter a valid number";
        else delete next[name];
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const nextErrors = {};
    for (const k of numericFields) {
      const v = form[k];
      if (v === "" || v === undefined || isNaN(Number(v)))
        nextErrors[k] = "Please enter a valid number";
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

      const payloadSave = {
        type: "diabetes",
        Pregnancies: Number(form.Pregnancies),
        Glucose: Number(form.Glucose),
        BloodPressure: Number(form.BloodPressure),
        SkinThickness: Number(form.SkinThickness),
        Insulin: Number(form.Insulin),
        BMI: Number(form.BMI),
        DiabetesPedigreeFunction: Number(form.DiabetesPedigreeFunction),
        Age: Number(form.Age),
        patientId: patientId,
      };

      // Save measurement
      await fetch(`${apiBase}/api/measurement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadSave),
      }).catch(() => null);

      // Build feature array and get prediction with alert
      const features = [
        Number(form.Pregnancies) || 0,
        Number(form.Glucose) || 0,
        Number(form.BloodPressure) || 0,
        Number(form.SkinThickness) || 0,
        Number(form.Insulin) || 0,
        Number(form.BMI) || 0,
        Number(form.DiabetesPedigreeFunction) || 0,
        Number(form.Age) || 0,
      ];

      const predictionBody = {
        model: "diabetes",
        input: features,
        patientId: patientId,
        symptoms: ["diabetes"],
      };

      const mlRes = await fetch(`${apiBase}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictionBody),
      });

      const data = await mlRes.json().catch(() => null);
      if (!mlRes.ok) {
        setResult({ error: data || `ML error: ${mlRes.status}` });
        return;
      }

      const body = data?.body || data;
      const prediction = body?.prediction || 0;
      const riskStatus = prediction === 1 ? "HIGH RISK ⚠️" : "LOW RISK ✅";
      const message =
        prediction === 1
          ? "⚠️ Diabetes risk detected! Alert sent to specialist doctors."
          : "✅ Your diabetes status appears normal. Continue monitoring.";

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
    numericFields.size === Object.keys(form).length &&
    Object.values(form).every((v) => v !== "");

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
              📊 Diabetes Risk Assessment
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Record Your Diabetes Metrics
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Enter your health parameters for accurate diabetes risk evaluation
            and personalized recommendations
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <span className="text-2xl">🎯</span>
            <p className="text-sm font-semibold text-blue-900 mt-2">
              Early Detection
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Identify diabetes risk early
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <span className="text-2xl">📱</span>
            <p className="text-sm font-semibold text-green-900 mt-2">
              Quick Assessment
            </p>
            <p className="text-xs text-green-700 mt-1">
              Fast and easy data input
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <span className="text-2xl">🔔</span>
            <p className="text-sm font-semibold text-purple-900 mt-2">
              Smart Alerts
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Get specialist notifications
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
                      step={
                        field.name === "DiabetesPedigreeFunction"
                          ? "0.001"
                          : "1"
                      }
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
                      Below normal ({normalRanges[field.name].min} -{" "}
                      {normalRanges[field.name].max})
                    </p>
                  )}
                  {status === "high" && form[field.name] && (
                    <p className="text-xs text-orange-600 font-semibold">
                      Above normal ({normalRanges[field.name].min} -{" "}
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Pregnancies</p>
                        <p className="font-bold text-blue-700">
                          {result.features?.[0]}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Glucose</p>
                        <p className="font-bold text-blue-700">
                          {result.features?.[1]} mg/dL
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Blood Pressure</p>
                        <p className="font-bold text-blue-700">
                          {result.features?.[2]} mmHg
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Skin Thickness</p>
                        <p className="font-bold text-blue-700">
                          {result.features?.[3]} mm
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Insulin</p>
                        <p className="font-bold text-blue-700">
                          {result.features?.[4]} μU/ml
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">BMI</p>
                        <p className="font-bold text-blue-700">
                          {result.features?.[5]}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">
                          Pedigree Function
                        </p>
                        <p className="font-bold text-blue-700">
                          {result.features?.[6]}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-bold text-blue-700">
                          {result.features?.[7]} years
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
            💡 Tip: Regular monitoring helps track your diabetes risk over time
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiabeticsForm;
