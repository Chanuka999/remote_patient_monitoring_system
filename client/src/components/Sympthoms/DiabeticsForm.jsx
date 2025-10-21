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

      // Save measurement to measurements endpoint if available
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
      };

      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          if (u?.id || u?._id) payloadSave.patientId = u.id || u._id;
        }
      } catch (_err) {
        // ignore JSON parse / localStorage errors
        void _err;
      }

      // attempt to save measurement (non-blocking if endpoint missing)
      try {
        await fetch(`${apiBase}/api/measurement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadSave),
        });
      } catch (_err) {
        // ignore save errors
        void _err;
      }

      // Build feature array in common PIMA diabetes order used in many datasets
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

      const mlRes = await fetch(`${apiBase}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "diabetes", input: features }),
      });

      const data = await mlRes.json().catch(() => null);
      if (!mlRes.ok) {
        setResult({ error: data || `ML error: ${mlRes.status}` });
      } else {
        const body = data?.body || data;
        setResult({
          success: true,
          prediction: body?.prediction,
          features: body?.features || features,
        });
      }
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const isValid = Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen bg-[url('SyyLogo.png')]  from-yellow-50 via-orange-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="backdrop-blur-2xl text-gray-900 rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-center text-yellow-700 mb-6">
          Diabetes Risk Input
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pregnancies
            </label>
            <input
              name="Pregnancies"
              value={form.Pregnancies}
              onChange={handleChange}
              type="number"
              placeholder="e.g., 2"
            />
            {errors.Pregnancies && (
              <p className="text-red-500 text-sm">{errors.Pregnancies}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glucose
            </label>
            <input
              name="Glucose"
              value={form.Glucose}
              onChange={handleChange}
              type="number"
              placeholder="e.g., 148"
            />
            {errors.Glucose && (
              <p className="text-red-500 text-sm">{errors.Glucose}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Pressure
            </label>
            <input
              name="BloodPressure"
              value={form.BloodPressure}
              onChange={handleChange}
              type="number"
              placeholder="e.g., 72"
            />
            {errors.BloodPressure && (
              <p className="text-red-500 text-sm">{errors.BloodPressure}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skin Thickness
            </label>
            <input
              name="SkinThickness"
              value={form.SkinThickness}
              onChange={handleChange}
              type="number"
              placeholder="e.g., 35"
            />
            {errors.SkinThickness && (
              <p className="text-red-500 text-sm">{errors.SkinThickness}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insulin
            </label>
            <input
              name="Insulin"
              value={form.Insulin}
              onChange={handleChange}
              type="number"
              placeholder="e.g., 0"
            />
            {errors.Insulin && (
              <p className="text-red-500 text-sm">{errors.Insulin}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BMI
            </label>
            <input
              name="BMI"
              value={form.BMI}
              onChange={handleChange}
              step="0.1"
              type="number"
              placeholder="e.g., 33.6"
            />
            {errors.BMI && <p className="text-red-500 text-sm">{errors.BMI}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diabetes Pedigree Function
            </label>
            <input
              name="DiabetesPedigreeFunction"
              value={form.DiabetesPedigreeFunction}
              onChange={handleChange}
              step="0.001"
              type="number"
              placeholder="e.g., 0.627"
            />
            {errors.DiabetesPedigreeFunction && (
              <p className="text-red-500 text-sm">
                {errors.DiabetesPedigreeFunction}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              name="Age"
              value={form.Age}
              onChange={handleChange}
              type="number"
              placeholder="e.g., 50"
            />
            {errors.Age && <p className="text-red-500 text-sm">{errors.Age}</p>}
          </div>

          <div className="sm:col-span-2">
            {!isValid && !loading && (
              <p className="text-sm text-red-500 mb-2">
                Please fix fields before submitting.
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className={`w-full py-3 text-white rounded-lg ${
                !isValid || loading
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-yellow-600 to-pink-500"
              }`}
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>

          {result && (
            <div className="sm:col-span-2 mt-4 p-4 border rounded bg-gray-50">
              {result.error ? (
                <div className="text-red-600">
                  <strong>Error: </strong>
                  <span>{String(result.error)}</span>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-yellow-700">
                    Prediction
                  </h4>
                  <p className="text-md mb-3">
                    {result.prediction === 1 ? (
                      <span className="text-red-600 font-bold">
                        Positive (risk)
                      </span>
                    ) : (
                      <span className="text-green-600 font-bold">
                        Negative (no risk)
                      </span>
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

export default DiabeticsForm;
