import React from "react";
import TopicCard from "./TopicCard";

let topics = [
  {
    id: 1,
    title: "Software Engineer",
    description: "Develops software solutions for clients.",
    vacancies: 5,
    dates: "May 2022 - August 2022",
    compensation: "$30/hr",
    tags: ["Software", "Engineering", "Development"],
  },
  {
    id: 2,
    title: "Data Scientist",
    description: "Analyzes data to provide insights for clients.",
    vacancies: 3,
    dates: "June 2022 - August 2022",
    compensation: "$35/hr",
    tags: ["Data", "Science", "Analysis"],
  },
  {
    id: 3,
    title: "Product Manager",
    description: "Manages product development for clients.",
    vacancies: 2,
    dates: "July 2022 - August 2022",
    compensation: "$40/hr",
    tags: ["Product", "Management", "Development"],
  },
  {
    id: 4,
    title: "UX Designer",
    description: "Designs user interfaces for clients.",
    vacancies: 4,
    dates: "August 2022 - August 2022",
    compensation: "$25/hr",
    tags: ["UX", "Design", "User Interface"],
  },
];

const TopicFeed = () => {
  return (
    <div className="flex h-fit w-full flex-col items-center">
      {topics.map((topic) => {
        return <TopicCard topic={topic} key={topic.id} />;
      })}
    </div>
  );
};

export default TopicFeed;
