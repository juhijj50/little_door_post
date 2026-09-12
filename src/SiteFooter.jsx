/*  The footer, shared by the landing page and all seven policy pages.
 *
 *  Every policy is linked from here, which is why it is shared rather than
 *  written twice: a payment aggregator's review looks for the policies to be
 *  reachable from the footer of *every* page, and a footer that exists in two
 *  copies is a footer that will eventually only be updated in one.
 */
import React from "react";
import { css } from "./css.js";
import { business } from "./business.js";

export const POLICIES = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refunds", label: "Refunds & Cancellation" },
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact Us" },
  { href: "/grievance", label: "Grievance Redressal" },
];

const linkStyle = css(
  "font-size:13px;text-decoration:none;color:color-mix(in srgb, var(--color-text) 66%, transparent);white-space:nowrap"
);

const muted = "font-size:12px;line-height:1.7;color:color-mix(in srgb, var(--color-text) 52%, transparent)";

export default function SiteFooter() {
  const { address } = business;

  return (
    <footer
      style={css(
        "border-top:1px solid var(--color-divider);padding:clamp(34px,6vh,58px) clamp(20px,5vw,40px) clamp(28px,5vh,44px)"
      )}
    >
      <div style={css("width:min(1080px,100%);margin:0 auto")}>
        <div
          style={css(
            "display:flex;flex-wrap:wrap;gap:16px 32px;align-items:baseline;justify-content:space-between"
          )}
        >
          <a
            href="/"
            style={css(
              "font-family:var(--font-heading);font-size:clamp(17px,3vw,21px);text-decoration:none;color:var(--color-text)"
            )}
          >
            The Little Door Post
          </a>
          {/* Iris posts within India and nowhere else — the backend refuses an
            * international sign-up outright. The footer has to say the same. */}
          <div
            style={css(
              "font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 52%, transparent)"
            )}
          >
            One envelope a month · Posted across India
          </div>
        </div>

        <nav
          aria-label="Policies"
          style={css(
            "display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:clamp(22px,3.5vh,32px);padding-top:clamp(20px,3vh,26px);border-top:1px solid var(--color-divider)"
          )}
        >
          {POLICIES.map((p) => (
            <a key={p.href} href={p.href} style={linkStyle}>
              {p.label}
            </a>
          ))}
        </nav>

        <div
          style={css(
            "display:flex;flex-wrap:wrap;gap:6px 28px;margin-top:clamp(18px,3vh,26px);" + muted
          )}
        >
          <span>
            {address.lines.join(", ")}, {address.state} {address.pincode}, {address.country}
          </span>
          <a href={`mailto:${business.email}`} style={css(muted + ";text-decoration:none")}>
            {business.email}
          </a>
        </div>

        <div style={css(muted + ";margin-top:10px")}>
          © {new Date().getFullYear()} The Little Door Post. Illustrations and writing are our own.
        </div>
      </div>
    </footer>
  );
}
