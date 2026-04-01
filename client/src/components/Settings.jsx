import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if ((!localUser.id && !localUser._id) || !token) {
      navigate("/login");
      return;
    }

    const fetchLoggedUser = async () => {
      try {
        const authHeader = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;

        // Current backend mounts user router at root, so `/me` is the primary endpoint.
        // Keep `/api/users/me` as a fallback for compatibility.
        const endpoints = [`${apiBase}/me`, `${apiBase}/api/users/me`];

        let loadedUser = null;
        let lastErrorMessage = "Failed to load user profile";

        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              headers: { Authorization: authHeader },
            });

            const result = await response.json();

            if (response.ok && result?.success && result?.data) {
              loadedUser = result.data;
              break;
            }

            lastErrorMessage = result?.message || lastErrorMessage;
          } catch {
            // Try next endpoint
          }
        }

        if (!loadedUser) {
          throw new Error(lastErrorMessage);
        }

        setCurrentUser(loadedUser);
        localStorage.setItem("user", JSON.stringify(loadedUser));
      } catch (error) {
        setErrorMessage(error.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchLoggedUser();
  }, [apiBase, navigate]);

  const dashboardPath = useMemo(() => {
    if (currentUser?.role === "doctor") return "/doctorDashboard";
    if (currentUser?.role === "patient") return "/patientDashboard";
    return "/dashboard";
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-slate-300">
              Logged-in user data from the database
            </p>
          </div>
          <Link
            to={dashboardPath}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-600 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">User Information</h2>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">
                  Full Name
                </p>
                <p className="text-lg text-slate-900 font-bold">
                  {currentUser?.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">
                  Email
                </p>
                <p className="text-lg text-slate-900 font-bold">
                  {currentUser?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">
                  Role
                </p>
                <p className="text-lg text-slate-900 font-bold capitalize">
                  {currentUser?.role || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">
                  Phone Number
                </p>
                <p className="text-lg text-slate-900 font-bold">
                  {currentUser?.number || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">
                  Date of Birth
                </p>
                <p className="text-lg text-slate-900 font-bold">
                  {currentUser?.dateOfBirth || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">
                  Gender
                </p>
                <p className="text-lg text-slate-900 font-bold capitalize">
                  {currentUser?.gender || "N/A"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-slate-500 mb-1">
                  Address
                </p>
                <p className="text-lg text-slate-900 font-bold whitespace-pre-wrap">
                  {currentUser?.address || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
