import Plate from "./components/Plate";
import Sidebar from "./components/Sidebar";
import { useEffect, useState } from "react";

function App() {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [isStudent, setIsStudent] = useState(true);

  return (
    <>
      {console.log("isOpen: ", isOpen)}
      <div className="h-screen w-screen font-content sm:flex">
        <Sidebar isOpen={isOpen} isStudent={isStudent} />
        <Plate event={() => setIsOpen(!isOpen)} />
      </div>
    </>
  );
}

export default App;
