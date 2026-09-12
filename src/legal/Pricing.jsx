import React from "react";
import LegalPage, { Note } from "./LegalPage.jsx";
import { css } from "../css.js";
import { business } from "../business.js";

/*  The rate card, stated plainly on a page of its own.
 *
 *  The landing page sells; this page just says the number. A payment
 *  aggregator's review wants the price visible in INR, in writing, next to a
 *  description of what is actually being sold — and a reader deciding whether
 *  ₹370 is worth it deserves the same page.
 */
export default function Pricing() {
  return (
    <LegalPage
      path="/pricing"
      title="Pricing"
      summary="What it costs, what you get for it, and what is included. No delivery charge, no tax on top, no renewal."
    >
      <h2>What you are buying</h2>
      <p>
        A subscription to The Little Door Post is an order for monthly envelopes of printed paper
        goods, posted to an address in India. Every envelope contains the same{" "}
        {business.piecesPerMonth} printed pieces:
      </p>
      <ul>
        {business.contents.map((item) => (
          <li key={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</li>
        ))}
      </ul>
      <p>
        The artwork and the writing are new each month. The list of pieces is not — it is the same{" "}
        {business.piecesPerMonth} every time, so you know what you are paying for before you pay for
        it.
      </p>

      <h2>The rate card</h2>
      <p>
        All prices are in Indian Rupees and include postage anywhere in India. A longer subscription
        is a longer commitment at a better monthly rate, not a bundle bought at once — one envelope
        still arrives each month.
      </p>
      <table>
        <thead>
          <tr>
            <th>Subscription</th>
            <th>Monthly rate</th>
            <th>Envelopes</th>
            <th>Total charged</th>
          </tr>
        </thead>
        <tbody>
          {business.plans.map((p) => (
            <tr key={p.months}>
              <td>
                <strong>
                  {p.months} {p.months === 1 ? "month" : "months"}
                </strong>
              </td>
              <td>{p.rate} a month</td>
              <td>{p.months}</td>
              <td>
                <strong>{p.total}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>What is included in that price</h2>
      <ul>
        <li>
          All {business.piecesPerMonth} printed pieces, every month of your subscription.
        </li>
        <li>
          <strong>Postage anywhere in India.</strong> No delivery charge, no surcharge for remote
          addresses.
        </li>
        <li>
          <strong>No tax added at checkout.</strong>{" "}
          {business.gstin
            ? `GST at the applicable rate is already included. GSTIN ${business.gstin}.`
            : "We are not registered for GST, as our turnover is below the registration threshold, so the price shown is the final price."}
        </li>
        <li>Free replacement of anything that arrives damaged, or does not arrive at all.</li>
      </ul>

      <h2>What you will not be charged</h2>
      <div
        style={css(
          "padding:var(--space-4);border:1px solid var(--color-divider);border-radius:var(--radius-md);margin-bottom:var(--space-4)"
        )}
      >
        <p style={css("margin:0")}>
          <strong>There is no auto-renewal.</strong> The full amount is charged once, at the time of
          the order. There is no standing instruction, no e-mandate and no recurring authorisation
          on your card or UPI — we are not technically able to charge you a second time. When your
          last envelope has gone out, the subscription simply ends.
        </p>
      </div>
      <p>
        There are also no joining fees, no cancellation fees, no packaging charges and no
        cash-on-delivery charges. The number on the checkout button is the only number.
      </p>

      <h2>Paying</h2>
      <p>
        Payment is by card, UPI, net banking or wallet, handled by {business.paymentProcessor}{" "}
        (Razorpay). We never see or store your card or UPI credentials — see the{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>If you are ordering from outside India</h2>
      {!business.international.live ? (
        <p>
          We do not post outside India yet, and the order form will not take a foreign address. When
          we open it, the rate card for international orders will be shown here and on the order
          form before you pay — and the two points below will apply to it.
        </p>
      ) : (
        <p>
          International rates are shown on the order form for your country before you pay. Two
          things work differently from an order within India.
        </p>
      )}
      <ul>
        <li>
          <strong>Import charges are not included and are not ours.</strong> Customs duty, import
          VAT or GST and handling fees are set and collected by the country the envelope arrives in.
          They are payable by the recipient, we cannot predict them, and we receive none of them.
          Import rules change often — the <a href="/shipping">Shipping &amp; Delivery</a> page sets
          out exactly what we do when they change mid-subscription, including refunding every month
          we can no longer deliver.
        </li>
        <li>
          <strong>Your bank sets the exchange rate.</strong> If you pay in a currency other than the
          one your card is billed in, the rate and any foreign-transaction fee are your bank&rsquo;s,
          not ours. A refund is made in the currency you paid, for the full amount we received; if
          the rate has moved since, the difference is between you and your bank.
        </li>
      </ul>

      <h2>Discount codes</h2>
      <p>
        A code we have issued to you is tied to the phone number it was issued against and works
        only from that number. It is applied before payment, and the discounted price is shown to
        you on the checkout screen before you pay anything.
      </p>

      <h2>If prices change</h2>
      <p>
        We may change these prices, but never for a subscription already paid for. The price you
        were shown and charged at checkout is the price of that subscription for its whole length,
        whatever happens to the rate card afterwards.
      </p>

      <Note>
        <p>
          <strong>In short:</strong> {business.plans[0].total} for one envelope, down to{" "}
          {business.plans[2].rate} a month if you take six. Postage included, nothing added at
          checkout, and nothing charged again afterwards. See{" "}
          <a href="/refunds">Refunds &amp; Cancellation</a> for how to get it back.
        </p>
      </Note>
    </LegalPage>
  );
}
