import React from "react";
import { useTheme } from "../context/ThemeContext";

const Hospital = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hospitalFeatures = [
    {
      title: "Real-Time Ward Insights",
      description:
        "Track vital signs and patient status updates from one live dashboard.",
    },
    {
      title: "Faster Clinical Response",
      description:
        "Priority alerts help teams act early and reduce avoidable escalations.",
    },
    {
      title: "Connected Teams",
      description:
        "Doctors, nurses, and remote specialists collaborate from a shared workspace.",
    },
    {
      title: "Scalable Operations",
      description:
        "Designed for hospitals of all sizes with flexible deployment models.",
    },
  ];

  const outcomes = [
    "Improve continuity of care from admission to discharge",
    "Reduce manual monitoring workload for care teams",
    "Enable safe remote follow-ups after hospital visits",
    "Support quality initiatives with actionable analytics",
  ];

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-b from-slate-50 via-white to-cyan-50"
      }`}
    >
      <section className="relative min-h-[78vh] w-full overflow-hidden">
        <img
          src="/hospital.png"
          alt="Hospital team using a digital care system"
          className="h-full min-h-[78vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/35" />

        <div className="absolute inset-0 mx-auto flex h-full max-w-7xl items-end px-6 pb-14 md:px-10 md:pb-20">
          <div className="max-w-2xl text-white">
            <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1 text-sm font-semibold backdrop-blur">
              Hospital Care
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
              Put progress into practice.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-100 md:text-lg">
              Empower clinicians with connected tools that improve response
              time, streamline workflows, and deliver better patient outcomes
              across every shift.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/contact"
                className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-transform duration-300 hover:-translate-y-0.5"
              >
                Request a Demo
              </a>
              <a
                href="/book-appointment"
                className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors duration-300 hover:bg-white/20"
              >
                Book Appointment
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <section
          className={`rounded-3xl border p-7 md:p-10 ${
            isDark
              ? "border-slate-700 bg-slate-900/70 text-slate-100"
              : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <article>
              <h2 className="text-3xl font-bold md:text-4xl">
                Why Hospitals Choose HealthLink
              </h2>
              <p
                className={`mt-4 leading-7 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                HealthLink helps care teams work smarter, connect seamlessly
                with patients, and deliver safer, more personalized care in
                hospitals, clinics, and hybrid care programs.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Clinical uptime", value: "99.9%" },
                  { label: "Avg. alert acknowledgment", value: "< 5 min" },
                  { label: "Integrated departments", value: "20+" },
                  { label: "Care model", value: "In-person + Remote" },
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

            <article className="overflow-hidden rounded-2xl">
              <img
                src="/hospital2.png"
                alt="Clinical operations running continuously"
                className="h-full min-h-72 w-full object-cover"
              />
            </article>
          </div>
        </section>

        <section className="mt-12">
          <h2
            className={`text-2xl font-bold md:text-3xl ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Built for Modern Hospital Workflows
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {hospitalFeatures.map((item) => (
              <article
                key={item.title}
                className={`rounded-2xl border p-6 transition-transform duration-300 hover:-translate-y-1 ${
                  isDark
                    ? "border-slate-700 bg-slate-900/70 text-slate-100"
                    : "border-slate-200 bg-white text-slate-800"
                }`}
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p
                  className={`mt-3 text-sm leading-6 ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className={`mt-12 rounded-3xl border p-7 md:p-10 ${
            isDark
              ? "border-slate-700 bg-slate-900/70 text-slate-100"
              : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <article>
              <h2 className="text-2xl font-bold md:text-3xl">
                On the go. Around the clock.
              </h2>
              <p
                className={`mt-4 leading-7 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Keep care continuous with tools that support shift changes,
                off-hours monitoring, and coordinated response across teams.
              </p>
            </article>

            <ul
              className={`space-y-3 text-sm md:text-base ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              {outcomes.map((item) => (
                <li
                  key={item}
                  className={`rounded-xl border p-4 ${
                    isDark
                      ? "border-slate-700 bg-slate-800/60"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Hospital;
