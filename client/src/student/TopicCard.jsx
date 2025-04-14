import React from "react";
import RegularButton from "../components/RegularButton";
import { useNavigate } from "react-router-dom";

// {
//   "topics": [
//     {
//       "topic_id": 1,
//       "title": "Software Engineer",
//       "description": "Develops software solutions for clients.",
//       "vacancies": 5,
//       "total_vacancies": 5,
//       "start_date": "2022-05-01",
//       "end_date": "2022-08-01",
//       "compensation": "$30/hr",
//       "creator_id": 2,
//       "status": "active",
//       "created_at": "2022-04-01T10:00:00Z",
//       "updated_at": "2022-04-05T12:00:00Z",
//       "creator_first_name": "John",
//       "creator_last_name": "Doe",
//       "creator_email": "john.doe@example.com",
//       "tags": ["Software", "Engineering", "Development"]
//     },
//     {
//       "topic_id": 2,
//       "title": "Data Scientist",
//       "description": "Analyzes data to provide insights for clients.",
//       "vacancies": 3,
//       "total_vacancies": 5,
//       "start_date": "2022-06-01",
//       "end_date": "2022-08-01",
//       "compensation": "$35/hr",
//       "creator_id": 3,
//       "status": "active",
//       "created_at": "2022-05-01T10:00:00Z",
//       "updated_at": "2022-05-05T12:00:00Z",
//       "creator_first_name": "Alice",
//       "creator_last_name": "Smith",
//       "creator_email": "alice.smith@example.com",
//       "tags": ["Data", "Science", "Analysis"]
//     }
//   ]
// }

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
            {/* <img src={src} alt={alt} className="h-full w-full object-cover" /> */}
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
      <RegularButton onClick={() => navigate(`/info/topic/${topic.topic_id}`)}>
        <span>View Topic</span>
      </RegularButton>
    </div>
  );
};

export default TopicCard;
