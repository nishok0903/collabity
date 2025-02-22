import React from "react";
import {
  HomeIcon,
  UsersIcon,
  CogIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";

const Sidebar = ({ isOpen, isStudent }) => {
  const studentList = [
    { name: "Dashboard", icon: <HomeIcon className="h-5 w-5" /> },
    { name: "Feed", icon: <UsersIcon className="h-5 w-5" /> },
    { name: "Settings", icon: <CogIcon className="h-5 w-5" /> },
    { name: "Profile", icon: <UserCircleIcon className="h-5 w-5" /> },
  ];

  const facultyList = [
    { name: "Dashboard", icon: <HomeIcon className="h-5 w-5" /> },
    { name: "Create", icon: <UsersIcon className="h-5 w-5" /> },
    { name: "Settings", icon: <CogIcon className="h-5 w-5" /> },
    { name: "Profile", icon: <UserCircleIcon className="h-5 w-5" /> },
  ];

  return (
    <div
      className={`absolute left-0 z-10 h-full bg-black-gradient transition-all duration-300 sm:relative ${isOpen ? "w-screen sm:w-64" : "w-0"} flex flex-col overflow-hidden text-nowrap font-sans text-white`}
    >
      <div className="flex flex-col p-4">
        {/* Logo or Header */}
        <h1 className="mb-4 text-3xl font-bold">Collabity</h1>
        <hr className="mb-4 border-t border-gray-700" />
      </div>

      {/* Sidebar Navigation */}
      <div className="flex-grow px-2">
        <ul className="space-y-2">
          {(isStudent ? studentList : facultyList).map((section, index) => (
            <li key={index}>
              <a
                href="#"
                className="flex items-center rounded-lg px-4 py-2 text-lg font-medium transition duration-200 hover:bg-gray-700 sm:text-left"
              >
                <span>{section.icon}</span>
                <span className="ml-3">{section.name}</span>
              </a>
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
