import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SymptomForm = () => {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [formData, setFormData] = useState({
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

  const SYMPTOMS_OPTIONS = [
    { id: "chest_pain", label: "Chest Pain" },
    { id: "shortness_of_breath", label: "Shortness of Breath" },
    { id: "dizziness", label: "Dizziness" },
    { id: "fatigue", label: "Fatigue" },
    { id: "nausea", label: "Nausea" },
    { id: "headache", label: "Headache" },
    { id: "sweating", label: "Sweating" },
    { id: "palpitations", label: "Heart Palpitations" },
    { id: "high_blood_pressure", label: "High Blood Pressure" },
    { id: "frequent_urination", label: "Frequent Urination" },
    { id: "excessive_thirst", label: "Excessive Thirst" },
    { id: "weight_loss", label: "Unexplained Weight Loss" },
  ];

  const RANGES = {
    systolic: { min: 50, max: 250 },
    diastolic: { min: 30, max: 150 },
    heartRate: { min: 20, max: 220 },
    glucoseLevel: { min: 20, max: 600 },
    temperature: { min: 30, max: 45 },
    oxygenSaturation: { min: 50, max: 100 },
  };

  const handleSymptomToggle = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId],
    );
  };

  // Field meta for UI display
  const fieldsList = [
    {
      name: "systolic",
      label: "Systolic BP",
      unit: "mmHg",
      icon: "🩸",
      description: "Systolic blood pressure",
    },
    {
      name: "diastolic",
      label: "Diastolic BP",
      unit: "mmHg",
      icon: "🩸",
      description: "Diastolic blood pressure",
    },
    {
      name: "heartRate",
      label: "Heart Rate",
      unit: "bpm",
      icon: "❤️",
      description: "Heart beats per minute",
    },
    {
      name: "glucoseLevel",
      label: "Glucose Level",
      unit: "mg/dL",
      icon: "🍬",
      description: "Blood glucose level",
    },
    {
      name: "temperature",
      label: "Temperature",
      unit: "°C",
      icon: "🌡️",
      description: "Body temperature",
    },
    {
      name: "oxygenSaturation",
      label: "Oxygen Saturation",
      unit: "%",
      icon: "🫁",
      description: "Blood oxygen saturation",
    },
  ];

  // Analysis function for each field
  function getHealthAnalysis(name, valueStr) {
    if (!valueStr)
      return {
        status: "empty",
        condition: "Pending",
        riskLevel: 0,
        color: "border-gray-200 bg-gray-50",
        text: "text-gray-500",
        icon: "⚪",
        risk: "None",
      };
    if (errors[name])
      return {
        status: "error",
        condition: "Invalid Input",
        riskLevel: 0,
        color: "border-red-400 bg-red-50",
        text: "text-red-500",
        icon: "❌",
        risk: "None",
      };
    const val = parseFloat(valueStr);
    const range = RANGES[name];
    if (!range)
      return {
        status: "filled",
        condition: "Filled",
        riskLevel: 0,
        color: "border-orange-400 bg-orange-50",
        text: "text-orange-700",
        icon: "✅",
        risk: "Info",
      };
    if (val < range.min)
      return {
        status: "low",
        condition: "Below Normal",
        riskLevel: 1,
        color: "border-yellow-400 bg-yellow-50",
        text: "text-yellow-700",
        icon: "📉",
        risk: "Low",
      };
    if (val > range.max)
      return {
        status: "high",
        condition: "Above Normal",
        riskLevel: 2,
        color: "border-red-400 bg-red-50",
        text: "text-red-700",
        icon: "📈",
        risk: "High",
      };
    return {
      status: "normal",
      condition: "Within normal range",
      riskLevel: 0,
      color: "border-green-400 bg-green-50",
      text: "text-green-700",
      icon: "✅",
      risk: "Normal",
    };
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    // Validate all fields
    const requiredFields = [
      "systolic",
      "diastolic",
      "heartRate",
      "glucoseLevel",
      "temperature",
      "oxygenSaturation",
    ];
    const nextErrors = {};

    requiredFields.forEach((k) => {
      const v = formData[k];
      const num = Number(v);
      if (v === "" || isNaN(num)) nextErrors[k] = "Please enter a valid number";
      else if (RANGES[k] && (num < RANGES[k].min || num > RANGES[k].max))
        nextErrors[k] =
          `Value must be between ${RANGES[k].min} and ${RANGES[k].max}`;
    });

    if (selectedSymptoms.length === 0) {
      nextErrors.symptoms = "Please select at least one symptom";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Get patient info from localStorage
      let patientId = null;
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        patientId = user.id || user._id || null;
      } catch {
        console.warn("Could not get patient info from localStorage");
      }

      const apiBase = import.meta.env.VITE_BACKEND_URL || "";

      // First, save the measurement
      const measurementBody = {
        systolic: parseFloat(formData.systolic) || 0,
        diastolic: parseFloat(formData.diastolic) || 0,
        heartRate: parseFloat(formData.heartRate) || 0,
        glucoseLevel: parseFloat(formData.glucoseLevel) || 0,
        temperature: parseFloat(formData.temperature) || 0,
        oxygenSaturation: parseFloat(formData.oxygenSaturation) || 0,
        patientId: patientId,
      };

      const measurementRes = await fetch(`${apiBase}/api/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(measurementBody),
      });

      if (!measurementRes.ok) {
        throw new Error("Failed to save health measurements");
      }

      // Then, get prediction with symptoms
      const predictionBody = {
        systolic: parseFloat(formData.systolic) || 0,
        diastolic: parseFloat(formData.diastolic) || 0,
        heartRate: parseFloat(formData.heartRate) || 0,
        glucoseLevel: parseFloat(formData.glucoseLevel) || 0,
        temperature: parseFloat(formData.temperature) || 0,
        oxygenSaturation: parseFloat(formData.oxygenSaturation) || 0,
        patientId: patientId,
        symptoms: selectedSymptoms,
      };

      const predictionRes = await fetch(`${apiBase}/api/predict/symptoms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictionBody),
      });

      const predictionData = await predictionRes.json();
      if (!predictionRes.ok) {
        throw new Error(JSON.stringify(predictionData));
      }

      const prediction = predictionData.body?.prediction || 0;
      const riskStatus = prediction === 1 ? "HIGH RISK" : "LOW RISK";

      setResult({
        success: true,
        prediction: prediction,
        riskStatus: riskStatus,
        features: predictionData.body?.features,
        symptoms: selectedSymptoms,
        message:
          prediction === 1
            ? "⚠️ High risk detected! An alert has been sent to specialist doctors."
            : "✅ Your health status appears normal. Continue monitoring.",
      });
    } catch (err) {
      setResult({
        success: false,
        error: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    Object.keys(errors).length === 0 &&
    selectedSymptoms.length > 0 &&
    [
      "systolic",
      "diastolic",
      "heartRate",
      "glucoseLevel",
      "temperature",
      "oxygenSaturation",
    ].every((k) => formData[k] !== "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Health Assessment
          </h1>
          <p className="text-gray-600 mb-8">
            Please enter your symptoms and health measurements for an accurate
            risk assessment.
          </p>

          {/* Symptoms Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Select Your Symptoms:
            </label>
            {errors.symptoms && (
              <p className="text-red-600 text-sm mb-2">{errors.symptoms}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SYMPTOMS_OPTIONS.map((symptom) => (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => handleSymptomToggle(symptom.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedSymptoms.includes(symptom.id)
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                  }`}
                >
                  {selectedSymptoms.includes(symptom.id) && (
                    <span className="mr-2">✓</span>
                  )}
                  {symptom.label}
                </button>
              ))}
            </div>
          </div>

          {/* Health Measurements - Card UI */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Health Measurements:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldsList.map((field) => {
                const analysis = getHealthAnalysis(
                  field.name,
                  formData[field.name],
                );
                return (
                  <div
                    key={field.name}
                    className={`border-2 rounded-xl p-5 transition-all duration-300 transform hover:scale-[1.02] shadow-sm ${analysis.color}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{field.icon}</span>
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
                        <span className={`text-xl`}>{analysis.icon}</span>
                        {formData[field.name] && !errors[field.name] && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                              analysis.riskLevel === 0
                                ? "bg-green-200 text-green-800"
                                : analysis.riskLevel === 1
                                  ? "bg-yellow-200 text-yellow-800"
                                  : "bg-red-200 text-red-800"
                            }`}
                          >
                            {analysis.risk} Risk
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative mb-2">
                      <input
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        type="number"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                          errors[field.name]
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder={`${RANGES[field.name].min} - ${RANGES[field.name].max}`}
                      />
                      <span className="absolute right-4 top-2 text-gray-400 font-bold text-sm">
                        {field.unit}
                      </span>
                    </div>
                    {formData[field.name] && !errors[field.name] && (
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <p
                            className={`text-xs font-black tracking-tight ${analysis.text}`}
                          >
                            {analysis.condition}
                          </p>
                        </div>
                        <p className="text-[10px] font-medium opacity-70">
                          Goal: {RANGES[field.name].min} -{" "}
                          {RANGES[field.name].max} {field.unit}
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
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
              isValid && !loading
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Analyzing..." : "Get Risk Assessment"}
          </button>

          {/* Results */}
          {result && (
            <div
              className={`mt-8 p-6 rounded-lg border-l-4 ${
                result.success
                  ? result.prediction === 1
                    ? "bg-red-50 border-red-600"
                    : "bg-green-50 border-green-600"
                  : "bg-yellow-50 border-yellow-600"
              }`}
            >
              {result.success ? (
                <>
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      result.prediction === 1
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    Risk Status: {result.riskStatus}
                  </h3>
                  <p className="text-gray-700 mb-4">{result.message}</p>
                  <div className="bg-white p-4 rounded mt-4">
                    <p className="text-sm text-gray-600">
                      <strong>Symptoms Reported:</strong>{" "}
                      {result.symptoms.join(", ")}
                    </p>
                    {result.features && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Measurement Data:</strong> Recorded and saved
                      </p>
                    )}
                    {result.prediction === 1 && (
                      <p className="text-sm text-red-600 mt-3 font-semibold">
                        ✉️ An alert notification has been sent to specialist
                        doctors in your area.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-yellow-700 mb-3">
                    Error
                  </h3>
                  <p className="text-gray-700">{result.error}</p>
                </>
              )}
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => navigate("/Sympthoms")}
            className="mt-6 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Symptoms
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymptomForm;
