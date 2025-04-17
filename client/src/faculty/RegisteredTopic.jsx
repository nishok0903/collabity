import { useState, useEffect } from "react";
import { UserIcon } from "@heroicons/react/solid";
import RegularButton from "../components/RegularButton";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const RegisteredTopic = ({ topic }) => {
  const [buttonStatus, setButtonStatus] = useState("disabled");
  const [buttonText, setButtonText] = useState("Start Topic");
  const navigate = useNavigate();

  const checkButtonStatus = () => {
    const currentDate = new Date();
    const startDate = new Date(topic.start_date);
    const endDate = new Date(topic.end_date);

    if (topic.status === "completed") {
      setButtonText("Completed");
      setButtonStatus("disabled");
    } else if (topic.status === "active" && currentDate >= endDate) {
      setButtonText("Complete Topic");
      setButtonStatus("active");
    } else if (
      topic.status !== "active" &&
      currentDate >= startDate &&
      topic.vacancies === 0
    ) {
      setButtonText("Start Topic");
      setButtonStatus("active");
    } else if (topic.status === "active") {
      setButtonText("Complete Topic");
      setButtonStatus("disabled");
    } else {
      setButtonText("Start Topic");
      setButtonStatus("disabled");
    }
  };

  useEffect(() => {
    checkButtonStatus();
  }, [topic]);

  const handleStartTopic = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/faculty/startTopic/${topic.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        alert("Topic started successfully.");
        setButtonText("Complete Topic");
        setButtonStatus("disabled");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to start topic");
      }
    } catch (error) {
      console.error("Error starting topic:", error);
      alert("Error starting topic");
    }
  };

  const handleCompleteTopic = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/faculty/completeTopic/${topic.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        alert("Topic completed! Please proceed with the ratings.");
        setButtonText("Completed");
        setButtonStatus("disabled");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to complete topic");
      }
    } catch (error) {
      console.error("Error completing topic:", error);
      alert("Error completing topic");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "active":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white p-4 shadow-lg hover:shadow-xl sm:p-6">
      {/* Title & Dates */}
      <h3 className="text-lg font-semibold text-gray-800 sm:text-xl">
        {topic.title}
      </h3>
      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
        {new Date(topic.start_date).toLocaleDateString()} -{" "}
        {new Date(topic.end_date).toLocaleDateString()}
      </p>

      {/* Status & Buttons */}
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <span
          className={`rounded-md px-4 py-1 text-sm font-medium ${getStatusColor(topic.status)}`}
        >
          {topic.status}
        </span>

        <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
          {topic.status !== "active" && topic.status !== "completed" ? (
            <RegularButton
              className="w-full sm:w-auto"
              onClick={() => navigate(`/manage/${topic.id}`)}
            >
              <UserIcon className="mr-2 inline-block h-5 w-5" /> Manage Members
            </RegularButton>
          ) : (
            <RegularButton
              className="w-full cursor-not-allowed bg-gray-200 text-gray-500 sm:w-auto"
              disabled
            >
              <UserIcon className="mr-2 inline-block h-5 w-5" /> Manage Locked
            </RegularButton>
          )}

          <RegularButton
            className={`w-full transition-all duration-300 sm:w-auto ${
              buttonStatus === "disabled"
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : buttonText === "Start Topic"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={
              buttonStatus === "active" && buttonText === "Start Topic"
                ? handleStartTopic
                : buttonStatus === "active" && buttonText === "Complete Topic"
                  ? handleCompleteTopic
                  : null
            }
            disabled={buttonStatus === "disabled"}
          >
            {buttonText}
          </RegularButton>
        </div>
      </div>
    </div>
  );
};

export default RegisteredTopic;
