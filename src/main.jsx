import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import TheLittleDoorPost from "./TheLittleDoorPost.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TheLittleDoorPost />
  </React.StrictMode>
);
