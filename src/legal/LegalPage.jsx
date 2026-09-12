/*  The shell every policy page sits in, and the handful of prose pieces they
 *  are built from.
 *
 *  These pages are almost entirely text, so they are written as text — a
 *  stylesheet scoped to .ldp-prose rather than an inline style object on every
 *  paragraph. The landing page's inline-css() style earns its keep on a page
 *  that is mostly one-off layout; here it would bury the sentences, and the
 *  sentences are the point.
 */
import React from "react";
import { css } from "../css.js";
import { business, isTodo } from "../business.js";
import SiteFooter, { POLICIES } from "../SiteFooter.jsx";

const PROSE = `
  .ldp-prose { font-size: 16px; line-height: 1.85; }
  .ldp-prose h2 {
    font-size: clamp(23px, 3.4vw, 29px); line-height: 1.25; letter-spacing: -0.01em;
    margin: clamp(40px, 6vh, 58px) 0 var(--space-3);
  }
  .ldp-prose h2:first-child { margin-top: 0; }
  .ldp-prose h3 {
    font-size: clamp(17px, 2.2vw, 19px); line-height: 1.35;
    margin: clamp(26px, 4vh, 34px) 0 var(--space-2);
  }
  .ldp-prose p { margin: 0 0 var(--space-4); text-wrap: pretty; }
  .ldp-prose ul, .ldp-prose ol { margin: 0 0 var(--space-4); padding-left: 1.25em; }
  .ldp-prose li { margin-bottom: var(--space-2); text-wrap: pretty; }
  .ldp-prose li::marker { color: var(--color-accent); }
  .ldp-prose strong { font-weight: 600; }
  .ldp-prose a { color: var(--color-accent-700); text-underline-offset: 3px; }
  .ldp-prose a:hover { color: var(--color-accent-600); }
  .ldp-prose table { width: 100%; border-collapse: collapse; font-size: 15px; margin: 0 0 var(--space-4); }
  .ldp-prose th {
    text-align: left; font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
    font-weight: 400; padding: var(--space-2) var(--space-2) var(--space-2) 0;
    border-bottom: 1px solid var(--color-divider);
    color: color-mix(in srgb, var(--color-text) 58%, transparent);
  }
  .ldp-prose td {
    padding: var(--space-3) var(--space-2) var(--space-3) 0;
    border-bottom: 1px solid var(--color-divider); vertical-align: top;
  }
  .ldp-note {
    padding: var(--space-4); border-radius: var(--radius-md);
    border: 1px solid var(--color-divider);
    background: color-mix(in srgb, var(--color-surface) 60%, var(--color-bg));
    margin: 0 0 var(--space-4);
  }
  .ldp-note > :last-child { margin-bottom: 0; }
  .ldp-todo {
    display: inline-block; padding: 1px 8px; border-radius: var(--radius-sm);
    background: var(--color-accent-200); color: var(--color-accent-900);
    font-size: 13px; letter-spacing: .01em;
  }
  .ldp-toc a { display: block; padding: 5px 0; font-size: 14px; text-decoration: none;
    color: color-mix(in srgb, var(--color-text) 70%, transparent); }
  .ldp-toc a:hover { color: var(--color-accent-700); }
  .ldp-toc a[aria-current="page"] { color: var(--color-accent-700); }
  @media (max-width: 880px) { .ldp-aside { display: none } }
`;

/* An unfilled fact from business.js, shown rather than hidden.
 *
 * A policy page with a silent gap where the proprietor's name should be reads
 * as finished and is not; one with an amber mark reads as unfinished, which is
 * the truth and is the thing most likely to get it fixed before launch. */
export const Fact = ({ value }) =>
  isTodo(value) ? (
    <span className="ldp-todo" title={value.note}>
      to be filled in — {value.note}
    </span>
  ) : (
    <>{value}</>
  );

export const Note = ({ children }) => <div className="ldp-note">{children}</div>;

