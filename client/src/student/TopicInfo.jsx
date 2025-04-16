import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // import useParams here
import RegularButton from "../components/RegularButton";
import { auth } from "../firebase";

const TopicInfo = () => {
  const navigate = useNavigate();
  const { topicId } = useParams(); // Use useParams to get topicId from the URL
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    // Only fetch data if topicId is valid
    if (!topicId) {
      setError("Invalid topic ID.");
      setLoading(false);
      return;
    }

    const fetchTopic = async () => {
      try {
        const token = await auth.currentUser?.getIdToken(); // your bearer token
        const response = await fetch(
          `http://localhost:3000/api/student/getTopicDetails?topic_id=${topicId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`, // Add Bearer token here
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch topic details.");
        }

        const data = await response.json();
        setTopic(data.topic);
      } catch (error) {
        console.error("Error fetching topic:", error);
        setError("Failed to fetch topic details.");
      } finally {
        setLoading(false); // Set loading to false when the request finishes
      }
    };

    fetchTopic();
  }, [topicId]);

  const handleDownload = async () => {
    try {
      const token = await auth.currentUser.getIdToken(); // Get the token

      // Make the request to the server with the Bearer token
      const response = await fetch(
        `http://localhost:3000/api/student/downloadDocument/${topic.topic_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
          },
        },
      );

      // Check if the response is successful
      if (!response.ok) {
        throw new Error("Failed to fetch the document");
      }

      // Convert the response to a Blob (binary data)
      const blob = await response.blob();

      // Create a temporary URL for the file
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${topic.topic_id}.pdf`; // Name the downloaded file
      link.click();

      // Clean up the temporary URL after download
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download the document.");
    }
  };

  const handleApply = async () => {
    try {
      const token = await auth.currentUser.getIdToken(); // Get the Firebase token
      const firebase_uid = auth.currentUser.uid; // Get the firebase_uid (user's UID in Firebase)
      const response = await fetch(
        `http://localhost:3000/api/student/applyForTopic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
          body: JSON.stringify({
            topic_id: topic.topic_id, // The topic that the student is applying to
            firebase_uid: firebase_uid, // Send the firebase_uid to identify the user
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to apply for the topic");
      }

      const data = await response.json();
      alert(data.message); // Show success message
      navigate("/feed"); // Redirect to the topic feed page
      // Optionally, update the state (e.g., disable the Apply Now button after success)
      // setTopic(prevState => ({ ...prevState, vacancies: prevState.vacancies - 1 }));
    } catch (error) {
      console.error("Error applying for the topic:", error);
      alert("Failed to apply for the topic");
    }
  };

  // If still loading, show the loading message
  if (loading) return <div>Loading...</div>;

  // If there's an error, show the error message
  if (error) return <div>Error: {error}</div>;

  const duration = Math.ceil(
    (new Date(topic.end_date) - new Date(topic.start_date)) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className="mx-auto my-4 w-4/5 rounded-lg border-4 border-black bg-white p-8 shadow-lg">
      <div className="topic-info">
        <h1 className="mb-6 text-4xl font-extrabold text-gray-800">
          {topic.title}
        </h1>

        {/* Professor Info */}
        <div className="prof-info mb-6 flex items-center space-x-6">
          <img
            src="https://api.dicebear.com/6.x/initials/svg?seed=prof"
            alt="Professor"
            className="h-20 w-20 rounded-full border-2 border-gray-200 shadow-md"
          />
          <div className="prof-details">
            <h2 className="text-2xl font-semibold text-gray-800">
              {topic.professor.first_name} {topic.professor.last_name}
            </h2>
            <p className="text-lg text-gray-600">{topic.professor.email}</p>
          </div>
        </div>

        <p className="mb-6 text-lg leading-relaxed text-gray-800">
          {topic.description}
        </p>

        <p className="mb-6 text-lg text-gray-800">
          <span className="font-semibold">Vacancies:</span> {topic.vacancies}
        </p>

        {/* Document Download Section */}
        <p className="mb-6 text-lg text-blue-500">
          <span className="font-semibold">Document:</span>{" "}
          <button
            onClick={handleDownload}
            className="underline transition-all hover:text-blue-700"
          >
            Download PDF
          </button>
        </p>

        <p className="mb-6 text-lg text-gray-800">
          <span className="font-semibold">Requirements:</span> Will be displayed
          here.
        </p>

        <div className="dates mb-6">
          <p className="text-lg text-gray-800">
            <span className="font-semibold">Start Date:</span>{" "}
            {topic.start_date}
          </p>
          <p className="text-lg text-gray-800">
            <span className="font-semibold">End Date:</span> {topic.end_date}
          </p>
          <p className="text-lg text-gray-800">
            <span className="font-semibold">Duration:</span> {duration} days
          </p>
        </div>

        <p className="mb-6 text-lg text-gray-800">
          <span className="font-semibold">Compensation:</span> ₹
          {topic.compensation}/hr
        </p>

        <div className="tags mb-6">
          <p className="text-lg text-gray-800">
            <span className="font-semibold">Tags:</span> {topic.tags.join(", ")}
          </p>
        </div>

        <div className="flex w-full justify-center">
          <RegularButton onClick={handleApply}>Apply Now</RegularButton>
        </div>
      </div>
    </div>
  );
};

export default TopicInfo;
