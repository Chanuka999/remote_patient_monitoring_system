import React from "react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 transform transition-all duration-300 hover:shadow-xl">
        <form className="space-y-6">
          <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Create Your Account
          </h2>

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-indigo-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition duration-200 bg-indigo-50 placeholder-gray-400"
              placeholder="Enter your name"
              required
              // onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-indigo-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition duration-200 bg-indigo-50 placeholder-gray-400"
              placeholder="Enter your email"
              required
              // onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-indigo-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition duration-200 bg-indigo-50 placeholder-gray-400"
              placeholder="Enter your password"
              required
              // onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="role"
              className="text-sm font-medium text-indigo-700"
            >
              Role
            </label>
            <input
              id="role"
              type="text"
              name="role"
              className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition duration-200 bg-indigo-50 placeholder-gray-400"
              placeholder="Enter your role"
              required
              // onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="number"
              className="text-sm font-medium text-indigo-700"
            >
              Phone Number
            </label>
            <input
              id="number"
              type="tel"
              name="number"
              className="border border-indigo-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition duration-200 bg-indigo-50 placeholder-gray-400"
              placeholder="Enter your phone number"
              required
              // onChange={(e) => setNumber(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-600 font-medium hover:text-purple-800 transition duration-200 underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