/** A two-column term/detail table, for "what we collect / why we collect it". */
export const Rows = ({ items }) => (
  <table>
    <tbody>
      {items.map(([term, detail]) => (
        <tr key={term}>
          <td style={css("width:32%;min-width:148px;font-weight:600")}>{term}</td>
          <td>{detail}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Header = () => (
  <header
    style={css(
      "position:sticky;top:0;z-index:55;display:flex;align-items:center;gap:clamp(14px,3vw,30px);padding:11px clamp(16px,4vw,44px);background:color-mix(in srgb, var(--color-bg) 92%, transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--color-divider)"
    )}
  >
    <a
      href="/"
      style={css(
        "display:flex;align-items:center;gap:10px;margin-right:auto;text-decoration:none;color:var(--color-text)"
      )}
    >
      <img
        src="/assets/logo.webp"
        alt=""
        style={css(
          "width:clamp(30px,6vw,38px);height:clamp(30px,6vw,38px);border-radius:50%;object-fit:cover;flex:none"
        )}
      />
      <span
        style={css(
          "font-family:var(--font-heading);font-size:clamp(15px,3.4vw,19px);letter-spacing:.02em;white-space:nowrap"
        )}
      >
        The Little Door Post
      </span>
    </a>
    <a className="btn btn-primary" href="/#subscribe" style={css("white-space:nowrap")}>
      Receive a letter
    </a>
  </header>
);

/*  One policy page.
 *
 *  `title`    the page's own name
 *  `summary`  one sentence in plain words, above the formal text. These pages
 *             are read by people deciding whether to trust us with their home
 *             address, not only by a reviewer, and the summary is for them.
 *  `path`     so the page can leave itself out of its own "see also" list
 */
export default function LegalPage({ title, summary, path, children }) {
  return (
    <>
      <style>{PROSE}</style>
      <div
        style={css(
          "background:var(--color-bg);color:var(--color-text);font-family:var(--font-body);min-height:100vh;display:flex;flex-direction:column"
        )}
      >
        <Header />

        <main
          style={css(
            "flex:1;width:min(1080px,100%);margin:0 auto;padding:clamp(38px,7vh,76px) clamp(20px,5vw,40px) clamp(50px,9vh,96px);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:clamp(30px,5vw,64px);align-items:start"
          )}
        >
          <article style={css("max-width:70ch;min-width:0")}>
            <div
              style={css(
                "font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 52%, transparent)"
              )}
            >
              The Little Door Post
            </div>
            <h1
              style={css(
                "font-family:var(--font-heading);font-weight:400;font-size:clamp(34px,6.5vw,54px);line-height:1.08;letter-spacing:-.015em;margin:10px 0 0"
              )}
            >
              {title}
            </h1>

            {summary && (
              <p
                style={css(
                  "font-family:var(--font-heading);font-style:italic;font-size:clamp(18px,2.6vw,22px);line-height:1.5;margin:clamp(16px,2.6vh,22px) 0 0;color:color-mix(in srgb, var(--color-text) 78%, transparent);text-wrap:pretty"
                )}
              >
                {summary}
              </p>
            )}

            <div
              style={css(
                "font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 50%, transparent);margin-top:clamp(20px,3vh,28px);padding-top:clamp(18px,2.6vh,24px);border-top:1px solid var(--color-divider)"
              )}
            >
              Last updated {business.lastUpdated}
            </div>

            <div className="ldp-prose" style={css("margin-top:clamp(30px,5vh,46px)")}>
              {children}
            </div>

            {/* The policies read as one document in seven parts, so each part
              * ends by offering the others rather than a dead end. */}
            <nav
              aria-label="Other policies"
              style={css(
                "display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:clamp(46px,7vh,72px);padding-top:clamp(22px,3.4vh,30px);border-top:1px solid var(--color-divider)"
              )}
            >
              {POLICIES.filter((p) => p.href !== path).map((p) => (
                <a
                  key={p.href}
                  href={p.href}
                  style={css(
                    "font-size:14px;text-decoration:none;color:color-mix(in srgb, var(--color-text) 66%, transparent)"
                  )}
                >
                  {p.label}
                </a>
              ))}
            </nav>
          </article>

          <aside className="ldp-aside" style={css("position:sticky;top:88px;width:206px;flex:none")}>
            <div
              style={css(
                "font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 50%, transparent);margin-bottom:8px"
              )}
            >
              Policies
            </div>
            <nav className="ldp-toc">
              {POLICIES.map((p) => (
                <a key={p.href} href={p.href} aria-current={p.href === path ? "page" : undefined}>
                  {p.label}
                </a>
              ))}
            </nav>
          </aside>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
