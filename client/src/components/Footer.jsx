import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-500 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  About company
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  Hospital Software
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  Clinic Software
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Features
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  OPD & IPD Management
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  Doctor Portal
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Solutions
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  Patient Portal
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  EHR/EMR Software
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  Website for Hospital
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="tel:+177777777"
                  className="text-gray-300 hover:text-blue-600"
                >
                  +1 777-777-777
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@patientmanagement.com"
                  className="text-gray-300 hover:text-blue-600"
                >
                  info@patientmanagement.com
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-600">
                  Got a question? Need a quote?
                </a>
              </li>
            </ul>
          </div>
        </div>
        <hr className="border-gray-200 mt-8" />
      </div>
    </footer>
  );
};

export default Footer;
