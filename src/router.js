/*  A router small enough to read in one sitting.
 *
 *  The site was one page and needed none; it is now eight, and still does not
 *  need 20kB of one. There are no nested routes, no route parameters and no
 *  data loading to coordinate — there is a path, and a component per path.
 *
 *  Links stay plain `<a href="/terms">`. A single capturing listener turns a
 *  left-click on an internal one into a history push, and lets everything else
 *  through untouched: modified clicks (open-in-new-tab), middle clicks,
 *  `target="_blank"`, downloads, external hosts, and — the one that matters on
 *  the landing page — same-page `#anchor` links, which the browser scrolls to
 *  far better than we would.
 *
 *  Direct hits on /terms need the host to serve index.html for unknown paths.
 *  vercel.json in the project root does that; any other host needs its own
 *  SPA-rewrite equivalent.
 */
import { useEffect, useState } from "react";

const EVENT = "ldp:navigate";

/** Go to an internal path. Accepts "/terms" and "/#subscribe" alike. */
export const navigate = (to, { replace = false } = {}) => {
  const url = new URL(to, window.location.origin);
  const next = url.pathname + url.search + url.hash;
  const here = window.location.pathname + window.location.search + window.location.hash;
  if (next === here) return;

  window.history[replace ? "replaceState" : "pushState"]({}, "", next);
  window.dispatchEvent(new Event(EVENT));
};

/** The current path, re-rendering whatever uses it when it changes. */
export const usePath = () => {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    /* popstate is the back/forward button; EVENT is our own pushState, which
     * deliberately does not fire popstate. */
    window.addEventListener("popstate", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  return path;
};

/* Whether this click should stay in the app. Every `false` here is a click the
 * browser is better at handling than we are. */
const isInternalNavigation = (event, anchor) => {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (!anchor || anchor.hasAttribute("download")) return false;
  if (anchor.target && anchor.target !== "_self") return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  const url = new URL(anchor.href, window.location.origin);
  if (url.origin !== window.location.origin) return false;

  /* A link to a #hash on the page we are already on. Left alone, so `smooth`
   * scrolling and the browser's own anchor handling keep working. */
  if (url.pathname === window.location.pathname && url.hash) return false;

  return true;
};

/** Install the click listener. Returns its own cleanup. */
export const interceptLinks = () => {
  const onClick = (event) => {
    const anchor = event.target.closest?.("a");
    if (!isInternalNavigation(event, anchor)) return;
    event.preventDefault();
    navigate(anchor.href);
  };

  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
};

/*  Where the reader lands after a navigation.
 *
 *  Two cases, and getting the second wrong is the usual bug: arriving at
 *  /terms should put you at the top of it, but arriving at /#subscribe should
 *  put you at the form. The hash element does not exist until the new page has
 *  rendered, hence the rAF.
 *
 *  A back-button return is left alone entirely — the browser restores the old
 *  scroll position, which is what "back" is supposed to mean.
 */
export const useScrollOnNavigate = (path) => {
  useEffect(() => {
    const { hash } = window.location;

    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const frame = requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
  }, [path]);
};
