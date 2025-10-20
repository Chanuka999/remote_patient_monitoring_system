import React from "react";
import patientImage from "../assets/patient.jpg";
import patientImage1 from "../assets/patient1.jpg";
import medicalVideo from "../assets/medicalVideo.mp4";

const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <video
          className="w-full h-auto rounded-lg"
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

      <div className="flex justify-center items-center min-h-screen bg-gray-300 px-6">
        <p className="text-center text-2xl md:text-2xl leading-relaxed text-gray-800 max-w-4xl font-light">
          At <span className="font-semibold text-gray-900">HEALTHLINK</span>, we
          empower care teams to work smarter, connect with patients seamlessly,
          and drive innovation in medical research. Our technology helps
          healthcare professionals deliver more efficient and personalized care
          — whether in hospitals, clinics, or through remote consultations. By
          bridging the gap between patients and providers,
          <span className="font-semibold text-gray-900"> HEALTHLINK </span>{" "}
          transforms healthcare into an experience that’s more connected, more
          effective, and ultimately, more human.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 p-4">
          <h1 className="text-3xl font-bold mb-4">
            Shaping Tomorrow's Health: Fighting Chronic Diseases
          </h1>
          <p className="text-lg text-gray-700">
            Empowering individuals and communities with knowledge, innovation,
            and resources to prevent, manage, and overcome chronic diseases for
            a healthier future.
          </p>
        </div>
        <div className="md:w-1/2 p-4">
          <img
            src={patientImage}
            alt="patient"
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 p-4">
          <img
            src={patientImage1}
            alt="patient"
            className="w-full h-auto rounded-lg"
          />
        </div>
        <div className="md:w-1/2 p-4">
          <h1 className="text-3xl font-bold mb-4">
            Health and Economic Benefits of Chronic Disease Interventions
          </h1>
          <p className="text-lg text-gray-700">
            <ul>
              <li>
                Chronic diseases are the leading causes of illness, disability,
                and death in the world. They are also the leading drivers of our
                nation's $4.9 trillion in annual health care costs.
              </li>
              <li>
                {" "}
                CDC funds partners to use proven interventions that improve
                quality of life and save money.
              </li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
