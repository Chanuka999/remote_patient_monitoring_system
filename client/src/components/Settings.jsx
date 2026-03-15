import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    number: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });

  // Doctor-specific Settings
  const [doctorSettings, setDoctorSettings] = useState({
    specialization: "",
    licenseNumber: "",
    experience: "",
    consultationFee: "",
    availableHours: {
      monday: { start: "09:00", end: "17:00", available: true },
      tuesday: { start: "09:00", end: "17:00", available: true },
      wednesday: { start: "09:00", end: "17:00", available: true },
      thursday: { start: "09:00", end: "17:00", available: true },
      friday: { start: "09:00", end: "17:00", available: true },
      saturday: { start: "09:00", end: "13:00", available: false },
      sunday: { start: "09:00", end: "13:00", available: false },
    },
  });

  // Patient-specific Settings
  const [patientSettings, setPatientSettings] = useState({
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: "",
    chronicConditions: "",
    medications: "",
  });

  // Security Settings
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    healthAlerts: true,
    messageNotifications: true,
  });

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    language: "en",
    theme: "light",
    timezone: "Asia/Colombo",
  });

  const apiBase = import.meta.env.VITE_BACKEND_URL || "";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);

    if (!user.id && !user._id) {
      navigate("/login");
      return;
    }

    // Fetch fresh profile data from DB
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBase}/api/users/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const result = await response.json();
        if (result.success && result.data) {
          const d = result.data;
          setProfileData({
            name: d.name || "",
            email: d.email || "",
            number: d.number || "",
            address: d.address || "",
            dateOfBirth: d.dateOfBirth || "",
            gender: d.gender || "",
          });
          // keep localStorage in sync
          localStorage.setItem("user", JSON.stringify({ ...user, ...d }));
        } else {
          // Fall back to localStorage values if API fails
          setProfileData({
            name: user.name || "",
            email: user.email || "",
            number: user.number || "",
            address: user.address || "",
            dateOfBirth: user.dateOfBirth || "",
            gender: user.gender || "",
          });
        }
      } catch {
        setProfileData({
          name: user.name || "",
          email: user.email || "",
          number: user.number || "",
          address: user.address || "",
          dateOfBirth: user.dateOfBirth || "",
          gender: user.gender || "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, apiBase]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBase}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Profile updated successfully!");
        // Update localStorage with server-confirmed values
        const serverData = result.data || profileData;
        const updatedUser = { ...currentUser, ...serverData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        if (result.data) {
          const d = result.data;
          setProfileData({
            name: d.name || "",
            email: d.email || "",
            number: d.number || "",
            address: d.address || "",
            dateOfBirth: d.dateOfBirth || "",
            gender: d.gender || "",
          });
        }
      } else {
        setErrorMessage(result.message || "Failed to update profile");
      }
    } catch (error) {
      setErrorMessage("Error updating profile");
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (securityData.newPassword !== securityData.confirmPassword) {
      setErrorMessage("New passwords do not match");
      setSaving(false);
      return;
    }

    if (securityData.newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      setSaving(false);
      return;
    }

    try {
      const userId = currentUser.id || currentUser._id;
      const response = await fetch(`${apiBase}/api/users/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Password changed successfully!");
        setSecurityData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setErrorMessage(result.message || "Failed to change password");
      }
    } catch (error) {
      setErrorMessage("Error changing password");
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Save notification preferences
      localStorage.setItem(
        "notificationSettings",
        JSON.stringify(notificationSettings),
      );
      setSuccessMessage("Notification preferences updated!");
    } catch {
      setErrorMessage("Error updating notification preferences");
    } finally {
      setSaving(false);
    }
  };

  const isDoctor = currentUser?.role === "doctor";
  const isPatient = currentUser?.role === "patient";

  const tabs = [
    { id: "profile", label: "👤 Profile", icon: "👤" },
    { id: "security", label: "🔒 Security", icon: "🔒" },
    { id: "notifications", label: "🔔 Notifications", icon: "🔔" },
    ...(isDoctor
      ? [{ id: "doctor", label: "👨‍⚕️ Doctor Settings", icon: "👨‍⚕️" }]
      : []),
    ...(isPatient
      ? [{ id: "patient", label: "🏥 Medical Info", icon: "🏥" }]
      : []),
    { id: "general", label: "⚙️ General", icon: "⚙️" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">⏳ Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-2">
              <span>⚙️ Settings</span>
            </h1>
            <p className="text-slate-300">
              Manage your account settings and preferences
            </p>
          </div>
          <Link
            to={
              isDoctor
                ? "/doctorDashboard"
                : isPatient
                  ? "/patientDashboard"
                  : "/dashboard"
            }
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-600 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
            <span>❌</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-white rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Settings Menu
            </h3>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition flex items-center space-x-3 ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label.replace(/^.+ /, "")}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">
                {tabs.find((t) => t.id === activeTab)?.label || "Settings"}
              </h2>
            </div>

            <div className="p-8">
              {/* Profile Settings Tab */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        👤 Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        📧 Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        📱 Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.number}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            number: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        🎂 Date of Birth
                      </label>
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            dateOfBirth: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        ⚧️ Gender
                      </label>
                      <select
                        value={profileData.gender}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            gender: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        🏠 Address
                      </label>
                      <textarea
                        value={profileData.address}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            address: e.target.value,
                          })
                        }
                        rows="3"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {saving ? "⏳ Saving..." : "💾 Save Profile"}
                    </button>
                  </div>
                </form>
              )}

              {/* Security Settings Tab */}
              {activeTab === "security" && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 mb-6">
                    <p className="text-slate-700">
                      🔒 <strong>Password Requirements:</strong> Minimum 6
                      characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      🔑 Current Password
                    </label>
                    <input
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) =>
                        setSecurityData({
                          ...securityData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      🔐 New Password
                    </label>
                    <input
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) =>
                        setSecurityData({
                          ...securityData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      ✅ Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) =>
                        setSecurityData({
                          ...securityData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {saving ? "⏳ Changing..." : "🔒 Change Password"}
                    </button>
                  </div>
                </form>
              )}

              {/* Notification Settings Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900">
                          📧 Email Notifications
                        </p>
                        <p className="text-sm text-slate-600">
                          Receive updates via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900">
                          📱 SMS Notifications
                        </p>
                        <p className="text-sm text-slate-600">
                          Receive alerts via SMS
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              smsNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900">
                          📅 Appointment Reminders
                        </p>
                        <p className="text-sm text-slate-600">
                          Get reminded about upcoming appointments
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.appointmentReminders}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              appointmentReminders: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900">
                          🚨 Health Alerts
                        </p>
                        <p className="text-sm text-slate-600">
                          Critical health monitoring alerts
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.healthAlerts}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              healthAlerts: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900">
                          💬 Message Notifications
                        </p>
                        <p className="text-sm text-slate-600">
                          New message alerts
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.messageNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              messageNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNotificationUpdate}
                      disabled={saving}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {saving ? "⏳ Saving..." : "💾 Save Preferences"}
                    </button>
                  </div>
                </div>
              )}

              {/* Doctor Settings Tab */}
              {activeTab === "doctor" && isDoctor && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        🩺 Specialization
                      </label>
                      <input
                        type="text"
                        value={doctorSettings.specialization}
                        onChange={(e) =>
                          setDoctorSettings({
                            ...doctorSettings,
                            specialization: e.target.value,
                          })
                        }
                        placeholder="e.g., Cardiologist, Pediatrician"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        📋 License Number
                      </label>
                      <input
                        type="text"
                        value={doctorSettings.licenseNumber}
                        onChange={(e) =>
                          setDoctorSettings({
                            ...doctorSettings,
                            licenseNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        📅 Years of Experience
                      </label>
                      <input
                        type="number"
                        value={doctorSettings.experience}
                        onChange={(e) =>
                          setDoctorSettings({
                            ...doctorSettings,
                            experience: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        💰 Consultation Fee (LKR)
                      </label>
                      <input
                        type="number"
                        value={doctorSettings.consultationFee}
                        onChange={(e) =>
                          setDoctorSettings({
                            ...doctorSettings,
                            consultationFee: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      🕐 Available Hours
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(doctorSettings.availableHours).map(
                        ([day, hours]) => (
                          <div
                            key={day}
                            className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                          >
                            <input
                              type="checkbox"
                              checked={hours.available}
                              onChange={(e) =>
                                setDoctorSettings({
                                  ...doctorSettings,
                                  availableHours: {
                                    ...doctorSettings.availableHours,
                                    [day]: {
                                      ...hours,
                                      available: e.target.checked,
                                    },
                                  },
                                })
                              }
                              className="w-5 h-5"
                            />
                            <span className="w-24 font-semibold text-slate-900 capitalize">
                              {day}
                            </span>
                            <input
                              type="time"
                              value={hours.start}
                              disabled={!hours.available}
                              onChange={(e) =>
                                setDoctorSettings({
                                  ...doctorSettings,
                                  availableHours: {
                                    ...doctorSettings.availableHours,
                                    [day]: { ...hours, start: e.target.value },
                                  },
                                })
                              }
                              className="px-3 py-2 border-2 border-slate-300 rounded-lg disabled:opacity-50"
                            />
                            <span>to</span>
                            <input
                              type="time"
                              value={hours.end}
                              disabled={!hours.available}
                              onChange={(e) =>
                                setDoctorSettings({
                                  ...doctorSettings,
                                  availableHours: {
                                    ...doctorSettings.availableHours,
                                    [day]: { ...hours, end: e.target.value },
                                  },
                                })
                              }
                              className="px-3 py-2 border-2 border-slate-300 rounded-lg disabled:opacity-50"
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSaving(true);
                        localStorage.setItem(
                          "doctorSettings",
                          JSON.stringify(doctorSettings),
                        );
                        setSuccessMessage("Doctor settings saved!");
                        setSaving(false);
                      }}
                      disabled={saving}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {saving ? "⏳ Saving..." : "💾 Save Doctor Settings"}
                    </button>
                  </div>
                </div>
              )}

              {/* Patient Settings Tab */}
              {activeTab === "patient" && isPatient && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 mb-6">
                    <p className="text-slate-700">
                      🏥 <strong>Medical Information:</strong> Your medical
                      details help us provide better care
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        🚨 Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        value={patientSettings.emergencyContact}
                        onChange={(e) =>
                          setPatientSettings({
                            ...patientSettings,
                            emergencyContact: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        📞 Emergency Phone Number
                      </label>
                      <input
                        type="tel"
                        value={patientSettings.emergencyPhone}
                        onChange={(e) =>
                          setPatientSettings({
                            ...patientSettings,
                            emergencyPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        🩸 Blood Type
                      </label>
                      <select
                        value={patientSettings.bloodType}
                        onChange={(e) =>
                          setPatientSettings({
                            ...patientSettings,
                            bloodType: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select Blood Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        🤧 Allergies
                      </label>
                      <input
                        type="text"
                        value={patientSettings.allergies}
                        onChange={(e) =>
                          setPatientSettings({
                            ...patientSettings,
                            allergies: e.target.value,
                          })
                        }
                        placeholder="e.g., Penicillin, Peanuts"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        🏥 Chronic Conditions
                      </label>
                      <textarea
                        value={patientSettings.chronicConditions}
                        onChange={(e) =>
                          setPatientSettings({
                            ...patientSettings,
                            chronicConditions: e.target.value,
                          })
                        }
                        placeholder="e.g., Diabetes, Hypertension"
                        rows="3"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        💊 Current Medications
                      </label>
                      <textarea
                        value={patientSettings.medications}
                        onChange={(e) =>
                          setPatientSettings({
                            ...patientSettings,
                            medications: e.target.value,
                          })
                        }
                        placeholder="List your current medications"
                        rows="3"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSaving(true);
                        localStorage.setItem(
                          "patientSettings",
                          JSON.stringify(patientSettings),
                        );
                        setSuccessMessage("Medical information saved!");
                        setSaving(false);
                      }}
                      disabled={saving}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {saving ? "⏳ Saving..." : "💾 Save Medical Info"}
                    </button>
                  </div>
                </div>
              )}

              {/* General Settings Tab */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      🌐 Language
                    </label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          language: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="si">Sinhala (සිංහල)</option>
                      <option value="ta">Tamil (தமிழ்)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      🎨 Theme
                    </label>
                    <select
                      value={generalSettings.theme}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          theme: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      🕐 Timezone
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          timezone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Asia/Colombo">
                        Sri Lanka (Asia/Colombo)
                      </option>
                      <option value="Asia/Kolkata">India (Asia/Kolkata)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">US Eastern</option>
                      <option value="Europe/London">UK (Europe/London)</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSaving(true);
                        localStorage.setItem(
                          "generalSettings",
                          JSON.stringify(generalSettings),
                        );
                        setSuccessMessage("General settings saved!");
                        setSaving(false);
                      }}
                      disabled={saving}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {saving ? "⏳ Saving..." : "💾 Save General Settings"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
