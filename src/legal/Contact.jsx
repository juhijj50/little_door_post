import React from "react";
import LegalPage, { Fact, Note } from "./LegalPage.jsx";
import { css } from "../css.js";
import { business, isTodo } from "../business.js";

/*  Contact Us.
 *
 *  The Consumer Protection (E-Commerce) Rules, 2020 require an e-commerce
 *  business to display its legal name, its address, and working customer-care
 *  contact details. A payment aggregator's activation check looks for the same
 *  things and compares the legal name here against the name on the merchant
 *  account — which is why this page prints the proprietor's name and not only
 *  the trading name.
 */
export default function Contact() {
  const { address, grievanceOfficer } = business;

  return (
    <LegalPage
      path="/contact"
      title="Contact Us"
      summary="A real person reads every one of these. Write about anything — an order, an address that has changed, or just to say which letter you liked."
    >
      <h2>Write to us</h2>
      <div
        style={css(
          "display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:var(--space-4);margin-bottom:var(--space-6)"
        )}
      >
        <div
          style={css(
            "padding:var(--space-4);border:1px solid var(--color-divider);border-radius:var(--radius-md)"
          )}
        >
          <div
            style={css(
              "font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-bottom:8px"
            )}
          >
            Email
          </div>
          <a href={`mailto:${business.email}`} style={css("font-size:16px;word-break:break-word")}>
            {business.email}
          </a>
          <p style={css("margin:10px 0 0;font-size:13px;line-height:1.6;opacity:.75")}>
            The best way to reach us. We answer within {business.ackHours} hours, usually sooner.
          </p>
        </div>

        <div
          style={css(
            "padding:var(--space-4);border:1px solid var(--color-divider);border-radius:var(--radius-md)"
          )}
        >
          <div
            style={css(
              "font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-bottom:8px"
            )}
          >
            Phone
          </div>
          {isTodo(business.phone) ? (
            <Fact value={business.phone} />
          ) : (
            <a href={`tel:${String(business.phone).replace(/\s/g, "")}`} style={css("font-size:16px")}>
              {business.phone}
            </a>
          )}
          <p style={css("margin:10px 0 0;font-size:13px;line-height:1.6;opacity:.75")}>
            {business.hours}.
          </p>
        </div>

        <div
          style={css(
            "padding:var(--space-4);border:1px solid var(--color-divider);border-radius:var(--radius-md)"
          )}
        >
          <div
            style={css(
              "font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 55%, transparent);margin-bottom:8px"
            )}
          >
            Instagram
          </div>
          {isTodo(business.instagram) ? (
            <Fact value={business.instagram} />
          ) : (
            <a
              href={`https://instagram.com/${business.instagram}`}
              target="_blank"
              rel="noreferrer noopener"
              style={css("font-size:16px")}
            >
              @{business.instagram}
            </a>
          )}
          <p style={css("margin:10px 0 0;font-size:13px;line-height:1.6;opacity:.75")}>
            Where most readers find us, and where the month&rsquo;s artwork goes up first.
          </p>
        </div>
      </div>

      <p>
        Please include your <strong>reference number</strong> — the one shown when you ordered — or
        the name and phone number you subscribed with. It is how we find your envelope in a month
        of them.
      </p>

      <h2>Business hours</h2>
      <p>
        {business.hours}. We are closed on Saturdays, Sundays and public holidays. An email sent
        outside those hours is answered on the next working day, and always within{" "}
        {business.ackHours} hours.
      </p>

      <h2>Registered details</h2>
      <p>
        As required by the Consumer Protection (E-Commerce) Rules, 2020:
      </p>
      <table>
        <tbody>
          <tr>
            <td style={css("width:34%;min-width:150px;font-weight:600")}>Trading name</td>
            <td>{business.tradingName}</td>
          </tr>
          <tr>
            <td style={css("font-weight:600")}>Legal name</td>
            <td>
              <Fact value={business.owner} />
              {!isTodo(business.owner) && <> (proprietor)</>}
            </td>
          </tr>
          <tr>
            <td style={css("font-weight:600")}>Entity type</td>
            <td style={css("text-transform:capitalize")}>{business.entityType}</td>
          </tr>
          <tr>
            <td style={css("font-weight:600")}>Place of business</td>
            <td>
              {address.lines.map((line) => (
                <React.Fragment key={line}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
              {address.state} {address.pincode}
              <br />
              {address.country}
            </td>
          </tr>
          <tr>
            <td style={css("font-weight:600")}>GST</td>
            <td>
              {business.gstin || "Not registered — turnover is below the registration threshold."}
            </td>
          </tr>
          <tr>
            <td style={css("font-weight:600")}>Grievance Officer</td>
            <td>
              <Fact value={grievanceOfficer.name} />
              <br />
              <a href={`mailto:${grievanceOfficer.email}`}>{grievanceOfficer.email}</a>
              <br />
              <a href="/grievance">Grievance Redressal policy</a>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        The address above is our place of business and our address for legal notices. It is a
        working address, not a post box. Please do not send returns there unless we have asked you
        to — see <a href="/refunds">Refunds &amp; Cancellation</a>, which does not generally require
        you to return anything.
      </p>

      <h2>What to write about</h2>
      <ul>
        <li>
          <strong>Your address has changed.</strong> Tell us before the{" "}
          {business.window.closesDay} and that month&rsquo;s envelope follows you.
        </li>
        <li>
          <strong>It has not arrived, or it arrived damaged.</strong> We replace it free — see{" "}
          <a href="/shipping">Shipping &amp; Delivery</a>.
        </li>
        <li>
          <strong>You want to cancel.</strong> See <a href="/refunds">Refunds &amp; Cancellation</a>
          ; a single email is the whole process.
        </li>
        <li>
          <strong>A question about your data</strong>, or you want it corrected or deleted — see the{" "}
          <a href="/privacy">Privacy Policy</a>.
        </li>
        <li>
          <strong>A complaint.</strong> Our <a href="/grievance">Grievance Redressal</a> page sets
          out the timelines we hold ourselves to.
        </li>
        <li>
          <strong>Anything else.</strong> Which letter you liked, what you would like Iris to find
          next, a photograph of the stickers on a water bottle. These are the nice ones.
        </li>
      </ul>

      <Note>
        <p>
          We are two people and a printer, not a call centre. If something has gone wrong with your
          envelope, write to <a href={`mailto:${business.email}`}>{business.email}</a> before
          anything else — it is nearly always sorted the same day.
        </p>
      </Note>
    </LegalPage>
  );
}
