import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Contact = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Name is required.";

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.message.trim()) {
      nextErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      nextErrors.message = "Message should be at least 10 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (submitted) setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-b from-cyan-50 via-white to-sky-100"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
        <section
          className={`relative overflow-hidden rounded-3xl border px-6 py-10 shadow-xl md:px-10 ${
            isDark
              ? "border-slate-700 bg-slate-900/70 text-slate-100"
              : "border-slate-200 bg-white/90 text-slate-800"
          }`}
        >
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -left-12 -bottom-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
            <article>
              <p className="inline-flex rounded-full bg-cyan-500/15 px-4 py-1 text-sm font-semibold text-cyan-500">
                Contact Care Team
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                Let us help you stay connected to better care
              </h1>
              <p
                className={`mt-5 max-w-xl text-base leading-7 md:text-lg ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Have questions about remote monitoring, appointments, or patient
                support? Share your details and our team will respond quickly
                with the right guidance.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Response Time", value: "Within 24 hours" },
                  { label: "Support", value: "24/7 available" },
                  { label: "Coverage", value: "Patient and provider support" },
                  { label: "Priority", value: "Urgent care-first triage" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl border p-4 ${
                      isDark
                        ? "border-slate-700 bg-slate-800/60"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="text-sm text-cyan-500">{item.label}</p>
                    <p className="mt-1 font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </article>

            <form
              onSubmit={handleSubmit}
              noValidate
              className={`rounded-2xl border p-6 shadow-lg md:p-8 ${
                isDark
                  ? "border-slate-700 bg-slate-900/85"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h2 className="text-xl font-bold">Send us a message</h2>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Fields marked with <span className="text-red-500">*</span> are
                required.
              </p>

              {submitted && (
                <div
                  className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? "border-emerald-600/50 bg-emerald-500/15 text-emerald-300"
                      : "border-emerald-300 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  Thanks, we received your message and will contact you shortly.
                </div>
              )}

              <div className="mt-5 space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={`w-full rounded-lg border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-red-400 focus:ring-red-400/40"
                        : isDark
                          ? "border-slate-600 bg-slate-800 text-slate-100 focus:ring-cyan-500/40"
                          : "border-slate-300 bg-white text-slate-900 focus:ring-cyan-500/30"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full rounded-lg border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-400 focus:ring-red-400/40"
                        : isDark
                          ? "border-slate-600 bg-slate-800 text-slate-100 focus:ring-cyan-500/40"
                          : "border-slate-300 bg-white text-slate-900 focus:ring-cyan-500/30"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message..."
                    className={`w-full resize-none rounded-lg border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                      errors.message
                        ? "border-red-400 focus:ring-red-400/40"
                        : isDark
                          ? "border-slate-600 bg-slate-800 text-slate-100 focus:ring-cyan-500/40"
                          : "border-slate-300 bg-white text-slate-900 focus:ring-cyan-500/30"
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Submit Message
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
