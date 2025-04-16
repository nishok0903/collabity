import React, { useEffect, useState } from "react";
import { Route, useNavigate } from "react-router-dom"; // Import useNavigate for programmatic navigation
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ component: Component, requiredRole }) => {
  const user = auth.currentUser;
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation
  const { currentUser } = useAuth();

  useEffect(() => {
    // Redirect to login page if user is not authenticated
    if (!user) {
      navigate("/login");
    }

    // Redirect to unauthorized page if user doesn't have the correct role
    if (currentUser.role !== requiredRole) {
      console.log(currentUser.role);

      navigate("/unauthorized");
    }

    // Render the component if the user is authenticated and has the correct role
  }, []);

  if (currentUser.role == requiredRole) {
    return <Component />;
  }
  return null;
};

export default ProtectedRoute;
