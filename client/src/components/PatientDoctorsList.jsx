import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PatientDoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const apiBase = import.meta.env.VITE_BACKEND_URL || "";
        const response = await fetch(`${apiBase}/api/doctors`);
        const result = await response.json();
        if (!response.ok) throw new Error(result?.message || "Failed to load doctors");
        setDoctors(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        setError(err.message || "Unable to fetch doctor information right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading doctors...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Select a Doctor to Book Appointment</h2>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            className="rounded-2xl border p-6 shadow hover:shadow-lg transition cursor-pointer bg-white hover:bg-sky-50"
            onClick={() => navigate(`/book-appointment?doctorId=${encodeURIComponent(doctor._id)}`)}
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={doctor.image || "/default-doctor.png"}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div>
                <h3 className="text-lg font-bold">{doctor.name}</h3>
                <p className="text-sm text-gray-500">{doctor.specialization}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">{doctor.email}</p>
            <p className="text-xs text-gray-400">{doctor._id}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientDoctorsList;
