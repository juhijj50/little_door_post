import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import TheLittleDoorPost from "./TheLittleDoorPost.jsx";
import TheRedRace from "./TheRedRace.jsx";

/* A hash router, deliberately.
 *
 * Two hash shapes share the bar: "#/something" is a page, anything else
 * ("#meet", "#subscribe") is an anchor on the landing page. Keeping routes
 * behind "#/" means the site still works as a plain folder of static files —
 * no server rewrite rules to get wrong on whatever host it lands on.
 *
 * "#/#subscribe" is both: go to the landing page, then to that section — which
 * is how the letter page links back into the sign-up form. */
const parseHash = () => {
  const hash = window.location.hash || "";
  if (!hash.startsWith("#/")) return { path: "/", anchor: hash.slice(1) };
  const [path, anchor = ""] = hash.slice(1).split("#");
  return { path: path || "/", anchor };
};

const PAGES = {
  "/the-red-race": TheRedRace,
};

function App() {
  const [route, setRoute] = useState(parseHash);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  /* The browser only scrolls to an anchor it recognises in the bar, which
   * "#/#subscribe" is not — and the section does not exist until the landing
   * page has rendered. So do it here, a frame later. */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = route.anchor && document.getElementById(route.anchor);
      if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
      else window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [route]);

  const Page = PAGES[route.path];
  return Page ? <Page /> : <TheLittleDoorPost />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
