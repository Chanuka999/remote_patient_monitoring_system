import React from "react";
import patientImage from "../assets/patient.jpg";
import patientImage1 from "../assets/patient1.jpg";

const Home = () => {
  return (
    <div className="container mx-auto p-4">
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
