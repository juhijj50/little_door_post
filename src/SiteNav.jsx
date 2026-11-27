/*  The bar across the top, shared by the landing page and all seven policy
 *  pages — so the mark, the links and the one button are in the same place
 *  wherever a reader happens to have landed.
 *
 *  It sticks, and it is in flow, so `--header-h` in site.css is both its
 *  height and the `scroll-margin-top` that keeps a section's heading from
 *  sliding under it when you jump to #inside.
 *
 *  On a phone the right-hand side folds behind a three-line button and drops
 *  down when it is pressed. It closes on Escape, on following a link, on a tap
 *  anywhere else, and on widening the window past the breakpoint — otherwise
 *  the menu would still think it was open when the links had already gone back
 *  into the bar.
 *
 *  Links are written "/#inside", not "#inside", on purpose. From the landing
 *  page the browser handles it as a plain anchor and scrolls; from /terms the
 *  router treats it as a navigation, renders the landing page and then scrolls
 *  to the section (see useScrollOnNavigate in router.js).
 */
import React, { useEffect, useState } from "react";

const LINKS = [
  { href: "/#inside", label: "What’s inside" },
  { href: "/pricing", label: "Pricing" },
];

/* The one width the menu exists below. Kept here and in site.css together. */
const PHONE = 760;

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth > PHONE && setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {/* Outside <header>, deliberately: the bar has a backdrop-filter, which
        * makes it the containing block for anything `position: fixed` inside
        * it — a full-screen scrim in there would be sixty pixels tall. */}
      {open && (
        <button type="button" className="nav__scrim" aria-hidden="true" tabIndex={-1} onClick={close} />
      )}

      <header className="nav">
        <div className="nav__bar">
          <a className="nav__brand" href="/" onClick={close}>
            <img src="/assets/logo-round.webp" alt="" />
            <span className="nav__name">The Little Door Post</span>
          </a>

          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close the menu" : "Open the menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              {open ? (
                <path d="M5 5l12 12M17 5 5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>

          {/* One list for both layouts: a row in the bar on a wide screen, a
            * panel under it on a phone. */}
          <nav
            id="site-menu"
            className={`nav__menu${open ? " is-open" : ""}`}
            aria-label="Sections"
          >
            {LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="nav__link" onClick={close}>
                {label}
              </a>
            ))}
            <a className="btn btn-primary nav__cta" href="/#subscribe" onClick={close}>
              Receive a letter
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
