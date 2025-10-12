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
          next[
            name
          ] = `Value must be between ${RANGES[name].min} and ${RANGES[name].max}`;
        else delete next[name];
      } else {
        if (value && next[name]) delete next[name];
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const required = []; // no longer require systolic/diastolic/heartRate
    const nextErrors = {};
    for (const k of required) {
      const v = form[k];
      if (v === "" || v === undefined || isNaN(Number(v)))
        nextErrors[k] = "Please enter a valid number";
    }

    for (const k of Object.keys(RANGES)) {
      const v = form[k];
      if (v !== "" && v !== undefined && !isNaN(Number(v))) {
        const num = Number(v);
        if (RANGES[k] && (num < RANGES[k].min || num > RANGES[k].max)) {
          nextErrors[
            k
          ] = `Value must be between ${RANGES[k].min} and ${RANGES[k].max}`;
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
      };

      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          if (u?.id || u?._id) payload.patientId = u.id || u._id;
        }
      } catch {
        // ignore
      }

      const saveRes = await fetch(`${apiBase}/api/hypertension`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!saveRes.ok) {
        const saveData = await saveRes.json().catch(() => null);
        throw new Error(
          `Failed to save measurement: ${saveData?.message || saveRes.status}`
        );
      }

      // Build feature vector in same order as ml/app.py's predict_hypertention_from_form
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

      // Call Node proxy which will forward to Python ML service
      const mlRes = await fetch(`${apiBase}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "hypertention", input: features }),
      });
      const mlData = await mlRes.json().catch(() => null);
      if (!mlRes.ok) throw new Error(JSON.stringify(mlData));
      // ml proxy wraps response in { fromMLStatus, body }
      const body = mlData?.body || mlData;
      setResult({
        success: true,
        prediction: body?.prediction,
        features: body?.features || features,
      });
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const isValid = Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-teal-100 flex items-center justify-center py-12 px-4">
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
      <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 max-w-2xl w-full animate-form-card">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8 animate-pulse">
          🩺 Patient Health Data Input
        </h2>
        <div className="two-col">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              name="age"
              value={form.age}
              onChange={handleChange}
              type="number"
              placeholder="e.g., 39"
            />
          </div>

          {/* glucose, temperature and oxygen fields removed per request */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salt Intake
            </label>
            <input
              name="saltIntake"
              value={form.saltIntake}
              onChange={handleChange}
              type="number"
              placeholder="e.g., 8.9"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stress Score
            </label>
            <input
              name="stressScore"
              value={form.stressScore}
              onChange={handleChange}
              type="number"
              placeholder="e.g., 0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bp History
            </label>
            <input
              name="bpHistory"
              value={form.bpHistory}
              onChange={handleChange}
              type="text"
              placeholder="e.g., Normal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sleep Duratiom
            </label>
            <input
              name="sleepDuration"
              value={form.sleepDuration}
              onChange={handleChange}
              step="0.1"
              type="number"
              placeholder="e.g., 7.6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BMI
            </label>
            <input
              name="bmi"
              value={form.bmi}
              onChange={handleChange}
              type="number"
              placeholder="e.g., 27.6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medication
            </label>
            <input
              name="medication"
              value={form.medication}
              onChange={handleChange}
              type="text"
              placeholder="e.g., Beta Blocker"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Family History
            </label>
            <input
              name="familyHistory"
              value={form.familyHistory}
              onChange={handleChange}
              type="text"
              placeholder="e.g., yes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exercise Level
            </label>
            <input
              name="exerciseLevel"
              value={form.exerciseLevel}
              onChange={handleChange}
              type="text"
              placeholder="e.g., High"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              smoking status
            </label>
            <input
              name="smokingStatus"
              value={form.smokingStatus}
              onChange={handleChange}
              type="text"
              placeholder="e.g., Non Smoker"
            />
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
            <div className="full-span mt-6 p-4 border rounded-lg bg-gray-50 animate-result">
              {result.error ? (
                <div className="text-red-600">
                  <strong>Error: </strong>
                  <span>{result.error}</span>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-blue-600">
                    Prediction
                  </h4>
                  <p className="text-md mb-3">
                    {result.prediction === 1 ? (
                      <span className="text-red-600 font-bold">Risk</span>
                    ) : (
                      <span className="text-green-600 font-bold">Normal</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HypertentionForm;
