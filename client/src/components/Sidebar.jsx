import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  CogIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";

const Sidebar = ({ isOpen }) => {
  const { currentUser } = useAuth();

  const studentList = [
    {
      name: "Dashboard",
      icon: <HomeIcon className="h-5 w-5" />,
      path: "/student-dashboard",
    },
    { name: "Feed", icon: <UsersIcon className="h-5 w-5" />, path: "/feed" },
    {
      name: "Registered",
      icon: <CogIcon className="h-5 w-5" />,
      path: "/student-registered",
    },
    {
      name: "Profile",
      icon: <UserCircleIcon className="h-5 w-5" />,
      path: "/student-profile",
    },
  ];

  const facultyList = [
    {
      name: "Dashboard",
      icon: <HomeIcon className="h-5 w-5" />,
      path: "/faculty-dashboard",
    },
    {
      name: "Create",
      icon: <UsersIcon className="h-5 w-5" />,
      path: "/create-topic",
    },
    {
      name: "Manage",
      icon: <CogIcon className="h-5 w-5" />,
      path: "/faculty-registered",
    },
    {
      name: "Profile",
      icon: <UserCircleIcon className="h-5 w-5" />,
      path: "/faculty-profile",
    },
  ];

  if (!currentUser) return null;

  const navList =
    currentUser?.role === "student"
      ? studentList
      : currentUser?.role === "faculty"
        ? facultyList
        : [];

  return (
    <div
      className={`absolute left-0 z-10 h-full bg-black-gradient transition-all duration-300 sm:relative ${
        isOpen ? "w-screen sm:w-64" : "w-0"
      } flex flex-col overflow-hidden whitespace-nowrap font-sans text-white`}
    >
      <div className="flex flex-col p-4">
        {/* Logo or Header */}
        <h1 className="mb-4 text-3xl font-bold">Collabity</h1>
        <hr className="mb-4 border-t border-gray-700" />
      </div>

      {/* Sidebar Navigation */}
      <div className="flex-grow px-2">
        <ul className="space-y-2">
          {navList.map((section, index) => (
            <li key={index}>
              <Link to={section.path}>
                <div className="flex items-center rounded-lg px-4 py-2 text-lg font-medium transition duration-200 hover:bg-gray-700 sm:text-left">
                  <span>{section.icon}</span>
                  <span className="ml-3">{section.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-4 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Collabity. All Rights Reserved.
      </div>
    </div>
  );
};

export default Sidebar;
