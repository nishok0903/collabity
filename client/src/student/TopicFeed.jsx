import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import TopicCard from "./TopicCard";

const TopicFeed = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const firebase_uid = auth.currentUser?.uid;
        const firebaseToken = await auth.currentUser?.getIdToken(true); // Get the Firebase token
        if (!firebase_uid) {
          setError("User not authenticated");
          return;
        }
        const res = await fetch(
          `/api/student/getFeed?firebase_uid=${firebase_uid}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${firebaseToken}`, // Add Bearer token here
            },
          },
        );
        if (!res.ok) throw new Error("Failed to fetch topics");

        const data = await res.json();
        setTopics(data.topics);
        console.log(data.topics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (loading) return <div>Loading topics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex h-fit w-full flex-col items-center">
      {topics.length === 0 ? (
        <div>No topics found</div>
      ) : (
        topics.map((topic) => <TopicCard topic={topic} key={topic.id} />)
      )}
    </div>
  );
};

export default TopicFeed;
