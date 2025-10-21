import React from "react";

const Contact = () => {
  return (
    <div className="bg-gray-50">
      <div className="flex text-2xl p-6 mt-4 font-bold">
        <h1>Contact us</h1>
      </div>
      <div className="flex flex-col gap-[10px] px-4 ">
        <p>
          If your message relates to queries about content usage, profile
          management, career opportunities and content contributions, please
          refer to our Help Centre, this will most likely have the answer for
          you. Otherwise, you can contact us using the form below.
        </p>

        <p>
          Please complete the form below to contact us. We will do our best to
          get back to you as soon as possible!
        </p>
      </div>

      <div class="min-h-screen  flex items-center justify-center bg-gradient-to-br p-6 bg-gray-50">
        <form class="bg-gray-300 shadow-lg rounded-2xl p-8 w-full max-w-md space-y-6">
          <h2 class="text-gray-700 text-lg font-medium text-center">
            Fields marked with <span class="text-red-500 font-bold">*</span> are
            required
          </h2>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">
              Message <span class="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              placeholder="Write your message..."
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            ></textarea>
          </div>

          <button
            type="submit"
            class="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
