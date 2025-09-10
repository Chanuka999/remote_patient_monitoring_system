import React from "react";

function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-400 via-purple-700 to-purple-900 text-white py-16 shadow-lg">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
          About Remote Patient Monitoring System
        </h1>
        <p className="mt-4 text-lg md:text-xl text-pink-100 max-w-2xl mx-auto">
          Empowering Chronic Disease Management with Cutting-Edge Technology
        </p>
      </div>
    </header>
  );
}

function Section({
  title,
  children,
  imageUrl,
  imageAlt,
  videoUrl,
  videoPoster,
}) {
  return (
    <section className="py-16 px-6 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-10 p-6 rounded-2xl shadow-lg bg-white bg-opacity-90 backdrop-blur-md border border-gray-200 hover:shadow-2xl transition-shadow duration-500">
        {/* Show Video if videoUrl exists */}
        {videoUrl ? (
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-500">
            <video
              src={videoUrl}
              poster={videoPoster}
              controls
              className="w-full h-64 object-cover"
            />
          </div>
        ) : imageUrl ? (
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-500">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-64 object-cover"
            />
          </div>
        ) : null}

        <div className={imageUrl || videoUrl ? "md:w-1/2" : "w-full"}>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-700 to-purple-900 mb-6">
            {title}
          </h2>
          <div className="text-gray-700 leading-relaxed text-lg">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureList({ items }) {
  return (
    <ul className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {items.map((item, index) => (
        <li
          key={index}
          className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 shadow-md hover:shadow-xl transition duration-500 border border-blue-200"
        >
          <span className="font-semibold text-blue-600 text-lg">
            {item.title}:
          </span>
          <p className="text-gray-700 mt-1">{item.description}</p>
        </li>
      ))}
    </ul>
  );
}

const About = () => {
  const features = [
    {
      title: "Real-Time Data Collection",
      description:
        "Patients use FDA-approved devices like blood pressure cuffs and glucose monitors to track vital signs.",
    },
    {
      title: "Seamless Data Transmission",
      description:
        "Data is securely transmitted to our cloud platform via cellular or Bluetooth.",
    },
    {
      title: "Proactive Alerts",
      description:
        "Customizable thresholds trigger alerts for care teams to enable early intervention.",
    },
    {
      title: "Patient Empowerment",
      description:
        "User-friendly interface for patients to monitor health and access resources.",
    },
    {
      title: "EHR Integration",
      description:
        "Seamless integration with electronic health records for streamlined workflows.",
    },
    {
      title: "24/7 Support",
      description:
        "Round-the-clock clinical support via text, phone, or video.",
    },
  ];

  const benefits = [
    {
      title: "Improved Health Outcomes",
      description:
        "Early detection reduces emergency visits and hospital readmissions.",
    },
    {
      title: "Cost-Effective Care",
      description: "Minimizes hospital visits and optimizes treatment plans.",
    },
    {
      title: "Enhanced Accessibility",
      description:
        "High-quality care for patients in rural or underserved areas.",
    },
    {
      title: "Data-Driven Decisions",
      description: "Daily insights for clinicians to adjust treatments.",
    },
    {
      title: "Reduced Burden",
      description:
        "Eases pressure on hospitals with efficient home-based care.",
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main>
        <Section
          title="Our Mission"
          videoUrl="https://v.ftcdn.net/02/18/59/48/700_F_218594849_xyzWrd4fBAqjVuYLJ07HN56YhezJe4US_ST.mp4"
          videoPoster="https://images.unsplash.com/photo-1576091160399-1123a8340d3f?auto=format&fit=crop&w=800&q=80"
        >
          <p>
            At{" "}
            <span className="font-semibold text-blue-600">
              [Your Company Name]
            </span>
            , we are dedicated to transforming chronic disease management
            through innovative remote patient monitoring (RPM) solutions. Our
            mission is to empower patients, enhance healthcare delivery, and
            improve outcomes for individuals living with chronic conditions like
            diabetes, hypertension, heart failure, and COPD.
          </p>
        </Section>

        <Section title="Why Remote Patient Monitoring?">
          <p>
            Chronic diseases account for over{" "}
            <span className="font-bold text-red-500">70% of deaths</span>{" "}
            worldwide and cost trillions annually. Our RPM system enables
            continuous, real-time health monitoring outside clinical settings,
            bridging the gap between patients and providers for timely
            interventions and personalized care.
          </p>
        </Section>

        <Section
          title="What We Offer"
          imageUrl="https://media.istockphoto.com/id/1363170016/photo/smartwatch-for-assisted-living-a-woman-from-the-medical-health-system-wears-a-smartwatch-for.jpg?s=612x612&w=0&k=20&c=BgQOOTLKRTGnA9cv9et0iQqLwuEm5z-3lck9b1VjsOQ="
          imageAlt="Medical devices for remote monitoring"
        >
          <p>
            Our state-of-the-art RPM system supports patients with chronic
            diseases through:
          </p>
          <FeatureList items={features} />
        </Section>

        <Section title="Benefits for Patients and Providers">
          <FeatureList items={benefits} />
        </Section>

        <Section title="Our Commitment to Quality">
          <p>
            We prioritize patient safety, data security, and clinical accuracy.
            Our devices meet{" "}
            <span className="text-green-600 font-semibold">FDA standards</span>,
            and our platform complies with{" "}
            <span className="text-blue-600 font-semibold">
              HIPAA regulations
            </span>
            . We collaborate with healthcare providers and patients to ensure
            our system meets the evolving needs of chronic disease management.
          </p>
        </Section>

        <Section title="Who We Serve">
          <ul className="list-disc pl-6 space-y-3 mt-4 text-gray-700">
            <li>
              Patients with chronic conditions such as diabetes, hypertension,
              heart failure, COPD, and certain cancers.
            </li>
            <li>
              Healthcare providers seeking to enhance chronic care management.
            </li>
            <li>
              Employers and health systems aiming to reduce costs and improve
              wellness.
            </li>
          </ul>
        </Section>

        <Section title="Why Choose Us?">
          <ul className="list-disc pl-6 space-y-3 mt-4 text-gray-700">
            <li>
              <span className="font-semibold text-purple-600">
                Proven Impact:
              </span>{" "}
              RPM reduces hospital readmissions and improves adherence.
            </li>
            <li>
              <span className="font-semibold text-pink-600">
                Patient-Centered Approach:
              </span>{" "}
              Designed with input from patients and clinicians.
            </li>
            <li>
              <span className="font-semibold text-blue-600">
                Innovative Technology:
              </span>{" "}
              AI-driven analytics and user-friendly interfaces.
            </li>
            <li>
              <span className="font-semibold text-green-600">
                Scalable Solutions:
              </span>{" "}
              Adapts to individual practices or large health systems.
            </li>
          </ul>
        </Section>

        <Section
          title="Join Us in Revolutionizing Chronic Disease Care"
          imageUrl="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          imageAlt="Healthcare technology interface"
        >
          <p>
            At{" "}
            <span className="text-purple-600 font-semibold">
              [Your Company Name]
            </span>
            , we believe technology can transform lives. Our RPM system empowers
            patients and enables proactive care.
          </p>
          <a
            href="[Your Website URL]"
            className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-purple-400 via-purple-700 to-purple-900 text-white font-semibold rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-500"
          >
            Schedule a Demo
          </a>
        </Section>
      </main>
    </div>
  );
};

export default About;
