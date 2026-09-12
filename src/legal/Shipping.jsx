import React from "react";
import LegalPage, { Note } from "./LegalPage.jsx";
import { css } from "../css.js";
import { business } from "../business.js";

export default function Shipping() {
  const { window: win, international: intl } = business;

  return (
    <LegalPage
      path="/shipping"
      title="Shipping & Delivery"
      summary="One envelope a month, posted across India, postage already paid. Here is exactly when it leaves us and when it should reach you."
    >
      <h2>Where we post</h2>
      <p>
        <strong>
          {intl.live
            ? "We post within India, and to the countries listed at checkout."
            : "We post within India only."}
        </strong>{" "}
        Every state and union territory, including addresses served only by India Post.
      </p>
      {!intl.live && (
        <p>
          We do not ship internationally <strong>yet</strong>. The order form will not accept an
          address outside India today, and an order placed for one will be declined and refunded in
          full. We intend to open it — the section below sets out the terms that will apply when we
          do, so that nobody discovers them at the point of paying.
        </p>
      )}

      <h2>What postage costs</h2>
      <p>
        <strong>Nothing extra.</strong> Postage anywhere in India is included in the price you see
        on the <a href="/pricing">Pricing</a> page. There is no delivery charge, no fuel surcharge,
        no remote-area fee and no cash-on-delivery option — the price at checkout is the whole
        price.
      </p>
      <p>
        For an envelope crossing a border that is still true of <em>our</em> price, but the
        destination country may add import charges of its own. Those are not ours and not included —
        see <a href="#outside-india">Posting outside India</a> below.
      </p>

      <h2>The monthly rhythm</h2>
      <p>
        Envelopes go out in one batch each month rather than one at a time. That is what lets a
        hand-addressed envelope cost what it does.
      </p>
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>What happens</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>{win.opensDay} of the month</strong>
            </td>
            <td>Sign-ups open for next month&rsquo;s envelope.</td>
          </tr>
          <tr>
            <td>
              <strong>{win.closesDay} of the next month</strong>
            </td>
            <td>
              Sign-ups close. This is also the last moment to cancel for a full refund, or to send
              us a change of address for that month.
            </td>
          </tr>
          <tr>
            <td>
              <strong>The 10 days after the {win.closesDay}</strong>
            </td>
            <td>
              Everything is printed, packed, addressed by hand and handed to the post. This is your
              dispatch window.
            </td>
          </tr>
          <tr>
            <td>
              <strong>{business.deliveryEstimate}</strong>
            </td>
            <td>It reaches you. Where you are decides where in that range you fall.</td>
          </tr>
        </tbody>
      </table>
      <p>
        So an order placed in an open window is dispatched {business.dispatchWindow} and should be
        with you {business.deliveryEstimate} after that. On a three- or six-month subscription, each
        following envelope follows the same rhythm, one a month, until your subscription ends.
      </p>

      <h2>How long delivery takes</h2>
      <p>
        <strong>{business.deliveryEstimate} from dispatch</strong>, typically:
      </p>
      <ul>
        <li>
          <strong>Metros and larger cities</strong> — usually within a week of dispatch.
        </li>
        <li>
          <strong>Smaller towns</strong> — around one to two weeks.
        </li>
        <li>
          <strong>Remote, hill and island addresses</strong>, and anywhere served only by India
          Post — up to three weeks.
        </li>
      </ul>
      <p>
        These are estimates from experience, not guarantees. Once an envelope is handed to the post
        the timing belongs to the postal service, and festivals, elections, strikes, weather and
        local disruption all slow it down. We will tell you if we know a month is running late.
      </p>

      <h2>Tracking</h2>
      <p>
        Where a tracked service is used, we email you the tracking number when the batch goes out.
        Some envelopes travel as ordinary post, which is not trackable — if yours has not arrived
        three weeks after dispatch, do not wait on a tracking page. Write to us and we will treat it
        as lost and replace it.
      </p>

      <h2>Your address</h2>
      <p>
        Iris addresses envelopes by hand, from exactly what you typed into the form. We post to that
        address and no other. Please read it back before you pay — a missing flat number is the
        single commonest reason an envelope does not arrive.
      </p>
      <p>
        A landmark is optional on the form and genuinely useful; Indian couriers use them. A correct
        phone number matters too, because couriers call before delivering.
      </p>

      <h3>Changing your address</h3>
      <p>
        Email <a href={`mailto:${business.email}`}>{business.email}</a> with your reference number.
        A change that reaches us <strong>before the {win.closesDay}</strong> applies to that
        month&rsquo;s envelope. After that the envelope is already addressed and in the batch, so the
        change applies from the following month.
      </p>

      <h2>If it does not arrive</h2>
      <p>
        Write to us. We will not make you prove anything, and there is no window you can miss for
        reporting it.
      </p>
      <ul>
        <li>
          <strong>Lost in the post, or damaged in transit</strong> — we replace it free, or refund
          that month if you would rather.
        </li>
        <li>
          <strong>Something missing from the envelope</strong> — we post the missing piece, free.
        </li>
        <li>
          <strong>Returned to us undelivered</strong> — usually a wrong or incomplete address, or
          nobody available after the courier&rsquo;s attempts. We will hold it and re-post it once,
          free, as soon as you send us a corrected address.
        </li>
        <li>
          <strong>Marked delivered but not in your hands</strong> — tell us. It is often with a
          neighbour, a watchman or a gate office, and we will help you chase it; if it does not turn
          up we replace it.
        </li>
      </ul>
      <p>
        An address entered wrongly is the one case where the envelope cannot be recovered and that
        month is not refundable — though we will still re-post it once for free. The full position
        is on the <a href="/refunds">Refunds &amp; Cancellation</a> page.
      </p>

      <h2 id="outside-india">Posting outside India</h2>
      <div
        style={css(
          "padding:var(--space-4);border-radius:var(--radius-md);margin-bottom:var(--space-4);border:1px solid " +
            (intl.live ? "var(--color-divider)" : "var(--color-accent)")
        )}
      >
        <p style={css("margin:0")}>
          {intl.live ? (
            <>
              <strong>International orders are open.</strong> The countries we can post to are
              listed on the order form. Everything in this section applies to them.
            </>
          ) : (
            <>
              <strong>International orders are not open yet.</strong> Nothing below is in force
              today, and the order form will not take an address outside India. It is published in
              advance so that the terms are not a surprise on the day we do open, and because these
              are the conditions we will be bound by.
            </>
          )}
        </p>
      </div>

      <h3>Where we will not post</h3>
      <p>
        Even once international orders open,{" "}
        <strong>we will not be posting to {intl.excluded.short}.</strong> Those destinations are not
        offered on the order form and an order for one will be declined and refunded in full.
      </p>
      <p>
        This is a deliberate choice rather than an oversight. Consumer law in those countries
        requires a returns and refunds regime that a two-person workshop posting single envelopes
        from Gujarat cannot operate properly at that distance — the return postage alone would cost
        more than the envelope. We would rather decline the order honestly than take it on terms we
        could not honour. If that changes, this page changes with it.
      </p>
      <p>
        Please do not try to work around it with a forwarding address or a re-shipping service. We
        would have no way to support the order or put anything right, and once you redirect a parcel
        yourself the protections your own law would normally give you stop applying to it.
      </p>

      <h3>Customs, duty and local taxes</h3>
      <p>
        An envelope crossing a border is an import, and the country it arrives in decides what that
        costs. <strong>Any customs duty, import VAT or GST, handling fee or brokerage charged by
        the destination country is payable by the recipient</strong>, not by us. These are levied by
        that country&rsquo;s government, collected by its postal service or courier, and we never
        receive a rupee of them.
      </p>
      <p>
        They are <strong>not</strong> included in the price you pay us, and we cannot tell you in
        advance what they will be — the same envelope can be free in one country and carry a charge
        in its neighbour. If you are unsure, your own customs or postal authority can tell you what
        applies to printed paper goods and stickers of the value shown on the declaration.
      </p>
      <p>
        We declare the contents honestly and at their true value: printed paper goods and vinyl
        stickers. <strong>We will not under-declare the value, mark a paid order as a gift, or
        mis-describe the contents</strong>, whatever the saving would be. Please do not ask — it is
        customs fraud, it is the recipient who is prosecuted for it, and we are not willing to put a
        reader in that position.
      </p>

      <h3>If the rules change where you live</h3>
      <p>
        This is the part worth reading twice, because it is the thing most likely to actually happen
        over six months. Import rules change often, at no notice, and with no regard for a
        subscription already paid for. Two examples from the last year alone:
      </p>
      <ul>
        {intl.recentChanges.map((c) => (
          <li key={c.what}>
            <strong>{c.what}</strong> ({c.when}) — {c.effect}.
          </li>
        ))}
      </ul>
      <p>
        Neither was anything we did, and neither was anything we could have prevented. So here is
        what we commit to when it happens, which is the only part of it we control:
      </p>
      <table>
        <thead>
          <tr>
            <th>What changes</th>
            <th>What we do</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>A new or increased duty, tax or handling fee</strong> in your country
            </td>
            <td>
              We keep posting, and the charge is yours as above. But we will tell you as soon as we
              know, and if you would rather not go on paying it,{" "}
              <strong>you may cancel and we refund every month not yet posted, pro-rata</strong>,
              with no notice period and no fee.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Your country restricts or bans</strong> importing what we send, or imposes a
              requirement we cannot meet
            </td>
            <td>
              We stop posting to you at once, because sending it anyway would mean it is seized at
              your expense. We tell you, and{" "}
              <strong>refund every unposted month in full, pro-rata, without you having to ask.</strong>
            </td>
          </tr>
          <tr>
            <td>
              <strong>Postal service to your country is suspended</strong> — by India Post, by your
              own postal operator, or by war, sanctions, disaster or a strike
            </td>
            <td>
              We hold your subscription rather than cancel it, and post the months you are owed once
              service resumes — nothing is lost, only late. If it stays suspended, or you would
              rather not wait, <strong>we refund the unposted months pro-rata</strong>. Your choice,
              not ours.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Customs seizes, destroys or returns</strong> an envelope already in the post,
              under a rule that changed after you ordered
            </td>
            <td>
              That is not your fault and we do not treat it as yours.{" "}
              <strong>We refund that month in full.</strong> We do not send a replacement, because
              a second envelope would meet the same rule and be seized in its turn — a refund is
              the only thing that actually reaches you. If the rule makes future envelopes
              impossible, we refund the rest of the subscription too.
            </td>
          </tr>
          <tr>
            <td>
              <strong>The envelope is refused, returned or destroyed because of a choice you
              made</strong> — declining to pay a customs charge, refusing delivery, an address
              entered wrongly, or ordering to a country where you were not permitted to receive it
            </td>
            <td>
              This one is not refundable. It is not a rule that changed on you; it is a cost or a
              step you decided not to take, and the envelope cannot be recovered once it is
              refused. We will still re-post it once, free, if you send us a corrected address and
              the route is open.
            </td>
          </tr>
          <tr>
            <td>
              <strong>India changes its export rules</strong>, or we lose the ability to post
              abroad at a workable price
            </td>
            <td>
              We stop taking new international orders, honour every subscription already paid for if
              we lawfully can, and{" "}
              <strong>refund in full, pro-rata, anything we cannot deliver.</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <h3>What we do the moment one goes wrong</h3>
      <p>
        <strong>
          The first envelope stopped at a border pauses that whole country.
        </strong>{" "}
        We do not post there again until we understand why it happened, because the alternative is
        sending a second envelope into the same rule and a third after that. If you are subscribed
        in a country we have paused, you will hear from us rather than wonder where your post has
        got to, and your subscription is held — not cancelled — while we work it out.
      </p>
      <p>
        If it turns out we can resume, we post the months you are owed and nothing is lost but
        time. If it turns out we cannot,{" "}
        <strong>we refund every month we did not deliver, pro-rata</strong>, and say so plainly
        rather than letting a subscription quietly run out.
      </p>

      <p>
        The principle underneath all six rows is one sentence:{" "}
        <strong>
          if a change outside your control stops an envelope you have paid for from reaching you,
          you get that money back.
        </strong>{" "}
        We will not keep money for envelopes we cannot send. The refund runs through the usual
        route, reaching your original payment method within {business.refundWorkingDays} — see{" "}
        <a href="/refunds">Refunds &amp; Cancellation</a>.
      </p>
      <p>
        What we ask in return is only this: it is your responsibility to be lawfully allowed to
        receive what you have ordered where you live. If importing illustrated printed matter or
        stickers is restricted in your country, please do not order — we have no practical way to
        know the import rules of every country we post to, and we rely on you there.
      </p>

      <h3>Delivery times abroad</h3>
      <p>
        Considerably longer than within India, and much less predictable: typically two to six weeks
        from dispatch, and longer where an envelope is held for a customs inspection. Time spent in
        customs is not something we can see, hurry or be told about. We will treat an international
        envelope as lost once it is eight weeks past dispatch, and replace or refund it then.
      </p>

      <h3>Cancelling an international order</h3>
      <p>
        The ordinary rule applies: cancel before the {win.closesDay} for a full refund, and every
        month not yet posted is refundable pro-rata at any time after that. See{" "}
        <a href="/refunds">Refunds &amp; Cancellation</a>.
      </p>

      <h2>Risk and title</h2>
      <p>
        The envelope and everything in it remain at our risk until they are delivered to the address
        you gave us. If it is lost or damaged before it reaches you, that is ours to put right, not
        yours to absorb.
      </p>

      <h2>Questions</h2>
      <p>
        Email <a href={`mailto:${business.email}`}>{business.email}</a> with your reference number
        and a person will answer — {business.hours}. Full contact details are on the{" "}
        <a href="/contact">Contact Us</a> page.
      </p>

      <Note>
        <p>
          <strong>In short:</strong> India only, postage included, dispatched{" "}
          {business.dispatchWindow}, delivered {business.deliveryEstimate}. Lost or damaged post is
          replaced free. Tell us before the {win.closesDay} if you have moved.
        </p>
      </Note>
    </LegalPage>
  );
}
