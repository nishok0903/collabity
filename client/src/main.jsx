import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

let initialIsOpen = false;

window.onload = () => {
  console.log("Hello, world!");
  if (window.screen.width > 640) {
    initialIsOpen = true;
    console.log(initialIsOpen);
  }
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
