import React from "react";
import { useTheme } from "../context/ThemeContext";

const About = () => {
  const { theme } = useTheme();

  const careFlow = [
    {
      title: "Measure at home",
      description:
        "Patients use connected devices to capture blood pressure, glucose, and key daily indicators.",
    },
    {
      title: "Share securely",
      description:
        "Data is encrypted in transit and sent to the care platform in real time.",
    },
    {
      title: "Respond faster",
      description:
        "Smart thresholds and alerts help clinicians intervene before conditions worsen.",
    },
  ];

  const features = [
    {
      title: "Personalized dashboards",
      description: "Simple trend views make health data easy to understand.",
    },
    {
      title: "Care team collaboration",
      description:
        "Doctors, nurses, and caregivers can coordinate from one shared system.",
    },
    {
      title: "Clinical-grade alert engine",
      description:
        "Prioritizes what is urgent and reduces noise for providers.",
    },
    {
      title: "Always-on support",
      description:
        "Patients get timely guidance through chat, call, or follow-up.",
    },
  ];

  const benefits = [
    {
      title: "Better outcomes",
      description: "Early detection lowers emergency visits and readmissions.",
    },
    {
      title: "Lower cost of care",
      description: "Remote follow-up reduces avoidable in-person visits.",
    },
    {
      title: "Access anywhere",
      description: "Supports rural and underserved communities effectively.",
    },
    {
      title: "Data-driven decisions",
      description: "Clinicians adjust treatment using daily trend insights.",
    },
    {
      title: "Reduced workload",
      description: "Care teams focus on high-risk patients first.",
    },
  ];

  const isDark = theme === "dark";

  const sectionBg = isDark
    ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    : "bg-gradient-to-b from-sky-50 via-white to-cyan-50";

  const cardBg = isDark
    ? "bg-slate-900/70 border-slate-700 text-slate-100"
    : "bg-white/90 border-slate-200 text-slate-800";

  const mutedText = isDark ? "text-slate-300" : "text-slate-600";

  return (
    <div className={`min-h-screen ${sectionBg}`}>
      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-16">
        <section
          className={`relative overflow-hidden rounded-3xl border px-6 py-12 shadow-xl md:px-12 ${cardBg}`}
        >
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center rounded-full bg-cyan-500/15 px-4 py-1 text-sm font-semibold text-cyan-500">
                About Our Platform
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Remote Care That Feels
                <span className="block text-cyan-500">
                  Closer, Faster, Smarter
                </span>
              </h1>
              <p
                className={`mt-5 max-w-xl text-base leading-7 md:text-lg ${mutedText}`}
              >
                We help patients with chronic conditions stay connected to care
                teams from home through secure remote monitoring, real-time
                alerts, and easy-to-read health insights.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="/book-appointment"
                  className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Book an Appointment
                </a>
                <a
                  href="/contact"
                  className={`rounded-xl border px-5 py-3 text-sm font-semibold transition-colors duration-300 ${
                    isDark
                      ? "border-slate-500 text-slate-100 hover:bg-slate-800"
                      : "border-slate-300 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  Contact Care Team
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Patients Monitored", value: "10k+" },
                { label: "Alert Response", value: "< 5 min" },
                { label: "Care Availability", value: "24/7" },
              ].map((stat) => (
                <article
                  key={stat.label}
                  className={`rounded-2xl border p-5 backdrop-blur ${
                    isDark
                      ? "border-slate-700 bg-slate-800/60"
                      : "border-cyan-100 bg-white"
                  }`}
                >
                  <p className="text-2xl font-bold text-cyan-500">
                    {stat.value}
                  </p>
                  <p className={`mt-1 text-sm ${mutedText}`}>{stat.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <article className={`rounded-3xl border p-6 md:p-8 ${cardBg}`}>
            <h2 className="text-2xl font-bold md:text-3xl">Our Mission</h2>
            <p className={`mt-4 leading-7 ${mutedText}`}>
              We are transforming chronic disease management by making care
              proactive, personal, and continuous. Our system supports diabetes,
              hypertension, heart failure, and COPD programs with actionable
              clinical intelligence.
            </p>
            <ul className={`mt-5 space-y-3 text-sm md:text-base ${mutedText}`}>
              <li>Real-time trend tracking from home devices</li>
              <li>Early interventions through configurable risk alerts</li>
              <li>Stronger collaboration between patients and providers</li>
            </ul>
          </article>

          <article
            className={`overflow-hidden rounded-3xl border ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
              alt="Doctor reviewing patient data on a digital dashboard"
              className="h-full min-h-72 w-full object-cover"
            />
          </article>
        </section>

        <section className="mt-12">
          <h2
            className={`text-2xl font-bold md:text-3xl ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            How the Care Flow Works
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {careFlow.map((step, index) => (
              <article
                key={step.title}
                className={`rounded-2xl border p-6 ${cardBg}`}
              >
                <p className="text-sm font-semibold text-cyan-500">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p
                  className={`mt-3 text-sm leading-6 md:text-base ${mutedText}`}
                >
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <article className={`rounded-3xl border p-6 md:p-8 ${cardBg}`}>
            <h2 className="text-2xl font-bold md:text-3xl">What We Offer</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {features.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-xl border p-4 ${
                    isDark
                      ? "border-slate-700 bg-slate-800/50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${mutedText}`}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className={`rounded-3xl border p-6 md:p-8 ${cardBg}`}>
            <h2 className="text-2xl font-bold md:text-3xl">Benefits</h2>
            <div className="mt-5 space-y-4">
              {benefits.map((item) => (
                <div key={item.title} className="rounded-xl bg-cyan-500/10 p-4">
                  <h3 className="font-semibold text-cyan-500">{item.title}</h3>
                  <p className={`mt-1 text-sm leading-6 ${mutedText}`}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={`mt-12 rounded-3xl border p-6 md:p-10 ${cardBg}`}>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                Privacy and Quality First
              </h2>
              <p className={`mt-4 leading-7 ${mutedText}`}>
                Patient safety and trust are central to everything we build. Our
                workflows are designed for clinical reliability, secure data
                exchange, and consistent care quality at scale.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Encrypted data transfer",
                "Role-based access controls",
                "Clinical threshold customization",
                "Audit-friendly monitoring logs",
              ].map((item) => (
                <div
                  key={item}
                  className={`rounded-xl border p-4 text-sm ${
                    isDark
                      ? "border-slate-700 bg-slate-800/50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
