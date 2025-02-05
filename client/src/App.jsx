import Plate from "./components/Plate";
import Sidebar from "./components/Sidebar";
import { useState } from "react";

function App() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <div className="h-screen w-screen sm:flex">
        <Sidebar isOpen={isOpen} />
        <Plate event={() => setIsOpen(!isOpen)} />
      </div>
    </>
  );
}

export default App;
