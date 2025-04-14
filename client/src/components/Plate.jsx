import React from "react";
import SidebarBtn from "./SidebarBtn";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import RegisteredTopicsList from "../faculty/RegisteredTopicsList";
import ManageMembers from "../faculty/ManageMembers";
import HomeRedirect from "./HomeDirect";
import TopicInfo from "../student/TopicInfo";
import SignUp from "./SignUp";
import TopicFeed from "../student/TopicFeed";
import CreateTopic from "../faculty/CreateTopic";
import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "./Unauthorized";

const Plate = ({ event }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 sm:flex-grow">
      {/* Main Content Area */}
      <div className="h-full flex-1 overflow-y-auto bg-main-gradient p-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute component={TopicFeed} requiredRole="admin" />
            }
          />
          <Route
            path="/faculty-registered"
            element={
              <ProtectedRoute
                component={RegisteredTopicsList}
                requiredRole="faculty"
              />
            }
          />
          <Route
            path="/create-topic"
            element={
              <ProtectedRoute component={CreateTopic} requiredRole="faculty" />
            }
          />
          <Route
            path="/manage"
            element={
              <ProtectedRoute
                component={ManageMembers}
                requiredRole="faculty"
              />
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute component={TopicFeed} requiredRole="student" />
            }
          />
          <Route
            path="/info/topic/:topicId"
            element={
              <ProtectedRoute component={TopicInfo} requiredRole="student" />
            }
          />

          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Default route (Redirect equivalent in v6) */}
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </div>
    </div>
  );
};

export default Plate;
