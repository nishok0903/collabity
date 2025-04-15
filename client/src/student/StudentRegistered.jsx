import React, { useEffect, useState } from "react";
import { UserIcon } from "@heroicons/react/solid";
import RegularButton from "../components/RegularButton";
import { auth } from "../firebase";

const StudentRegistered = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch student's topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch("/api/student/topics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTopics(data);
        } else {
          alert("Failed to fetch topics");
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
        alert("Error fetching topics");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  // Get the appropriate status color based on the topic's status
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "not_started":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full p-6">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        Your Registered Topics
      </h2>

      {topics.length === 0 ? (
        <div className="text-center text-gray-500">
          You are not registered in any topics.
        </div>
      ) : (
        <div className="space-y-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="w-full rounded-lg bg-white p-6 shadow-lg hover:shadow-xl"
            >
              {/* Topic Title & Dates */}
              <h3 className="text-lg font-semibold text-gray-800">
                {topic.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(topic.start_date).toLocaleDateString()} -{" "}
                {new Date(topic.end_date).toLocaleDateString()}
              </p>

              {/* Topic Status */}
              <span
                className={`mt-3 inline-block rounded-md px-4 py-1 text-sm font-medium ${getStatusColor(
                  topic.status,
                )}`}
              >
                {topic.status === "not_started"
                  ? "Not Started"
                  : topic.status === "active"
                    ? "Active"
                    : "Completed"}
              </span>

              {/* Topic Details & Actions */}
              <div className="mt-4 flex items-center gap-3">
                {/* You can add an action based on the status, like "Rate" or "Complete" */}
                {topic.status === "active" && (
                  <RegularButton
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
                    onClick={() =>
                      (window.location.href = `/topic/${topic.id}/rate`)
                    }
                  >
                    Rate Topic
                  </RegularButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentRegistered;
