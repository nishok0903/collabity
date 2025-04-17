import { useState } from "react";

import Plate from "./components/Plate";
import Sidebar from "./components/Sidebar";

import { AuthProvider } from "./context/AuthContext";
import { auth } from "./firebase";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Layout from "./components/Layout";

import EnterDetails from "./components/EnterDetails";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/enterDetails" element={<EnterDetails />} />
        <Route path="*" element={<Layout />}></Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
