import { useState, useEffect } from "react";
import RegisteredTopic from "./RegisteredTopic";

const RegisteredTopicsList = () => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    // Simulated fetch from a database
    const fetchTopics = async () => {
      const data = [
        {
          id: 1,
          title: "AI in Healthcare",
          startDate: "2024-01-10",
          endDate: "2024-06-30",
          status: "Active",
          tags: ["AI", "Healthcare", "ML"],
        },
        {
          id: 2,
          title: "Blockchain Security",
          startDate: "2024-02-15",
          endDate: "2024-08-20",
          status: "Pending",
          tags: ["Blockchain", "Security"],
        },
      ];
      setTopics(data);
    };

    fetchTopics();
  }, []);

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <RegisteredTopic key={topic.id} topic={topic} />
      ))}
    </div>
  );
};

export default RegisteredTopicsList;
