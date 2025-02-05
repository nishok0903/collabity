import React from "react";
import { Link } from "react-router-dom";

const TopicInfo = () => {
  return (
    <div className="mx-auto my-4 w-4/5 rounded-lg border-4 border-black bg-white p-8 shadow-lg">
      <div className="topic-info">
        <h1 className="mb-6 text-4xl font-extrabold text-gray-800">
          Research Topic Name
        </h1>

        {/* Professor Info */}
        <div className="prof-info mb-6 flex items-center space-x-6">
          <img
            src="prof-photo-url"
            alt="Professor"
            className="h-20 w-20 rounded-full border-2 border-gray-200 shadow-md"
          />
          <div className="prof-details">
            <h2 className="text-2xl font-semibold text-gray-800">
              Professor Name
            </h2>
            <p className="text-lg text-gray-600">Professor Byline</p>
          </div>
        </div>

        {/* Research Topic Description */}
        <p className="mb-6 text-lg leading-relaxed text-gray-800">
          Description of the research topic. This section should provide a
          concise and clear overview of what the research is about and why it's
          important.
        </p>

        {/* Vacancies Information */}
        <p className="mb-6 text-lg text-gray-800">
          <span className="font-semibold">Vacancies:</span> Number of vacancies
        </p>

        {/* Document Link */}
        <p className="mb-6 text-lg text-blue-500">
          <span className="font-semibold">Document:</span>{" "}
          <a
            href="document-url"
            className="underline transition-all hover:text-blue-700"
          >
            Link to document
          </a>
        </p>

        {/* Requirements */}
        <p className="mb-6 text-lg text-gray-800">
          <span className="font-semibold">Requirements:</span> List of
          requirements
        </p>

        {/* Dates Information */}
        <div className="dates mb-6">
          <p className="text-lg text-gray-800">
            <span className="font-semibold">Start Date:</span> Start Date
          </p>
          <p className="text-lg text-gray-800">
            <span className="font-semibold">End Date:</span> End Date
          </p>
          <p className="text-lg text-gray-800">
            <span className="font-semibold">Duration:</span> Duration
          </p>
        </div>

        {/* Compensation Info */}
        <p className="mb-6 text-lg text-gray-800">
          <span className="font-semibold">Compensation:</span> Compensation
          details
        </p>

        {/* Tags */}
        <div className="tags mb-6">
          <p className="text-lg text-gray-800">
            <span className="font-semibold">Tags:</span> List of tags
          </p>
        </div>
        <div className="flex w-full justify-center">
          <button className="w-fit rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            <Link to="/">Apply</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicInfo;
