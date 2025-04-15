import React from "react";
import RegularButton from "../components/RegularButton";
import { useNavigate } from "react-router-dom";

// Assuming a structure for the topic object that includes tags
const TopicCard = ({ topic }) => {
  const navigate = useNavigate();

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
      element:
        new Date(topic.start_date).toLocaleDateString() +
          " - " +
          new Date(topic.end_date).toLocaleDateString() || "Not Available", // Default value if dates are undefined
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
          </div>
          <h2 className="mt-2 text-center font-bold">
            {topic.creator_first_name + " " + topic.creator_last_name ||
              "Unknown Author"}
          </h2>{" "}
          {/* Default author */}
          <h3 className="text-center">
            {topic.creator_email || "No Title"}
          </h3>{" "}
          {/* Default author title */}
        </div>

        {/* Topic Details Section: Displays information about Vacancies, Dates, and Compensation */}
        <div className="flex h-5/6 flex-grow-3 flex-col justify-center p-4">
          <div className="mt-4 flex-grow-3">
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
            <div className="mt-2 flex flex-wrap gap-2">
              {topic.tags && topic.tags.length > 0 ? (
                topic.tags.map((tag, index) => (
                  <button
                    key={index}
                    className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 focus:outline-none"
                  >
                    {tag}
                  </button>
                ))
              ) : (
                <span>No tags available</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Topic Button: Directs to detailed topic page */}
      <RegularButton onClick={() => navigate(`/info/topic/${topic.topic_id}`)}>
        <span>View Topic</span>
      </RegularButton>
    </div>
  );
};

export default TopicCard;
