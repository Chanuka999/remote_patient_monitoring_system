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

  const getHealthAnalysis = (name, valueStr) => {
    if (!valueStr) return { status: "empty", condition: "Pending", riskLevel: 0, color: "border-gray-200 bg-gray-50", text: "text-gray-500", icon: "⚪", risk: "None" };
    if (errors[name]) return { status: "error", condition: "Invalid Input", riskLevel: 0, color: "border-red-400 bg-red-50", text: "text-red-500", icon: "❌", risk: "None" };
    
    const val = parseFloat(valueStr);

    if (name === "Glucose") {
      if (val < 70) return { status: "critical", condition: "Hypoglycemia", riskLevel: 4, color: "border-red-600 bg-red-100", text: "text-red-900", icon: "🆘", risk: "Emergency" };
      if (val < 100) return { status: "normal", condition: "Normal (Fasting)", riskLevel: 0, color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅", risk: "Low" };
      if (val < 126) return { status: "elevated", condition: "Prediabetes Range", riskLevel: 2, color: "border-yellow-400 bg-yellow-50", text: "text-yellow-700", icon: "⚠️", risk: "Moderate" };
      return { status: "high", condition: "Diabetes Range", riskLevel: 3, color: "border-red-400 bg-red-50", text: "text-red-700", icon: "🚨", risk: "High" };
    }

    if (name === "BMI") {
      if (val < 18.5) return { status: "low", condition: "Underweight", riskLevel: 1, color: "border-blue-400 bg-blue-50", text: "text-blue-700", icon: "📉", risk: "Low-Moderate" };
      if (val < 25) return { status: "normal", condition: "Normal Weight", riskLevel: 0, color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅", risk: "Low" };
      if (val < 30) return { status: "elevated", condition: "Overweight", riskLevel: 1, color: "border-yellow-400 bg-yellow-50", text: "text-yellow-700", icon: "⚠️", risk: "Moderate" };
      if (val < 35) return { status: "high", condition: "Obese Class I", riskLevel: 2, color: "border-orange-400 bg-orange-50", text: "text-orange-700", icon: "📈", risk: "High" };
      if (val < 40) return { status: "high", condition: "Obese Class II", riskLevel: 3, color: "border-red-400 bg-red-50", text: "text-red-700", icon: "🚨", risk: "High" };
      return { status: "critical", condition: "Obese Class III", riskLevel: 4, color: "border-red-600 bg-red-100", text: "text-red-900", icon: "🆘", risk: "Critical" };
    }

    if (name === "BloodPressure") {
      if (val < 60) return { status: "low", condition: "Hypotension", riskLevel: 2, color: "border-blue-400 bg-blue-50", text: "text-blue-700", icon: "📉", risk: "Moderate" };
      if (val <= 80) return { status: "normal", condition: "Normal", riskLevel: 0, color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅", risk: "Low" };
      if (val <= 90) return { status: "high", condition: "High (Stage 1)", riskLevel: 2, color: "border-orange-400 bg-orange-50", text: "text-orange-700", icon: "📈", risk: "Moderate-High" };
      return { status: "critical", condition: "Crisis (Stage 2)", riskLevel: 4, color: "border-red-600 bg-red-100", text: "text-red-900", icon: "🆘", risk: "Emergency" };
    }

    if (name === "Insulin") {
      if (val < 16) return { status: "low", condition: "Low Insulin", riskLevel: 1, color: "border-blue-400 bg-blue-50", text: "text-blue-700", icon: "📉", risk: "Moderate" };
      if (val <= 166) return { status: "normal", condition: "Normal", riskLevel: 0, color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅", risk: "Low" };
      return { status: "high", condition: "High Insulin", riskLevel: 2, color: "border-orange-400 bg-orange-50", text: "text-orange-700", icon: "📈", risk: "Moderate" };
    }

    if (name === "SkinThickness") {
      if (val < 15) return { status: "low", condition: "Low Thickness", riskLevel: 1, color: "border-blue-400 bg-blue-50", text: "text-blue-700", icon: "📉", risk: "Low" };
      if (val <= 30) return { status: "normal", condition: "Normal", riskLevel: 0, color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅", risk: "Low" };
      return { status: "high", condition: "Elevated", riskLevel: 1, color: "border-yellow-400 bg-yellow-50", text: "text-yellow-700", icon: "⚠️", risk: "Moderate" };
    }

    if (name === "Age") {
      if (val < 45) return { status: "normal", condition: "Lower Risk Age", riskLevel: 0, color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅", risk: "Low" };
      if (val <= 65) return { status: "elevated", condition: "Middle Age Risk", riskLevel: 1, color: "border-yellow-400 bg-yellow-50", text: "text-yellow-700", icon: "⚠️", risk: "Moderate" };
      return { status: "high", condition: "Senior High Risk", riskLevel: 2, color: "border-orange-400 bg-orange-50", text: "text-orange-700", icon: "📈", risk: "High" };
    }

    // Default for Pregnancies and Pedigree which are more statistical than clinical buckets
    const range = normalRanges[name];
    if (val >= range.min && val <= range.max) return { status: "normal", condition: "Normal Range", riskLevel: 0, color: "border-green-400 bg-green-50", text: "text-green-700", icon: "✅", risk: "Low" };
    return { status: val < range.min ? "low" : "high", condition: val < range.min ? "Below Average" : "Above Average", riskLevel: 1, color: "border-orange-400 bg-orange-50", text: "text-orange-700", icon: val < range.min ? "📉" : "📈", risk: "Moderate" };
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
      
      // Calculate manual risk escalation based on thresholds
      const analyzedFields = fieldsList.map(f => getHealthAnalysis(f.name, form[f.name]));
      const maxRiskLevel = Math.max(...analyzedFields.map(a => a.riskLevel));
      const elevatedFields = analyzedFields.filter(a => a.riskLevel >= 1);

      let riskStatus = "LOW RISK ✅";
      let message = "✅ Your diabetes status appears normal. Continue monitoring.";
      let predictionSource = "AI Predictive Model";

      // Logic: Trust clinical vitals over AI for "High Risk" classification if vitals are perfect
      if (prediction === 1 && maxRiskLevel === 0) {
        riskStatus = "LOW RISK ✅";
        message = "✅ All your clinical vitals (Glucose, BP, BMI, etc.) are within normal ranges. While the AI model noted a statistical risk factor, your current health metrics are excellent.";
        predictionSource = "Clinical Analysis (AI Override)";
      } else if (prediction === 1 || maxRiskLevel >= 3) {
        riskStatus = "HIGH RISK 🚨";
        message = "⚠️ High risk detected! Your metrics or AI prediction indicate potential clinical concerns. Alert sent to specialists.";
        predictionSource = prediction === 1 ? "AI Diabetes Model" : "Clinical Vital Sign Thresholds";
      } else if (maxRiskLevel >= 1) {
        riskStatus = "MODERATE RISK ⚠️";
        message = `⚠️ Caution: Some of your metrics are outside the normal range (${elevatedFields.map(f => f.condition).join(", ")}). Please consult a doctor.`;
        predictionSource = "Metric Deviation Analysis";
      }

      setResult({
        success: true,
        prediction: prediction,
        riskStatus: riskStatus,
        features: body?.features || features,
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
                      step={field.name === "DiabetesPedigreeFunction" ? "0.001" : "1"}
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

                  {result.riskStatus.includes("HIGH") && (
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
                      📋 Your Recorded Measurements:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-[10px] text-gray-600 font-bold uppercase">Pregnancies</p>
                        <p className="font-black text-blue-700">
                          {result.features?.[0]}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-[10px] text-gray-600 font-bold uppercase">Glucose</p>
                        <p className="font-black text-blue-700">
                          {result.features?.[1]} <span className="text-[9px]">mg/dL</span>
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-[10px] text-gray-600 font-bold uppercase">BP (D)</p>
                        <p className="font-black text-blue-700">
                          {result.features?.[2]} <span className="text-[9px]">mmHg</span>
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-[10px] text-gray-600 font-bold uppercase">Skin</p>
                        <p className="font-black text-blue-700">
                          {result.features?.[3]} <span className="text-[9px]">mm</span>
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-[10px] text-gray-600 font-bold uppercase">Insulin</p>
                        <p className="font-black text-blue-700">
                          {result.features?.[4]} <span className="text-[9px]">μU/ml</span>
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-[10px] text-gray-600 font-bold uppercase">BMI</p>
                        <p className="font-black text-blue-700">
                          {result.features?.[5]}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-[10px] text-gray-600 font-bold uppercase">Pedigree</p>
                        <p className="font-black text-blue-700">
                          {result.features?.[6]}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-[10px] text-gray-600 font-bold uppercase">Age</p>
                        <p className="font-black text-blue-700">
                          {result.features?.[7]} <span className="text-[9px]">yr</span>
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
