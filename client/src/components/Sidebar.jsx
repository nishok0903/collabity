import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  CogIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";
import SidebarBtn from "./SidebarBtn";

const Sidebar = ({ isOpen }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
      path: `/profile/${currentUser?.username}`,
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
      path: `/profile/${currentUser?.username || currentUser?.email?.split("@")[0]}`,
    },
  ];

  if (!currentUser) return null;

  const navList =
    currentUser?.role === "student"
      ? studentList
      : currentUser?.role === "faculty"
        ? facultyList
        : [];

  const username = currentUser?.username || currentUser?.email?.split("@")[0];
  const firstName = currentUser?.first_name;
  const userInitial = firstName
    ? firstName.charAt(0).toUpperCase()
    : username?.charAt(0).toUpperCase();

  return (
    <div
      className={`absolute left-0 z-10 h-full bg-black-gradient transition-all duration-300 sm:relative ${
        isOpen ? "w-screen sm:w-64" : "w-0"
      } flex flex-col overflow-hidden whitespace-nowrap font-sans text-white`}
    >
      <div className="flex flex-col p-4">
        {/* Logo */}
        <h1 className="mb-4 text-3xl font-bold">Collabity</h1>
        <hr className="mb-2 border-t border-gray-700" />

        {/* User Info */}
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md bg-gray-800 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-600 text-base font-semibold uppercase">
              {userInitial}
            </div>
            <div>
              <div className="text-sm font-medium">Hi, {username}</div>
              <div className="text-xs capitalize text-gray-400">
                {currentUser?.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-red-400 transition hover:text-red-600"
          >
            Sign out
          </button>
        </div>

        <hr className="border-t border-gray-700" />
      </div>

      {/* Navigation */}
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
