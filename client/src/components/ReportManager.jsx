import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const ReportManager = ({ patientId = null, isDoctor = false }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // New Report State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = isDoctor 
        ? `${API_BASE}/api/reports/patient/${patientId}`
        : `${API_BASE}/api/reports/my-reports`;
      
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [patientId, isDoctor]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/reports/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setReports([data.data, ...reports]);
        setTitle("");
        setDescription("");
        setFile(null);
        // Reset file input
        e.target.reset();
      } else {
        setError(data.message || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/reports/${reportId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setReports(reports.filter(r => r._id !== reportId));
      }
    } catch (err) {
      setError("Delete failed");
    }
  };

  return (
    <div className={`rounded-3xl border p-6 ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Lab Reports & Documents</h3>
        <button 
          onClick={fetchReports}
          className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition`}
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {!isDoctor && (
        <form onSubmit={handleUpload} className="mb-8 p-6 rounded-2xl border border-dashed border-sky-500/50 bg-sky-500/5">
          <h4 className="font-bold mb-4">Upload New Report</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <input 
              type="text"
              placeholder="Report Title (e.g. Blood Test - Mar 2024)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`rounded-xl border px-4 py-2 text-sm outline-none ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
              required
            />
            <input 
              type="file"
              onChange={handleFileChange}
              className={`text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600`}
              accept=".pdf,image/*"
              required
            />
          </div>
          <textarea 
            placeholder="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`mt-4 w-full rounded-xl border px-4 py-2 text-sm outline-none min-h-[80px] ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
          />
          <button 
            type="submit"
            disabled={uploading}
            className="mt-4 w-full rounded-xl bg-sky-500 py-2.5 text-sm font-bold text-white transition hover:bg-sky-600 disabled:bg-slate-500"
          >
            {uploading ? "Uploading..." : "Upload Report"}
          </button>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </form>
      )}

      {loading ? (
        <div className="py-10 text-center">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="py-10 text-center text-slate-500 italic">No reports found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((report) => (
            <div 
              key={report._id}
              className={`p-4 rounded-2xl border transition hover:shadow-md ${isDark ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate" title={report.title}>{report.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {report.fileType.toUpperCase()} • {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  {report.description && (
                    <p className="text-xs mt-2 line-clamp-2 text-slate-400">{report.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <a 
                    href={`${API_BASE}${report.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600"
                    title="View"
                  >
                    👁️
                  </a>
                  {!isDoctor && (
                    <button 
                      onClick={() => handleDelete(report._id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 text-xs hover:bg-red-500/20"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportManager;
