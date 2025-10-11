import React from "react";
import { useParams, Link } from "react-router-dom";

const TITLES = {
  heartDisease: "Heart Disease",
  diabetes: "Diabetes",
  hypertension: "Hypertension",
  asthma: "Asthma",
};

const SymptomAction = () => {
  const { id } = useParams();
  const title = TITLES[id] || "Symptom";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold">Next steps for {title}</h2>
        <p className="mt-3 text-gray-700">
          For <strong>{title}</strong>, please review recommended resources or
          contact your care provider. If you'd like to enter health data, use
          the links below as applicable.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            to="/Sympthoms"
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Back to Symptoms
          </Link>
          <Link
            to="/patientDashboardForm"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Enter Health Data
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SymptomAction;
