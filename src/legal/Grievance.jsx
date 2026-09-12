import React from "react";
import LegalPage, { Fact, Note } from "./LegalPage.jsx";
import { css } from "../css.js";
import { business, addressLine, isTodo } from "../business.js";

/*  Grievance Redressal.
 *
 *  Required three times over: by the Consumer Protection (E-Commerce) Rules,
 *  2020, which want a named officer and a one-month resolution; by the DPDP
 *  Act, 2023, which wants a route for data complaints; and by a payment
 *  aggregator's activation check, which looks for the officer's name,
 *  designation and contact details on a page of their own.
 *
 *  In a one-person business the officer is the proprietor. Saying so is more
 *  honest than inventing a department, and the timelines below are the ones
 *  that actually bind us.
 */
export default function Grievance() {
  const { grievanceOfficer: officer } = business;

  return (
    <LegalPage
      path="/grievance"
      title="Grievance Redressal"
      summary="If something has gone wrong and an ordinary email did not fix it, this is the escalation — a named person, a clock, and somewhere to go above us."
    >
      <p>
        We would much rather you never needed this page. Most problems — a late envelope, a wrong
        address, a refund — are settled the same day by writing to{" "}
        <a href={`mailto:${business.email}`}>{business.email}</a>. Please try that first.
      </p>
      <p>
        If that did not work, or the matter is serious enough to go straight to the top, this is how
        to escalate and what we commit to.
      </p>

      <h2>Our Grievance Officer</h2>
      <div
        style={css(
          "padding:var(--space-4);border:1px solid var(--color-divider);border-radius:var(--radius-md);background:color-mix(in srgb, var(--color-surface) 60%, var(--color-bg));margin-bottom:var(--space-4)"
        )}
      >
        <table style={css("margin:0")}>
          <tbody>
            <tr>
              <td style={css("width:30%;min-width:132px;font-weight:600")}>Name</td>
              <td>
                <Fact value={officer.name} />
              </td>
            </tr>
            <tr>
              <td style={css("font-weight:600")}>Designation</td>
              <td>
                {officer.designation} — also the proprietor of {business.tradingName}
              </td>
            </tr>
            <tr>
              <td style={css("font-weight:600")}>Email</td>
              <td>
                <a href={`mailto:${officer.email}`}>{officer.email}</a>
              </td>
            </tr>
            <tr>
              <td style={css("font-weight:600")}>Phone</td>
              <td>
                {isTodo(business.phone) ? (
                  <Fact value={business.phone} />
                ) : (
                  <a href={`tel:${String(business.phone).replace(/\s/g, "")}`}>{business.phone}</a>
                )}
                <br />
                <span style={css("opacity:.75")}>{business.hours}</span>
              </td>
            </tr>
            <tr style={css("border:0")}>
              <td style={css("font-weight:600")}>Post</td>
              <td>{addressLine()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Appointed under Rule 4(5) of the Consumer Protection (E-Commerce) Rules, 2020, and acting as
        the contact point for data protection questions under the Digital Personal Data Protection
        Act, 2023.
      </p>

      <h2>What we commit to</h2>
      <table>
        <thead>
          <tr>
            <th>Stage</th>
            <th>Within</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>We acknowledge your complaint and give it a ticket number</td>
            <td>
              <strong>{business.ackHours} hours</strong> of receiving it
            </td>
          </tr>
          <tr>
            <td>We tell you what we have found and what we are doing about it</td>
            <td>
              <strong>7 days</strong>
            </td>
          </tr>
          <tr>
            <td>We resolve it — refund, replacement, correction or a clear explanation</td>
            <td>
              <strong>{business.resolveDays} days</strong> of receiving it
            </td>
          </tr>
          <tr>
            <td>A refund, once approved, reaches your original payment method</td>
            <td>
              <strong>{business.refundWorkingDays}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        If a matter genuinely needs longer than {business.resolveDays} days, we will write and tell
        you why and when to expect an answer, rather than letting the clock run out in silence.
      </p>

      <h2>How to raise a grievance</h2>
      <p>
        Email <a href={`mailto:${officer.email}`}>{officer.email}</a> with{" "}
        <strong>&ldquo;Grievance&rdquo;</strong> in the subject line. So that we can resolve it
        inside the timelines above rather than spending them asking questions, please include:
      </p>
      <ul>
        <li>Your reference number, or the name and phone number you subscribed with.</li>
        <li>What went wrong, and when.</li>
        <li>What you have already tried, and what any earlier reply from us said.</li>
        <li>What you would like us to do about it.</li>
        <li>Photographs, if the envelope or anything in it arrived damaged.</li>
      </ul>
      <p>
        You may also write by post to the address above, or telephone during business hours. A
        complaint made by phone is logged and confirmed to you by email, so there is a record on
        both sides.
      </p>

      <h2>If we do not put it right</h2>
      <p>
        Our timelines do not replace your rights. If you are not satisfied with our response, or we
        have not responded in time, you can take it further.
      </p>

      <h3>For a consumer complaint</h3>
      <p>
        You may complain to the National Consumer Helpline on <strong>1915</strong>, or online at{" "}
        <a href="https://consumerhelpline.gov.in" target="_blank" rel="noreferrer noopener">
          consumerhelpline.gov.in
        </a>
        , or file a case with the District, State or National Consumer Disputes Redressal Commission
        — including, under the Consumer Protection Act, 2019, the one where{" "}
        <strong>you</strong> live rather than where we do.
      </p>

      <h3>For a data protection complaint</h3>
      <p>
        Raise it with our Grievance Officer first — under the Digital Personal Data Protection Act,
        2023 that is the required first step. If we do not resolve it, you may complain to the{" "}
        <strong>Data Protection Board of India</strong>. Your rights over your data, and how to
        exercise them, are set out in our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h3>For a payment complaint</h3>
      <p>
        Payments are processed by {business.paymentProcessor} (Razorpay), an RBI-authorised payment
        aggregator. If a payment failed, was taken twice, or a refund has been confirmed by us but
        has not reached you, write to us first — we will send you the Razorpay payment or refund ID,
        which is what your bank will ask for. You may also escalate to Razorpay&rsquo;s own
        grievance channel, or to your bank or card issuer.
      </p>

      <Note>
        <p>
          <strong>Please write to us before raising a chargeback.</strong> A dispute through your
          bank takes weeks and costs both of us; an email usually takes a day. We have never
          knowingly left someone out of pocket, and we are not about to start.
        </p>
      </Note>
    </LegalPage>
  );
}
