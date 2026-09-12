import React from "react";
import LegalPage, { Fact, Note } from "./LegalPage.jsx";
import { business, addressLine } from "../business.js";

export default function Terms() {
  const { window: win, international: intl } = business;

  return (
    <LegalPage
      path="/terms"
      title="Terms & Conditions"
      summary="What you are buying, what it costs, when it arrives, and what each of us is promising the other."
    >
      <p>
        These terms govern your use of this website and your subscription to The Little Door
        Post. By placing an order you accept them. Please read them before you pay — particularly{" "}
        <a href="/refunds">Refunds &amp; Cancellation</a> and{" "}
        <a href="/shipping">Shipping &amp; Delivery</a>, which form part of these terms.
      </p>

      <h2>1. Who you are dealing with</h2>
      <p>
        The Little Door Post is the trading name of a {business.entityType} carried on by{" "}
        <strong>
          <Fact value={business.owner} />
        </strong>
        , with its place of business at {addressLine()}. In these terms &ldquo;we&rdquo;,
        &ldquo;us&rdquo; and &ldquo;our&rdquo; mean that business, and &ldquo;you&rdquo; means the
        person placing the order.
      </p>
      <p>
        A {business.entityType} has no legal identity separate from its proprietor, so the
        proprietor named above is personally responsible for performing this contract. You can
        reach us at <a href={`mailto:${business.email}`}>{business.email}</a>, or by post at the
        address above. Full details are on the <a href="/contact">Contact Us</a> page.
      </p>
      {business.gstin ? (
        <p>GSTIN: {business.gstin}.</p>
      ) : (
        <p>
          We are not registered for GST, as our turnover is below the registration threshold. Prices
          on this site are therefore final and no tax is added at checkout.
        </p>
      )}

      <h2>2. What a subscription is</h2>
      <p>
        A subscription to The Little Door Post is an order for a fixed number of monthly envelopes
        of printed paper goods, posted to your address{intl.live ? "" : " in India"}. It is a
        purchase of physical printed goods. It is not a lottery, a draw, a game of chance, an investment, or a promise of
        anything other than the printed items listed below.
      </p>
      <p>Every envelope contains the same {business.piecesPerMonth} printed pieces:</p>
      <ul>
        {business.contents.map((item) => (
          <li key={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</li>
        ))}
      </ul>
      <p>
        The artwork and the writing change from month to month — that is the point of a monthly
        letter — but the list of pieces does not. You always know in advance exactly what will be in
        the envelope: {business.piecesPerMonth} printed pieces, the same {business.piecesPerMonth}{" "}
        every month.
      </p>
      <p>
        The characters, places and events in the letters are fiction. Iris is an illustrated
        character, not a real correspondent, and the letters are written by us.
      </p>

      <h2>3. Prices and payment</h2>
      <p>
        All prices are in Indian Rupees (₹) and include postage within India. The current rate card
        is on the <a href="/pricing">Pricing</a> page and is shown again on the order form before
        you pay. In summary:
      </p>
      <table>
        <thead>
          <tr>
            <th>Subscription</th>
            <th>Monthly rate</th>
            <th>Total charged</th>
          </tr>
        </thead>
        <tbody>
          {business.plans.map((p) => (
            <tr key={p.months}>
              <td>
                {p.months} {p.months === 1 ? "month" : "months"}
              </td>
              <td>{p.rate} a month</td>
              <td>
                <strong>{p.total}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        A longer subscription is a longer commitment at a better monthly rate. It is not a bundle of
        envelopes bought at once — one envelope still arrives each month.
      </p>
      <p>
        <strong>The whole amount is charged once, at the time of the order.</strong> There is no
        automatic renewal, no standing instruction and no recurring mandate on your card or UPI. We
        cannot and do not charge you again. When your subscription reaches its last envelope it
        simply ends, and if you want another you place a new order.
      </p>
      <p>
        Payments are processed by {business.paymentProcessor} (Razorpay). We never see or store your
        card number, UPI PIN, CVV or bank credentials — those go to Razorpay, not to us. Your use of
        Razorpay at checkout is also subject to Razorpay&rsquo;s own terms.
      </p>
      <p>
        Prices may change, but never for an order already placed. What you were shown and charged at
        checkout is what you have bought.
      </p>

      <h3>Discount codes</h3>
      <p>
        A code we have issued to you is tied to the phone number it was issued against, and works
        only from that number. Codes are not transferable and cannot be sold. We may withdraw a code
        at any time before it is used.
      </p>

      <h2>4. Ordering and the monthly window</h2>
      <p>
        Envelopes go out in monthly batches. Sign-ups for a given month open on the {win.opensDay}{" "}
        of the previous month and close on the {win.closesDay}. An order placed inside a window
        joins that month&rsquo;s batch; the dates for each month are shown on the order form and
        explained on the <a href="/shipping">Shipping &amp; Delivery</a> page.
      </p>
      <p>
        Your order is an offer to buy. The contract is formed when we accept it, which we do by
        confirming the order after payment succeeds. You will be given a reference number — please
        keep it, as it is the fastest way for us to find your order if you write to us.
      </p>
      <p>
        We may decline or cancel an order, refunding it in full, if the address is one we cannot
        post to{intl.live ? "" : " — which today means anywhere outside India"}, if we suspect fraud or a payment dispute, if a discount code has
        been misused, or if a genuine pricing or stock error has occurred. We are a small workshop
        and print in limited runs; if a month sells out, we will tell you and refund you rather than
        substitute something else.
      </p>

      <h2>5. Delivery</h2>
      <p>
        {intl.live
          ? "We post within India and to the countries listed on the order form."
          : "We post within India only. We do not ship internationally yet, and the order form will not accept an address outside India — see clause 6."}{" "}
        For an address in India, dispatch is {business.dispatchWindow} and delivery normally takes{" "}
        {business.deliveryEstimate}. The full terms — including what happens to a wrong
        address, a missed delivery or a package damaged in the post — are on the{" "}
        <a href="/shipping">Shipping &amp; Delivery</a> page and form part of these terms.
      </p>
      <p>
        <strong>Please check your address carefully.</strong> Iris addresses envelopes by hand from
        exactly what you type. We post to the address you give us, and we cannot recover an envelope
        sent to an address that was entered wrongly.
      </p>

      <h2>6. Orders from outside India</h2>
      {intl.live ? (
        <p>
          We post to the countries listed on the order form. The clauses below apply to those
          orders in addition to everything else on this page.
        </p>
      ) : (
        <p>
          We do not currently sell or post outside India, and the order form will not accept a
          foreign address. We intend to, and the clauses below are published in advance so that the
          terms of an international order are known before it can be placed rather than discovered
          afterwards. They take effect for such orders when international shipping opens.
        </p>
      )}
      <p>
        <strong>Import charges are the recipient&rsquo;s.</strong> Customs duty, import VAT or GST,
        handling and brokerage fees charged by the destination country are levied by that country,
        not by us, are not included in our price, and are payable by the recipient. We cannot
        predict them and we receive none of them.
      </p>
      <p>
        <strong>Customs declarations are made honestly.</strong> We declare the contents as printed
        paper goods and vinyl stickers at their true value. We will not under-declare a value or
        mark a paid order as a gift, and we will refuse a request to do so.
      </p>
      <p>
        <strong>You must be permitted to receive the goods where you live.</strong> You confirm, in
        ordering, that importing illustrated printed matter and stickers is lawful at your address.
        We cannot know the import rules of every country we post to and we rely on you for this.
      </p>

      <h3>If the law changes where you are</h3>
      <p>
        Import rules change without notice and without regard to a subscription already paid for.
        Where a change of law, tax, tariff, sanction, import restriction or postal suspension —
        anywhere along the route, including in India — prevents us from delivering an envelope you
        have paid for:
      </p>
      <ul>
        <li>
          We will tell you as soon as we know, and we will not go on taking money for envelopes we
          cannot send.
        </li>
        <li>
          <strong>
            Every month not yet posted is refunded to you pro-rata, at the rate you paid.
          </strong>{" "}
          If the obstacle is temporary, you may instead choose to have your subscription held and
          resumed when service returns.
        </li>
        <li>
          Where a change merely makes delivery more expensive for you — a new duty, say — we keep
          posting and the charge remains yours, but you may cancel for a pro-rata refund of unsent
          months at any time, with no notice and no fee.
        </li>
      </ul>
      <p>
        The complete table of situations and what we do in each is on the{" "}
        <a href="/shipping">Shipping &amp; Delivery</a> page.
      </p>

      <h3>Events outside anyone&rsquo;s control</h3>
      <p>
        We are not liable for failing or delaying performance because of something genuinely beyond
        our reasonable control — war, civil unrest, sanctions, epidemic, natural disaster, fire,
        flood, strike, the suspension or failure of a postal or courier service, the act of a
        customs or government authority, or the failure of a payment or hosting provider.
      </p>
      <p>
        This is a limit on our liability for the delay, not a licence to keep your money. If such an
        event stops us delivering, the refund rules immediately above still apply in full: you get
        back what you paid for envelopes that never came.
      </p>

      <h3>Countries we do not sell to</h3>
      <p>
        <strong>We do not sell or post to {intl.excluded.short}</strong>, and the order form does
        not offer those destinations. We are a two-person workshop, and consumer law there requires
        a refund regime we are not set up to operate across that distance; rather than offer terms
        we could not honour properly, we would rather not take the order at all.
      </p>
      <p>
        If you live there, please do not attempt to order through a forwarding address or a
        re-shipper. We would not be able to support the order, and the protections your own law
        would normally give you would not reach a parcel you had redirected yourself.
      </p>

      <h3>Which country&rsquo;s consumer law applies</h3>
      <p>
        Clause 13 chooses Indian law. But a consumer&rsquo;s own local protections generally cannot
        be contracted away, and we do not try to: if you order from a country whose law gives you
        rights stronger than these terms,{" "}
        <strong>those rights apply to you and nothing here reduces them.</strong>
      </p>

      <h2>7. Cancelling, and getting your money back</h2>
      <p>
        You may cancel before that month&rsquo;s window closes on the {win.closesDay} and be
        refunded in full. After an envelope has been posted, that month is not refundable, but any
        months not yet posted are refunded pro-rata. Anything that arrives damaged, or does not
        arrive at all, is replaced free or refunded.
      </p>
      <p>
        The complete policy, with the conditions and the timelines, is on the{" "}
        <a href="/refunds">Refunds &amp; Cancellation</a> page and forms part of these terms.
      </p>

      <h2>8. Your account details</h2>
      <p>
        You agree that the details you give us are true, that the address is one you are entitled to
        receive post at, and that you will tell us if it changes. If you are ordering an envelope as
        a gift for someone else, you confirm that you have their permission to give us their
        address.
      </p>
      <p>
        You must be 18 or older to place an order and pay. Children are very welcome to read the
        letters — a parent or guardian simply has to be the one who orders. See the{" "}
        <a href="/privacy">Privacy Policy</a> for how we treat a child&rsquo;s data.
      </p>

      <h2>9. What we own, and what you may do with it</h2>
      <p>
        The letters, illustrations, stickers, prints, activity sheets, the character of Iris, the
        name &ldquo;The Little Door Post&rdquo; and everything on this website are our intellectual
        property, or are used by us with permission.
      </p>
      <p>
        The envelope is yours once it arrives, and you may do as you like with your own copy — read
        it, frame it, stick the stickers, give it away, photograph it and post the photographs, and
        we would be delighted if you did. What you may not do is reproduce, reprint, scan and
        distribute, or sell our artwork or writing, or use it commercially, or create merchandise
        from it, without our written permission.
      </p>

      <h2>10. What we do not promise</h2>
      <p>
        We make the envelopes with care, but we are a small workshop and some things are outside our
        hands. We do not promise that the website will be available uninterrupted, that the post
        will always run on time, or that a particular month&rsquo;s artwork will suit a particular
        taste.
      </p>
      <p>
        Nothing in these terms limits our liability for death or personal injury caused by our
        negligence, for fraud, or for anything else that cannot be limited under the Consumer
        Protection Act, 2019 or other applicable Indian law. Subject to that, our total liability to
        you in connection with an order is limited to the amount you paid for it.
      </p>
      <p>
        Your rights as a consumer under Indian law stand alongside these terms and are not reduced
        by them.
      </p>

      <h2>11. If something goes wrong</h2>
      <p>
        Please write to us first — most things are settled in a single email. We acknowledge every
        complaint within {business.ackHours} hours and resolve it within {business.resolveDays}{" "}
        days. Our Grievance Officer, their contact details, and the escalation route if you are not
        satisfied, are on the <a href="/grievance">Grievance Redressal</a> page.
      </p>

      <h2>12. Changes to these terms</h2>
      <p>
        We may update these terms — to correct something, to reflect a change in how we work, or
        because the law changes. The version published on this page when you place an order is the
        one that governs that order. A change never applies backwards to a subscription you have
        already paid for. The date at the top of this page tells you when it last changed.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These terms are governed by the laws of India, and the courts at {business.jurisdiction}{" "}
        have jurisdiction. This does not take away your right, as a consumer, to bring a complaint
        before the consumer forum where you live.
      </p>

      <Note>
        <p>
          <strong>In short:</strong> {business.piecesPerMonth} printed pieces a month, posted across
          India, paid for once with no auto-renewal. Cancel before the {win.closesDay} for a full
          refund; unsent months always come back pro-rata; anything damaged or lost is replaced.
          Write to <a href={`mailto:${business.email}`}>{business.email}</a> and a person will
          answer.
        </p>
      </Note>
    </LegalPage>
  );
}
