import React from "react";

const Hospital = () => {
  return (
    <>
      <div className="flex bg-[url('hospital.png')] bg-cover min-h-screen w-full"></div>
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

      <div>
        <h1 className="text-4xl text-blue-700 bg-gray-300">
          On The Go.Arround the Clock
        </h1>
        <img src="./hospital2.png" className="w-full" alt="" />
      </div>
    </>
  );
};

export default Hospital;
