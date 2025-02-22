
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import BiblePlanComponent from "./components/BiblePlanComponent";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Failed to find root element");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BiblePlanComponent />
  </React.StrictMode>
);

