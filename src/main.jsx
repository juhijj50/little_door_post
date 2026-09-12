import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { warmUp } from "./api.js";
import TheLittleDoorPost from "./TheLittleDoorPost.jsx";

/* One page, so no router. Anchors like #subscribe are left to the browser,
 * which scrolls to them without any help from us. */
function App() {
  /* Start waking the API as the page renders. Nothing on screen waits for it —
   * the form works regardless — but the sign-up it will eventually carry does,
   * so the sooner the request is in flight the better. */
  useEffect(() => {
    warmUp();
  }, []);

  return <TheLittleDoorPost />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
