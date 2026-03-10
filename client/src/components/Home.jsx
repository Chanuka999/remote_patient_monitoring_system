import React from "react";
import { Link } from "react-router-dom";
import patientImage from "../assets/patient.jpg";
import patientImage1 from "../assets/patient1.jpg";
import medicalVideo from "../assets/medicalVideo.mp4";
import { useTheme } from "../context/ThemeContext";

const highlightCards = [
  {
    title: "Continuous Monitoring",
    text: "Track blood pressure, glucose, oxygen levels, and other key signals without complex workflows.",
    icon: "📈",
  },
  {
    title: "Faster Clinical Response",
    text: "Doctors can review alerts quickly and act before symptoms become critical.",
    icon: "🚑",
  },
  {
    title: "Simple Patient Experience",
    text: "Patients can share symptoms, book appointments, and stay connected from one place.",
    icon: "🤝",
  },
];

const journeySteps = [
  "Patients submit symptoms and daily measurements from home.",
  "The platform flags concerning patterns and organizes doctor review.",
  "Care teams respond with guidance, follow-up, and appointments.",
];

const Home = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div
          className={`overflow-hidden rounded-[28px] border ${
            isDark
              ? "border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(135deg,#020617,#0f172a_55%,#082f49)]"
              : "border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(135deg,#ffffff,#e0f2fe_55%,#f8fafc)]"
          }`}
        >
          <div className="grid gap-8 px-5 py-5 md:px-8 md:py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:py-10">
            <div className="space-y-6">
              <div
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${
                  isDark
                    ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/20"
                    : "bg-sky-100 text-sky-700 ring-1 ring-sky-200"
                }`}
              >
                Remote patient monitoring for doctors and patients
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Better care coordination without the usual dashboard clutter.
                </h1>
                <p
                  className={`max-w-2xl text-base leading-8 sm:text-lg ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  HealthLink helps patients share health data, symptoms, and
                  appointment needs in one clear flow, while doctors get faster
                  visibility into risk and follow-up actions.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 hover:bg-sky-600"
                >
                  Get Started
                </Link>
                <Link
                  to="/book-appointment"
                  className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                    isDark
                      ? "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                      : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  Book Appointment
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div
                  className={`rounded-2xl px-4 py-4 ${
                    isDark ? "bg-white/5" : "bg-white/80"
                  }`}
                >
                  <p className="text-2xl font-bold">24/7</p>
                  <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                    patient monitoring
                  </p>
                </div>
                <div
                  className={`rounded-2xl px-4 py-4 ${
                    isDark ? "bg-white/5" : "bg-white/80"
                  }`}
                >
                  <p className="text-2xl font-bold">Real-Time</p>
                  <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                    alert visibility
                  </p>
                </div>
                <div
                  className={`rounded-2xl px-4 py-4 ${
                    isDark ? "bg-white/5" : "bg-white/80"
                  }`}
                >
                  <p className="text-2xl font-bold">One Place</p>
                  <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                    for care actions
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-[24px] border border-black/10 shadow-2xl shadow-slate-950/20">
                <video
                  className="h-full max-h-[430px] w-full object-cover"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src={medicalVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div
                className={`grid gap-4 rounded-[24px] p-5 md:grid-cols-2 ${
                  isDark ? "bg-slate-900/70" : "bg-white/80"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
                    Why it works
                  </p>
                  <p
                    className={`mt-3 text-sm leading-7 ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Patients, doctors, alerts, and appointments are connected in
                    one simple workflow instead of scattered tools.
                  </p>
                </div>
                <div
                  className={`rounded-2xl px-4 py-4 ${
                    isDark ? "bg-slate-800" : "bg-slate-100"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    Built for chronic care
                  </p>
                  <p
                    className={`mt-2 text-sm leading-7 ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Helpful for ongoing monitoring, early intervention, and
                    better follow-up decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {highlightCards.map((card) => (
            <article
              key={card.title}
              className={`rounded-[24px] border p-6 transition hover:-translate-y-1 ${
                isDark
                  ? "border-slate-800 bg-slate-900 shadow-lg shadow-slate-950/30"
                  : "border-slate-200 bg-white shadow-lg shadow-slate-200/70"
              }`}
            >
              <div className="text-3xl">{card.icon}</div>
              <h2 className="mt-4 text-xl font-bold">{card.title}</h2>
              <p
                className={`mt-3 text-sm leading-7 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {card.text}
              </p>
            </article>
          ))}
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="overflow-hidden rounded-[26px]">
            <img
              src={patientImage}
              alt="Patient using connected healthcare support"
              className="h-full min-h-[320px] w-full object-cover"
            />
          </div>

          <div
            className={`rounded-[26px] border p-6 md:p-8 ${
              isDark
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
              Care Journey
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              A simpler path from symptom reporting to treatment.
            </h2>
            <div className="mt-6 space-y-4">
              {journeySteps.map((step, index) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p
                    className={`pt-1 text-base leading-7 ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div
            className={`rounded-[26px] border p-6 md:p-8 ${
              isDark
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
              Impact
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Better outcomes with clearer intervention priorities.
            </h2>
            <ul
              className={`mt-6 space-y-4 text-base leading-7 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              <li className="rounded-2xl border border-current/10 px-4 py-4">
                Chronic diseases drive a large share of long-term medical cost,
                so early detection and follow-up matter.
              </li>
              <li className="rounded-2xl border border-current/10 px-4 py-4">
                Structured remote monitoring supports faster escalation when a
                patient’s condition changes.
              </li>
              <li className="rounded-2xl border border-current/10 px-4 py-4">
                A connected system reduces friction for both patients and care
                teams.
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-[26px]">
            <img
              src={patientImage1}
              alt="Doctor and patient care support"
              className="h-full min-h-[320px] w-full object-cover"
            />
          </div>
        </section>

        <section
          className={`rounded-[28px] border px-6 py-8 text-center md:px-10 md:py-12 ${
            isDark
              ? "border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800"
              : "border-slate-200 bg-gradient-to-r from-sky-50 to-white"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
            Start Today
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Give patients a clearer experience and doctors faster insight.
          </h2>
          <p
            className={`mx-auto mt-4 max-w-2xl text-base leading-7 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Create an account, submit health information, or book an appointment
            to start using the platform in a more practical way.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Create Account
            </Link>
            <Link
              to="/contact"
              className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                isDark
                  ? "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                  : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
              }`}
            >
              Contact Support
            </Link>
          </div>
        </section>
      </section>
    </div>
  );
};

export default Home;
