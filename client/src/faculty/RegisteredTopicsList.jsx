import { useState, useEffect } from "react";
import RegisteredTopic from "./RegisteredTopic"; // Ensure RegisteredTopic is correctly imported
import { auth } from "../firebase"; // Adjust the import based on your project structure

const RegisteredTopicsList = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch topics from the backend
  const fetchTopics = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken(); // Get the Firebase token
        const firebase_uid = auth.currentUser?.uid;

        const response = await fetch(
          `http://localhost:3000/api/faculty/getRegisteredTopics?uid=${firebase_uid}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Attach Firebase token
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch topics.");
        } else {
          const data = await response.json();
          console.log(data);
          setTopics(data.topics);
        }
      } catch (err) {
        setError("Error fetching topics: " + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError("You need to be logged in to view topics.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics(); // Fetch topics when the component mounts
  }, []);

  return (
    <div className="space-y-4">
      {loading && <p>Loading topics...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {topics.map((topic) => (
        <RegisteredTopic key={topic.id} topic={topic} />
      ))}
    </div>
  );
};

export default RegisteredTopicsList;
