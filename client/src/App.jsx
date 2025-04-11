import { useState } from "react";

import Plate from "./components/Plate";
import Sidebar from "./components/Sidebar";

import { AuthProvider } from "./context/AuthContext";

function App() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <AuthProvider>
      <div className="h-screen w-screen font-content sm:flex">
        {/* Sidebar */}
        <Sidebar isOpen={isOpen} />
        {/* Plate component */}
        <Plate event={() => setIsOpen(!isOpen)} />
      </div>
    </AuthProvider>
  );
}

export default App;
