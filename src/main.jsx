import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { warmUp } from "./api.js";
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

  /* Wake the API the moment anything renders, whichever page that is.
   *
   * It matters that this lives here and not in the sign-up form: a reader who
   * arrives on #/the-red-race — the page worth sharing — never mounts that
   * form, so warming from inside it would leave them waiting out the whole
   * cold start after they clicked "Receive a letter". Here, the letter is the
   * wait.
   *
   * Safe to run twice: getConfig() is single-flight, so StrictMode's second
   * pass in development joins the first request rather than starting another. */
  useEffect(() => {
    warmUp();
  }, []);

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
