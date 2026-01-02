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
        next[
          name
        ] = `Value must be between ${RANGES[name].min} and ${RANGES[name].max}`;
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
        nextErrors[
          k
        ] = `Value must be between ${RANGES[k].min} and ${RANGES[k].max}`;
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setLoading(true);
    setResult(null);

    // Get patient ID from localStorage
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
      patientId: patientId, // Include patient ID
    };

    try {
      const apiBase = import.meta.env.VITE_BACKEND_URL || "";
      const bodyWithSymptom = {
        ...body,
        symptoms: ["heart_disease"],
      };

      // Save measurement
      await fetch(`${apiBase}/api/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Get prediction and trigger alerts
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
    <div className="min-h-screen bg-[url('SyyLogo.png')] flex items-center justify-center py-12 px-4">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-form-card {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-input {
          transition: all 0.3s ease;
        }
        .animate-input:focus {
          transform: scale(1.02);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        .animate-button {
          transition: all 0.3s ease;
        }
        .animate-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .animate-result {
          animation: fadeInUp 0.5s ease-out;
        }
        .two-col {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
        }
        .full-span {
          grid-column: 1 / -1;
        }
      `}</style>
      <div className=" text-gray-900 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 max-w-2xl w-full animate-form-card">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8 animate-pulse">
          🩺 Patient Health Data Input
        </h2>
        <div className="two-col">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Systolic (mmHg)
            </label>
            <input
              name="systolic"
              value={form.systolic}
              onChange={handleChange}
              type="number"
              className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 animate-input ${
                errors.systolic ? "border-red-500" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 120"
            />
            {errors.systolic && (
              <p className="text-red-500 text-sm mt-1 animate-pulse">
                {errors.systolic}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diastolic (mmHg)
            </label>
            <input
              name="diastolic"
              value={form.diastolic}
              onChange={handleChange}
              type="number"
              className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 animate-input ${
                errors.diastolic ? "border-red-500" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 80"
            />
            {errors.diastolic && (
              <p className="text-red-500 text-sm mt-1 animate-pulse">
                {errors.diastolic}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heart Rate (bpm)
            </label>
            <input
              name="heartRate"
              value={form.heartRate}
              onChange={handleChange}
              type="number"
              className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 animate-input ${
                errors.heartRate ? "border-red-500" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 70"
            />
            {errors.heartRate && (
              <p className="text-red-500 text-sm mt-1 animate-pulse">
                {errors.heartRate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glucose (mg/dL)
            </label>
            <input
              name="glucoseLevel"
              value={form.glucoseLevel}
              onChange={handleChange}
              type="number"
              className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 animate-input ${
                errors.glucoseLevel ? "border-red-500" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 100"
            />
            {errors.glucoseLevel && (
              <p className="text-red-500 text-sm mt-1 animate-pulse">
                {errors.glucoseLevel}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature (°C)
            </label>
            <input
              name="temperature"
              value={form.temperature}
              onChange={handleChange}
              step="0.1"
              type="number"
              className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 animate-input ${
                errors.temperature ? "border-red-500" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 36.6"
            />
            {errors.temperature && (
              <p className="text-red-500 text-sm mt-1 animate-pulse">
                {errors.temperature}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SpO₂ (%)
            </label>
            <input
              name="oxygenSaturation"
              value={form.oxygenSaturation}
              onChange={handleChange}
              type="number"
              className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 animate-input ${
                errors.oxygenSaturation ? "border-red-500" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 98"
            />
            {errors.oxygenSaturation && (
              <p className="text-red-500 text-sm mt-1 animate-pulse">
                {errors.oxygenSaturation}
              </p>
            )}
          </div>

          <div className="full-span">
            {!isValid && !loading && (
              <p className="text-sm text-red-500 mb-4 animate-pulse">
                Please fix highlighted fields before submitting.
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className={`w-full py-3 text-white rounded-lg animate-button ${
                !isValid || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
              }`}
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>

          {result && (
            <div
              className={`full-span mt-6 p-6 border-l-4 rounded-lg animate-result ${
                result.error
                  ? "bg-red-50 border-red-600"
                  : result.prediction === 1
                  ? "bg-red-50 border-red-600"
                  : "bg-green-50 border-green-600"
              }`}
            >
              {result.error ? (
                <div className="text-red-700">
                  <strong>⚠️ Error: </strong>
                  <span>{result.error}</span>
                </div>
              ) : (
                <div>
                  <h4
                    className={`text-lg font-semibold mb-3 ${
                      result.prediction === 1
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    Risk Assessment: {result.riskStatus}
                  </h4>
                  <p className="text-md mb-3 text-gray-800">{result.message}</p>

                  {result.prediction === 1 && (
                    <div className="bg-red-100 border border-red-300 rounded p-3 mb-3">
                      <p className="text-red-700 font-semibold">
                        ✉️ Alert has been sent to specialist cardiologists
                      </p>
                    </div>
                  )}

                  <div className="text-sm text-gray-700 bg-white p-3 rounded">
                    <strong>Measurements Recorded:</strong>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Systolic: {result.features?.[0]} mmHg</li>
                      <li>Diastolic: {result.features?.[1]} mmHg</li>
                      <li>Heart Rate: {result.features?.[2]} bpm</li>
                      <li>Glucose: {result.features?.[3]} mg/dL</li>
                      <li>Temperature: {result.features?.[4]} °C</li>
                      <li>SpO₂: {result.features?.[5]} %</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardForm;
