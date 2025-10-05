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

    // Inline validation
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
    // Validate all fields
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
    const body = {
      systolic: parseFloat(form.systolic) || 0,
      diastolic: parseFloat(form.diastolic) || 0,
      heartRate: parseFloat(form.heartRate) || 0,
      glucoseLevel: parseFloat(form.glucoseLevel) || 0,
      temperature: parseFloat(form.temperature) || 0,
      oxygenSaturation: parseFloat(form.oxygenSaturation) || 0,
    };

    try {
      const res = await fetch("/api/predict/heart_from_form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      // our proxy returns { fromMLStatus, body }
      setResult({
        success: true,
        prediction: data.body.prediction,
        features: data.body.features,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-teal-100 to-purple-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          🩺 Patient Health Data Input
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Systolic
            </label>
            <input
              name="systolic"
              value={form.systolic}
              onChange={handleChange}
              type="number"
              className={`w-full px-4 py-2 border rounded ${
                errors.systolic ? "border-red-500" : ""
              }`}
            />
            {errors.systolic && (
              <p className="text-red-500 text-sm mt-1">{errors.systolic}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diastolic
            </label>
            <input
              name="diastolic"
              value={form.diastolic}
              onChange={handleChange}
              type="number"
              className={`w-full px-4 py-2 border rounded ${
                errors.diastolic ? "border-red-500" : ""
              }`}
            />
            {errors.diastolic && (
              <p className="text-red-500 text-sm mt-1">{errors.diastolic}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heart Rate
            </label>
            <input
              name="heartRate"
              value={form.heartRate}
              onChange={handleChange}
              type="number"
              className={`w-full px-4 py-2 border rounded ${
                errors.heartRate ? "border-red-500" : ""
              }`}
            />
            {errors.heartRate && (
              <p className="text-red-500 text-sm mt-1">{errors.heartRate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glucose
            </label>
            <input
              name="glucoseLevel"
              value={form.glucoseLevel}
              onChange={handleChange}
              type="number"
              className={`w-full px-4 py-2 border rounded ${
                errors.glucoseLevel ? "border-red-500" : ""
              }`}
            />
            {errors.glucoseLevel && (
              <p className="text-red-500 text-sm mt-1">{errors.glucoseLevel}</p>
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
              className={`w-full px-4 py-2 border rounded ${
                errors.temperature ? "border-red-500" : ""
              }`}
            />
            {errors.temperature && (
              <p className="text-red-500 text-sm mt-1">{errors.temperature}</p>
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
              className={`w-full px-4 py-2 border rounded ${
                errors.oxygenSaturation ? "border-red-500" : ""
              }`}
            />
            {errors.oxygenSaturation && (
              <p className="text-red-500 text-sm mt-1">
                {errors.oxygenSaturation}
              </p>
            )}
          </div>

          {!isValid && !loading && (
            <p className="text-sm text-red-500">
              Please fix highlighted fields before submitting.
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={`w-full py-3 text-white rounded-lg ${
              !isValid || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-teal-500"
            }`}
          >
            {loading ? "Sending..." : "Submit"}
          </button>

          {result && (
            <div className="mt-4 p-3 border rounded bg-gray-50">
              {result.error ? (
                <div className="text-red-600">
                  <strong>Error: </strong>
                  <span>{result.error}</span>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Prediction</h4>
                  <p className="text-md mb-2">
                    {result.prediction === 1 ? (
                      <span className="text-red-600 font-bold">Risk</span>
                    ) : (
                      <span className="text-green-600 font-bold">Normal</span>
                    )}
                  </p>

                  {result.features && (
                    <div className="text-sm text-gray-700">
                      <strong>Features used:</strong>
                      <ul className="list-disc ml-5 mt-1">
                        <li>Systolic: {result.features[0]}</li>
                        <li>Diastolic: {result.features[1]}</li>
                        <li>Heart Rate: {result.features[2]}</li>
                        <li>Glucose: {result.features[3]}</li>
                        <li>Temperature: {result.features[4]}</li>
                        <li>SpO₂: {result.features[5]}</li>
                      </ul>
                    </div>
                  )}
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
