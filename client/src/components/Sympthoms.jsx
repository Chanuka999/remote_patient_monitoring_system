import React from "react";
import { Link } from "react-router-dom";

const AVAILABLE = [
  { id: "heartDisease", label: "Heart Disease" },
  { id: "diabetes", label: "Diabetes" },
  { id: "hypertension", label: "Hypertension" },
  { id: "asthma", label: "Asthma" },
];

const Sympthoms = () => {
  return (
    <div className="min-h-screen bg-[url('Slogo.jpg')] bg-cover from-white to-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Symptoms</h1>
          <p className="mt-2 text-white">
            Browse common health conditions and view details for each.
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          {AVAILABLE.map((s) => (
            <Link
              to={`/Sympthoms/${s.id}`}
              key={s.id}
              className="flex items-center p-5 backdrop-blur-2xl rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 border border-gray-100"
            >
              <div className="flex-shrink-0 mr-4">
                {/* simple icon */}
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 1.343-3 3v6h6v-6c0-1.657-1.343-3-3-3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 2v2"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {s.label}
                </h3>
                <p className="mt-1 text-sm text-white">
                  Tap to view causes, symptoms, and simple self-care tips.
                </p>
              </div>

              <div className="ml-4 text-gray-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </main>
      </div>
    </div>
  );
};

export default Sympthoms;
