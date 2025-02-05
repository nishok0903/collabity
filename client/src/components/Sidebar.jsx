import React from "react";

const Sidebar = ({ isOpen }) => {
  return (
    <>
      <div
        className={`absolute left-0 z-10 h-full bg-gray-900 transition-all duration-300 sm:relative ${isOpen ? "w-screen sm:w-64" : "w-0"}`}
      ></div>
    </>
  );
};

export default Sidebar;
