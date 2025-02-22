import React from "react";
import { Link } from "react-router-dom";

const TopicCard = ({ topic }) => {
  // Ensure topic is not undefined or null
  if (!topic) {
    return <div>Loading...</div>; // Or show any fallback UI
  }

  // Subheadings information: Vacancies, Dates, and Compensation
  const subHeadings = [
    {
      title: "Vacancies",
      element: topic.vacancies || "Not Available", // Default value if vacancies are undefined
    },
    {
      title: "Dates",
      element: topic.dates || "Not Available", // Default value if dates are undefined
    },
    {
      title: "Compensation",
      element: topic.compensation || "Not Available", // Default value if compensation is undefined
    },
  ];

  return (
    <div className="m-4 box-border flex w-11/12 flex-col items-center justify-center rounded-b-lg rounded-t-3xl bg-secondary-color p-4 shadow-lg">
      {/* Topic Title Section */}
      <div className="w-full">
        <h2 className="bg-black-gradient bg-clip-text p-2 text-center font-title text-5xl font-extrabold text-transparent">
          {topic.title || "No Title"} {/* Default value for title */}
        </h2>
        <hr className="m-4 border-t border-gray-700" />
      </div>

      {/* Main Content Section */}
      <div className="flex h-full w-full flex-col sm:flex-row">
        {/* Author and Image Section */}
        <div className="h-full flex-grow p-4">
          <div className="mx-auto aspect-square w-1/2 overflow-hidden rounded-full bg-slate-400">
            {/* Placeholder for image, to be added in future */}
            {/* <img src={src} alt={alt} className="h-full w-full object-cover" /> */}
          </div>
          <h2 className="mt-2 text-center font-bold">
            {topic.author || "Unknown Author"}
          </h2>{" "}
          {/* Default author */}
          <h3 className="text-center">
            {topic.authorTitle || "No Title"}
          </h3>{" "}
          {/* Default author title */}
        </div>

        {/* Topic Details Section: Displays information about Vacancies, Dates, and Compensation */}
        <div className="flex h-5/6 flex-grow-3 flex-col justify-center p-4">
          <div className="font- mt-4 flex-grow-3">
            {subHeadings.map((subHeading, index) => (
              <p key={index} className="text-2xl">
                <span className="font-title font-bold">
                  {subHeading.title}:
                </span>{" "}
                {subHeading.element}
              </p>
            ))}
          </div>

          {/* Tags Section: Displays tags related to the topic */}
          <div className="mt-4 flex-grow">
            <span className="font-title font-bold">Tags:</span>{" "}
            <ul className="list-inside list-disc">
              {topic.tags && topic.tags.length > 0 ? (
                topic.tags.map((tag, index) => <li key={index}>{tag}</li>)
              ) : (
                <li>No tags available</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* View Topic Button: Directs to detailed topic page */}
      <button className="w-fit transform rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50">
        <Link to="/topic" className="flex items-center space-x-2">
          <span>View Topic</span>
        </Link>
      </button>
    </div>
  );
};

export default TopicCard;
