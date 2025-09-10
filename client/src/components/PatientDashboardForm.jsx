import React from "react";

const PatientDashboardForm = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-teal-100 to-purple-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          🩺 Patient Health Data Input
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Pressure - Systolic (mmHg)
            </label>
            <input
              type="number"
              name="systolic"
              required
              placeholder="e.g., 120"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Pressure - Diastolic (mmHg)
            </label>
            <input
              type="number"
              name="diastolic"
              required
              placeholder="e.g., 80"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heart Rate (bpm)
            </label>
            <input
              type="number"
              name="heartRate"
              required
              placeholder="e.g., 70"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Glucose Level (mg/dL)
            </label>
            <input
              type="number"
              name="glucoseLevel"
              required
              placeholder="e.g., 100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              name="temperature"
              required
              placeholder="e.g., 36.6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oxygen Saturation (SpO₂ %)
            </label>
            <input
              type="number"
              name="oxygenSaturation"
              required
              placeholder="e.g., 98"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <button
            type="button"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-teal-600 transition-all duration-300"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardForm;
