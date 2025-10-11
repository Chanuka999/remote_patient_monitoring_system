import React from "react";
import { useParams, Link } from "react-router-dom";

const DETAILS = {
  heartDisease: {
    title: "Heart Disease",
    body: "Heart disease refers to several types of heart conditions. The most common is coronary artery disease which can lead to chest pain, heart attack, and other problems.",
  },
  diabetes: {
    title: "Diabetes",
    body: "Diabetes is a chronic condition that affects how your body turns food into energy. It can cause high blood sugar and long-term complications if unmanaged.",
  },
  hypertension: {
    title: "Hypertension (High Blood Pressure)",
    body: "Hypertension is when blood pressure is consistently too high. It increases risk of heart disease, stroke, and other health issues.",
  },
  asthma: {
    title: "Asthma",
    body: "Asthma is a condition in which your airways narrow and swell and may produce extra mucus — causing breathing difficulty and wheezing.",
  },
};

const SymptomDetail = () => {
  const { id } = useParams();
  const info = DETAILS[id];

  if (!info) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold">Unknown Symptom</h2>
          <p className="mt-2 text-sm text-gray-600">
            No information available.
          </p>
          <Link to="/Sympthoms" className="mt-4 inline-block text-blue-600">
            Back to Symptoms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/Sympthoms" className="hover:underline">
            Symptoms
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{info.title}</span>
        </nav>

        <header className="bg-white p-6 rounded shadow mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{info.title}</h1>
          <p className="mt-2 text-gray-600">{info.body}</p>

          <div className="mt-4 flex space-x-3">
            {id === "heartDisease" ? (
              <Link
                to="/patientDashboardForm"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enter health Data
              </Link>
            ) : id === "diabetes" ? (
              <Link
                to="/Diabetics"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enter health Data
              </Link>
            ) : id === "asthma" ? (
              <Link
                to="/asthma"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enter health Data
              </Link>
            ) : id === "hypertension" ? (
              <Link
                to="/hypertension"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enter health Data
              </Link>
            ) : (
              <Link
                to={`/Sympthoms/action/${id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enter health Data
              </Link>
            )}

            <Link
              to="/PatientDashboard"
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Open Dashboard
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="md:col-span-2 bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">About {info.title}</h3>
            <p className="text-gray-700 leading-relaxed">{info.body}</p>

            <div id="tips" className="mt-6">
              <h4 className="font-semibold">Self-care & tips</h4>
              <ul className="list-disc ml-5 mt-2 text-gray-700">
                <li>Keep a healthy diet and watch your weight.</li>
                <li>Stay physically active if your doctor approves.</li>
                <li>Follow medication instructions given by your provider.</li>
                <li>Seek immediate care for severe or worsening symptoms.</li>
              </ul>
            </div>
          </article>

          <aside className="bg-white p-6 rounded shadow">
            <h4 className="font-semibold">Quick facts</h4>
            <dl className="mt-3 text-sm text-gray-700">
              <div className="flex justify-between py-1">
                <dt>Prevalence</dt>
                <dd>Varies</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt>Typical care</dt>
                <dd>Primary care / specialist</dd>
              </div>
            </dl>
            <div className="mt-4">
              <Link to="/Sympthoms" className="text-blue-600 hover:underline">
                ◄ Back to Symptoms
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default SymptomDetail;
