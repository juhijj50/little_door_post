import React from "react";
import LegalPage, { Note } from "./LegalPage.jsx";
import { business } from "../business.js";

export default function Refunds() {
  const { window: win, international: intl } = business;

  return (
    <LegalPage
      path="/refunds"
      title="Refunds & Cancellation"
      summary="Cancel before the 5th and get everything back. After that, the month already in the post is ours and every month still to come is yours."
    >
      <p>
        This page is the whole policy. There is no clause further down that takes back what the top
        of the page gives you.
      </p>

      <h2>The short version</h2>
      <table>
        <thead>
          <tr>
            <th>Situation</th>
            <th>What you get</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              You cancel <strong>before the {win.closesDay}</strong>, while that month&rsquo;s
              window is still open
            </td>
            <td>
              A full refund of everything you paid. Nothing has been printed or posted for you yet.
            </td>
          </tr>
          <tr>
            <td>
              You cancel <strong>after your envelope has been posted</strong>
            </td>
            <td>
              That month is not refundable. Every month still unsent is refunded pro-rata at the
              monthly rate you paid.
            </td>
          </tr>
          <tr>
            <td>Your envelope arrives damaged</td>
            <td>A free replacement, or a refund of that month if you would rather.</td>
          </tr>
          <tr>
            <td>Your envelope never arrives</td>
            <td>The same — replaced free, or refunded.</td>
          </tr>
          <tr>
            <td>Something is missing from the envelope</td>
            <td>We post the missing piece, free.</td>
          </tr>
          <tr>
            <td>We cancel your order, or a month sells out</td>
            <td>A full refund of everything not delivered, without you having to ask.</td>
          </tr>
          <tr>
            <td>
              A rule changes in your country and we cannot deliver <em>(international orders)</em>
            </td>
            <td>
              Every unposted month refunded pro-rata, without you having to ask — or your
              subscription held until service returns. An envelope already in the post and stopped
              at the border is refunded too.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>How to cancel or ask for a refund</h2>
      <p>
        Email <a href={`mailto:${business.email}`}>{business.email}</a> with your reference number —
        the one shown when you ordered — or the name and phone number you subscribed with. That is
        the whole process. There is no form to fill in, no cancellation fee, and no charge for
        cancelling.
      </p>
      <p>
        If an envelope arrived damaged, a photograph helps us a great deal, both to put it right and
        to argue with the courier. It is not a condition of the refund.
      </p>

      <h2>When the money arrives</h2>
      <p>
        We approve or query a refund request <strong>within {business.ackHours} hours</strong> of
        receiving it. Once approved, the refund is initiated to Razorpay the same working day, and
        the money reaches your original payment method{" "}
        <strong>within {business.refundWorkingDays}</strong>.
      </p>
      <p>
        Refunds always go back the way the money came — to the card, UPI handle or bank account you
        paid from. We cannot redirect a refund to a different account, and we will not ask you for
        bank details to process one. Anyone who does is not us.
      </p>
      <p>
        The last leg is your bank&rsquo;s, not ours. If Razorpay has confirmed the refund and it has
        not reached you after {business.refundWorkingDays}, write to us with your reference number
        and we will chase it and send you the Razorpay refund ID to take to your bank.
      </p>

      <h2>How a pro-rata refund is worked out</h2>
      <p>
        A subscription is priced as a monthly rate, and the refund uses the same rate you actually
        paid — not a lower one, and not a recalculated one.
      </p>
      <p>
        For example, on a six-month subscription at {business.plans[2].rate} a month (
        {business.plans[2].total} in total), if you cancel after the second envelope has been
        posted, four months remain unsent. You are refunded 4 × {business.plans[2].rate} ={" "}
        <strong>₹1,200</strong>. The two envelopes already posted are not refunded.
      </p>
      <p>
        If you used a discount code, the refund is worked out on the discounted rate you were
        charged. You are never refunded less than you paid for the months you did not receive.
      </p>

      <h2>Why a posted envelope is not refundable</h2>
      <p>
        Each envelope is printed in a small run for that month and addressed by hand to you
        specifically. Once it is in the post it cannot be recovered, resold or sent to anyone else,
        and the paper goods inside are not in a condition to be restocked once they have left us.
      </p>
      <p>
        That is also why <strong>we do not accept returns</strong> of an envelope you have received
        and simply did not care for. We would rather you told us what you did not like — it changes
        what we make next month, which is worth more to us than the postage.
      </p>
      <p>
        This does not affect your rights if the goods are defective, damaged or not what was
        described. In that case they are replaced or refunded, as above, and your rights under the
        Consumer Protection Act, 2019 stand.
      </p>

      <h2>If delivery fails</h2>
      <ul>
        <li>
          <strong>Our mistake or the courier&rsquo;s</strong> — lost in transit, damaged, delivered
          to the wrong place, or never dispatched: replaced free, or refunded in full for that
          month, whichever you prefer.
        </li>
        <li>
          <strong>An address that was entered wrongly</strong>, or nobody available to receive it
          after the courier&rsquo;s attempts: we cannot recover the envelope, so that month is not
          refundable. We will re-post it once, free, if you send us a corrected address — we would
          rather you got your letter.
        </li>
      </ul>
      <p>
        Full detail on dispatch, delivery windows and undelivered post is on the{" "}
        <a href="/shipping">Shipping &amp; Delivery</a> page.
      </p>

      <h2>Orders posted outside India</h2>
      {!intl.live && (
        <p>
          We do not post outside India yet. This section is published in advance so the terms are
          known before such an order can be placed, and it takes effect when international shipping
          opens.
        </p>
      )}
      <p>
        We do not post to {intl.excluded.short}, and the order form does not offer those countries —
        see <a href="/shipping">Shipping &amp; Delivery</a>.
      </p>
      <ul>
        <li>
          <strong>Customs duty and import taxes are not refundable by us</strong>, because we never
          receive them — they are charged by your country, not by us.
        </li>
        <li>
          <strong>If a change in your country&rsquo;s rules stops us delivering</strong> — a new
          restriction, a ban, a suspended postal route —{" "}
          <strong>we refund every unposted month pro-rata, without you having to ask</strong>, or
          hold your subscription until service returns, whichever you prefer. The full table of
          situations is on the <a href="/shipping">Shipping &amp; Delivery</a> page.
        </li>
        <li>
          <strong>If customs seizes or destroys an envelope already in the post</strong>, under a
          rule that changed after you ordered, <strong>we refund that month in full</strong>. We do
          not send a replacement — a second envelope would meet the same rule and be stopped in its
          turn, so a refund is the only thing that actually reaches you. That is not something you
          chose and we do not treat it as your loss.
        </li>
        <li>
          <strong>
            But an envelope refused, returned or destroyed because of a choice you made is not
            refundable
          </strong>{" "}
          — declining to pay a customs charge, refusing delivery, or an address entered wrongly. No
          rule changed on you there, and the envelope cannot be recovered once it has been refused.
          We will still re-post it once, free, if you send a corrected address and the route is
          open.
        </li>
        <li>
          <strong>The first envelope stopped at a border pauses that whole country.</strong> We
          stop posting there until we know why, tell everyone subscribed there, and hold their
          subscriptions rather than cancelling them. If we cannot resume, every undelivered month
          is refunded pro-rata.
        </li>
        <li>
          <strong>An international envelope is treated as lost eight weeks after dispatch</strong>,
          rather than the three weeks we allow within India, because customs holds are invisible to
          us and often slow. At that point it is replaced or refunded.
        </li>
        <li>
          <strong>Refunds are made in the currency you paid in.</strong> Your bank&rsquo;s exchange
          rate on the day of the refund may differ from the rate on the day you paid, and any
          resulting difference, or a foreign-transaction fee your bank charges, is between you and
          your bank — we refund the full amount we received.
        </li>
      </ul>

      <h2>Gift subscriptions</h2>
      <p>
        A gift subscription can be cancelled or refunded only by the person who paid for it, under
        exactly the same rules above. If the recipient does not want it, please ask the person who
        bought it to write to us.
      </p>

      <h2>Nothing renews by itself</h2>
      <p>
        Your subscription is charged once, for the number of months you chose, and then it ends.
        There is no auto-renewal, no standing instruction and no recurring mandate on your card or
        UPI, so there is nothing to cancel to stop a future charge —{" "}
        <strong>we are not able to charge you again</strong>. If you ever see a repeat charge from
        us, tell us at once and we will refund it immediately and investigate.
      </p>

      <h2>Chargebacks</h2>
      <p>
        If something is wrong, please write to us before raising a dispute with your bank. We settle
        nearly everything within a day, and a chargeback takes weeks and helps neither of us. We are
        a two-person operation and we would much rather just fix it.
      </p>

      <h2>If you are not satisfied</h2>
      <p>
        If you are unhappy with how a refund was handled, escalate it to our Grievance Officer. The
        route, the timelines and the contact details are on the{" "}
        <a href="/grievance">Grievance Redressal</a> page. We acknowledge every complaint within{" "}
        {business.ackHours} hours and resolve it within {business.resolveDays} days.
      </p>

      <Note>
        <p>
          <strong>The rule of thumb:</strong> if we have not yet posted it, you can have your money
          back. If we have posted it and it went wrong, we will replace it or refund it. If we have
          posted it and it arrived fine, that month is ours — and every month still to come is
          still yours to cancel.
        </p>
      </Note>
    </LegalPage>
  );
}
