import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Ensure this points to your Firebase configuration

const HomeRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const user = auth.currentUser;

      if (user) {
        // User is logged in, check role
        fetch(`/api/checkRole`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firebase_uid: user.uid }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.role) {
              // Redirect to role-specific page
              if (data.role === "faculty") {
                navigate("/create-topic");
              } else if (data.role === "student") {
                navigate("/feed");
              }
            } else {
              navigate("/login");
            }
          })
          .catch((error) => {
            console.error("Error fetching role:", error);
            navigate("/login");
          });
      } else {
        // User is not logged in, redirect to login page
        navigate("/login");
      }
    };

    checkUser();
  }, [navigate]);

  // While checking user or loading, you can return a loading state or nothing
  return <div>Loading...</div>;
};

export default HomeRedirect;
