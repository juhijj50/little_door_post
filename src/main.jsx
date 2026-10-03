import React, { Suspense, lazy, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
/* The redesign's tokens, layered over the component sheet above. See the file
 * header — fold it into styles.css if you would rather keep one stylesheet. */
import "./brand-tokens.css";
/* The landing page's header menu, envelope grid and gallery — the parts that
 * need media queries. */
import "./site.css";
import { warmUp } from "./api.js";
import { usePath, useScrollOnNavigate, interceptLinks } from "./router.js";
import TheLittleDoorPost from "./TheLittleDoorPost.jsx";
import RedRace from "./RedRace.jsx";
import Terms from "./legal/Terms.jsx";
import Privacy from "./legal/Privacy.jsx";
import Refunds from "./legal/Refunds.jsx";
import Shipping from "./legal/Shipping.jsx";
import Pricing from "./legal/Pricing.jsx";
import Contact from "./legal/Contact.jsx";
import Grievance from "./legal/Grievance.jsx";
import NotFound from "./legal/NotFound.jsx";

/* The admin panel is its own chunk, fetched only when /admin is opened — a
 * reader never downloads it. */
const Admin = lazy(() => import("./admin/Admin.jsx"));
const AdminPage = () => (
  <Suspense fallback={<div style={{ padding: 40, fontFamily: "var(--font-body)" }}>Loading…</div>}>
    <Admin />
  </Suspense>
);

/* One landing page, one letter, and seven policy pages. The router is ours and
 * lives in router.js — 100 lines, no dependency, and no more than this needs.
 *
 * Anchors like #subscribe are still left to the browser, which scrolls to them
 * without any help from us. */
const ROUTES = {
  "/": TheLittleDoorPost,
  "/red-race": RedRace,
  "/terms": Terms,
  "/privacy": Privacy,
  "/refunds": Refunds,
  "/shipping": Shipping,
  "/pricing": Pricing,
  "/contact": Contact,
  "/grievance": Grievance,
  "/admin": AdminPage,
};

/* A tolerant lookup: /terms, /terms/ and /Terms are the same page. Somebody
 * typing a policy URL off a printed page or a support email should land on it,
 * not on a 404 over a trailing slash. */
const routeFor = (path) => {
  const key = path.replace(/\/+$/, "").toLowerCase() || "/";
  return ROUTES[key] || NotFound;
};

function App() {
  const path = usePath();

  /* Start waking the API as the page renders. Nothing on screen waits for it —
   * the form works regardless — but the sign-up it will eventually carry does,
   * so the sooner the request is in flight the better. Fired from the policy
   * pages too: a reader who has just read the refund policy is exactly the
   * reader about to subscribe. */
  useEffect(() => {
    if (path !== "/admin") warmUp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(interceptLinks, []);
  useScrollOnNavigate(path);

  const Page = routeFor(path);
  return <Page />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
