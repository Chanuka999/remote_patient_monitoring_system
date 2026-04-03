import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SectionSidebar from "./SectionSidebar";

const Settings = () => {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [profileImageDraft, setProfileImageDraft] = useState(null);
  const [imageActionMessage, setImageActionMessage] = useState("");
  const [isSavingImage, setIsSavingImage] = useState(false);

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
        setProfileImageDraft(null);
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

  const displayName = currentUser?.name?.trim() || "Unknown User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const formattedDob = useMemo(() => {
    const raw = currentUser?.dateOfBirth;
    if (!raw) return "N/A";
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return raw;
    return dt.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }, [currentUser?.dateOfBirth]);

  const userFields = [
    { label: "Email", value: currentUser?.email || "N/A" },
    { label: "Phone", value: currentUser?.number || "N/A" },
    {
      label: "Role",
      value: currentUser?.role
        ? `${currentUser.role.charAt(0).toUpperCase()}${currentUser.role.slice(1)}`
        : "N/A",
    },
    {
      label: "Gender",
      value: currentUser?.gender
        ? `${currentUser.gender.charAt(0).toUpperCase()}${currentUser.gender.slice(1)}`
        : "N/A",
    },
    { label: "Date of Birth", value: formattedDob },
    { label: "Address", value: currentUser?.address || "N/A", wide: true },
  ];

  const activeImageUrl =
    profileImageDraft !== null
      ? profileImageDraft
      : currentUser?.imageUrl || "";

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageActionMessage("Please select a valid image file.");
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setImageActionMessage(
        "Image is too large. Please use an image under 2MB.",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileImageDraft(result);
      setImageActionMessage(
        "Image selected. Click Save Image to update your profile.",
      );
    };
    reader.onerror = () => {
      setImageActionMessage(
        "Unable to read selected image. Please try another file.",
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setImageActionMessage("Your session has expired. Please log in again.");
      return;
    }

    const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    const endpoints = [`${apiBase}/me`, `${apiBase}/api/users/me`];

    setIsSavingImage(true);
    setImageActionMessage("");

    try {
      let updatedUser = null;
      let lastFailure = "Failed to update profile image";

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify({ imageUrl: activeImageUrl }),
          });

          const result = await response.json();
          if (response.ok && result?.success && result?.data) {
            updatedUser = result.data;
            break;
          }

          lastFailure = result?.message || lastFailure;
        } catch {
          // try next endpoint
        }
      }

      if (!updatedUser) {
        throw new Error(lastFailure);
      }

      setCurrentUser(updatedUser);
      setProfileImageDraft(null);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setImageActionMessage(
        activeImageUrl
          ? "Profile image updated successfully."
          : "Profile image removed successfully.",
      );
    } catch (error) {
      setImageActionMessage(error.message || "Failed to update profile image");
    } finally {
      setIsSavingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#2563eb22,_transparent_35%),radial-gradient(circle_at_bottom_right,_#0ea5e922,_transparent_35%),linear-gradient(150deg,#020617,#0f172a_40%,#1e3a8a)] py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] items-start">
          <SectionSidebar />

          <div className="space-y-6">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">
                  Account Center
                </p>
                <h1 className="text-4xl font-black text-white mt-2">
                  My Profile
                </h1>
                <p className="text-slate-300 mt-2">
                  Review and manage your personal details
                </p>
              </div>
              <Link
                to={dashboardPath}
                className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition border border-white/20"
              >
                Back to Dashboard
              </Link>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {errorMessage}
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
                <aside className="p-8 bg-gradient-to-b from-sky-500/20 to-cyan-500/10 border-b lg:border-b-0 lg:border-r border-white/10">
                  <div className="mx-auto w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden shadow-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                    {activeImageUrl ? (
                      <img
                        src={activeImageUrl}
                        alt={`${displayName} profile`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-black text-white">
                        {initials || "U"}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 text-center">
                    <h2 className="text-2xl font-extrabold text-white">
                      {displayName}
                    </h2>
                    <p className="mt-1 text-sky-100">
                      {currentUser?.email || "No email available"}
                    </p>
                  </div>

                  <div className="mt-6 rounded-2xl bg-white/10 border border-white/15 p-4 text-sm text-sky-50">
                    <p className="font-semibold">Profile Image</p>
                    <p className="mt-1 text-sky-100/90">
                      {activeImageUrl
                        ? "Custom profile image is active"
                        : "No uploaded image yet. Showing avatar from your initials."}
                    </p>

                    <div className="mt-4 space-y-3">
                      <label className="block text-xs uppercase tracking-wide text-sky-200">
                        Choose Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="block w-full text-xs text-sky-50 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400/80 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-950 hover:file:bg-cyan-300"
                      />

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleSaveImage}
                          disabled={isSavingImage}
                          className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-400 transition disabled:opacity-60"
                        >
                          {isSavingImage ? "Saving..." : "Save Image"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileImageDraft("");
                            setImageActionMessage(
                              "Image removed from preview. Click Save Image to confirm.",
                            );
                          }}
                          className="rounded-lg bg-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-white/25 transition"
                        >
                          Remove
                        </button>
                      </div>

                      {imageActionMessage && (
                        <p className="text-xs text-sky-100/90">
                          {imageActionMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </aside>

                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">
                      User Information
                    </h3>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                      Active Account
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userFields.map((field) => (
                      <div
                        key={field.label}
                        className={`rounded-2xl border border-white/10 bg-slate-950/35 p-4 ${field.wide ? "md:col-span-2" : ""}`}
                      >
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          {field.label}
                        </p>
                        <p className="mt-2 text-base md:text-lg text-white font-semibold whitespace-pre-wrap break-words">
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
