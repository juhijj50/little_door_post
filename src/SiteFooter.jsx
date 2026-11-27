/*  The footer, shared by the landing page and all seven policy pages.
 *
 *  Three bands, each of them horizontal, so the footer stays short on a phone
 *  instead of becoming a column of stacked lists:
 *
 *    top       the mark and a line about the club, with "The club" and
 *              "Reach us" beside it — and beside each other, two-up, even on
 *              the narrowest screen
 *    policies  all seven, as one wrapping row rather than a tall list
 *    base      the copyright line
 *
 *  It is shared rather than written twice because a payment aggregator's
 *  review looks for the policies to be reachable from the footer of *every*
 *  page, and a footer that exists in two copies is a footer that will
 *  eventually only be updated in one.
 *
 *  Every one of the seven policies is in that middle row. Do not thin the list
 *  out to tidy the layout: the list is the point.
 *
 *  Layout is `.foot*` in site.css.
 */
import React from "react";
import { business, addressLine } from "./business.js";

export const POLICIES = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refunds", label: "Refunds & Cancellation" },
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact Us" },
  { href: "/grievance", label: "Grievance Redressal" },
];

/* "/#inside", not "#inside": from a policy page these have to navigate home
 * first. See the note in SiteNav.jsx. */
const CLUB = [
  { href: "/#inside", label: "What’s inside" },
  { href: "/#subscribe", label: "Receive a letter" },
  { href: "/#top", label: "Back to the top" },
];

export default function SiteFooter() {
  const { instagram } = business;

  return (
    <footer className="foot">
      <div className="foot__inner">
        <div className="foot__top">
          <div className="foot__brand">
            <a href="/" className="foot__mark">
              <img src="/assets/logo-round.webp" alt="" />
              <span>The Little Door Post</span>
            </a>
            {/* Kept in step with business.international.live: the footer must
              * not promise post abroad while the order form refuses it. */}
            <p className="foot__blurb">
              One envelope a month, printed on real paper and posted across India
              {business.international.live ? " and almost everywhere else" : ""}.
            </p>
          </div>

          <div className="foot__cols">
            <div className="foot__col">
              <h2 className="foot__heading">The club</h2>
              <nav className="foot__links" aria-label="The club">
                {CLUB.map((l) => (
                  <a key={l.href} href={l.href}>
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="foot__col">
              <h2 className="foot__heading">Reach us</h2>
              <div className="foot__links">
                <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer noopener">
                  @{instagram}
                </a>
                <a href={`mailto:${business.email}`}>{business.email}</a>
                <a href={`tel:${business.phone.replace(/\s+/g, "")}`}>{business.phone}</a>
              </div>
              <p className="foot__hours">{business.hours}</p>
            </div>
          </div>
        </div>

        <nav className="foot__policies" aria-label="Policies">
          <span className="foot__heading">Policies</span>
          {POLICIES.map((p) => (
            <a key={p.href} href={p.href}>
              {p.label}
            </a>
          ))}
        </nav>

        <div className="foot__base">
          <address className="foot__address">{addressLine()}</address>
          <span>
            © {new Date().getFullYear()} {business.tradingName} · {business.owner}
          </span>
        </div>
      </div>
    </footer>
  );
}
