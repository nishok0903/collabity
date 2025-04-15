import React from "react";
import Sidebar from "./Sidebar";
import Plate from "./Plate";
import { useState } from "react";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="h-screen w-screen font-content sm:flex">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} />
      {/* Plate component */}
      <Plate event={() => setIsOpen(!isOpen)} />
    </div>
  );
};

export default Layout;
