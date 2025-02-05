import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopicFeed from "./TopicFeed";
import TopicInfo from "./TopicInfo";
import SidebarBtn from "./SidebarBtn";
import CreateTopic from "./CreateTopic";

const Plate = ({ event }) => {
  return (
    <div className="h-full overflow-hidden bg-red-700 sm:flex-grow">
      <SidebarBtn event={event} />
      <div className="h-full w-full overflow-y-scroll bg-red-400">
        <Router>
          <Routes>
            <Route path="/" element={<TopicFeed />} />
            <Route path="/topic" element={<TopicInfo />} />
            <Route path="/create" element={<CreateTopic />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default Plate;
