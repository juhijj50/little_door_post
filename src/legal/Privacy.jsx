import React from "react";
import LegalPage, { Fact, Note, Rows } from "./LegalPage.jsx";
import { business, addressLine } from "../business.js";

export default function Privacy() {
  return (
    <LegalPage
      path="/privacy"
      title="Privacy Policy"
      summary="We ask for an address because we are posting you something. This page says exactly what we hold, who else sees it, how long we keep it, and how to make us delete it."
    >
      <p>
        This policy explains how The Little Door Post collects, uses, shares and protects your
        personal data. It is written to meet India&rsquo;s Digital Personal Data Protection Act,
        2023 and the Information Technology (Reasonable Security Practices and Procedures and
        Sensitive Personal Data or Information) Rules, 2011.
      </p>

      <h2>Who is responsible for your data</h2>
      <p>
        The data fiduciary is The Little Door Post, the trading name of a {business.entityType}{" "}
        carried on by{" "}
        <strong>
          <Fact value={business.owner} />
        </strong>
        , at {addressLine()}.
      </p>
      <p>
        For any question about your data, or to exercise any of the rights below, write to{" "}
        <a href={`mailto:${business.grievanceOfficer.email}`}>{business.grievanceOfficer.email}</a>.
        The same person handles data questions and grievances; their details are on the{" "}
        <a href="/grievance">Grievance Redressal</a> page.
      </p>

      <h2>What we collect, and why</h2>
      <p>
        We collect only what a monthly posted envelope actually needs. Each item below is something
        we use; none of it is gathered speculatively.
      </p>

      <h3>When you subscribe</h3>
      <Rows
        items={[
          ["Name", "To address the envelope, and to recognise you if you subscribe again."],
          [
            "Postal address",
            "Street, area, landmark, city, state and PIN code — so the envelope reaches you. Iris writes it by hand from exactly what you type.",
          ],
          [
            "Email address",
            "To confirm your order, tell you when the envelope goes out, and reach you if there is a problem with delivery or payment.",
          ],
          [
            "Phone number",
            "For delivery. Couriers in India routinely call before delivering. It is also how we recognise a returning reader and how a discount code is tied to the person it was issued to.",
          ],
          [
            "Instagram handle",
            "This is how most readers find us and how we reply to them. It is asked for on the form.",
          ],
          [
            "Birthday (optional)",
            "Only so Iris can mark it. Leave it blank and nothing changes about your subscription.",
          ],
          [
            "What you like reading about (optional)",
            "It shapes what we write and draw in future months. Free text — please do not put anything sensitive in it.",
          ],
          [
            "Gift message (optional)",
            "Printed on a card and put in the envelope. We do not keep it after that month is posted.",
          ],
        ]}
      />

      <h3>When you pay</h3>
      <p>
        Payment is handled entirely by {business.paymentProcessor} (Razorpay).{" "}
        <strong>
          We never see, receive or store your card number, expiry date, CVV, UPI PIN, net-banking
          password or any other payment credential.
        </strong>{" "}
        Those are entered in Razorpay&rsquo;s own checkout window and go to Razorpay, not to us.
      </p>
      <p>
        What we keep from a payment is the Razorpay order and payment reference, the amount, the
        currency and the time it succeeded — the record that says your subscription is paid for.
        Razorpay processes your payment data under its own privacy policy, which you should read at{" "}
        <a href="https://razorpay.com/privacy/" target="_blank" rel="noreferrer noopener">
          razorpay.com/privacy
        </a>
        .
      </p>

      <h3>Automatically, when you use the site</h3>
      <p>
        Your IP address is held briefly, in memory only, to limit how many sign-up attempts can come
        from one place in an hour. It is not written to our database, not linked to your order, and
        is discarded within the hour. We do not use advertising cookies, tracking pixels or
        third-party analytics, and we do not build a profile of you.
      </p>

      <h2>What we do not do</h2>
      <ul>
        <li>
          <strong>We do not sell your data.</strong> Not to advertisers, not to data brokers, not to
          anyone, for any price.
        </li>
        <li>
          <strong>We do not rent or trade mailing lists</strong> with other subscription boxes or
          shops.
        </li>
        <li>
          <strong>We do not send marketing you did not ask for.</strong> Emails from us are about
          your own order unless you have separately said you want more.
        </li>
        <li>
          <strong>We do not use your data to train anything</strong>, or feed it to an advertising
          network.
        </li>
      </ul>

      <h2>Who else sees it</h2>
      <p>
        Only the people who have to, to get an envelope to your door and the money into the bank.
        Each is bound to use it only for that purpose.
      </p>
      <Rows
        items={[
          [
            "India Post / courier",
            "Your name, address and phone number, printed on the envelope or handed over with it. There is no way to post something to you without this.",
          ],
          [
            "Razorpay",
            "Your name, email and phone, so a payment can be raised and a receipt sent. Razorpay is an RBI-authorised payment aggregator.",
          ],
          [
            "Our hosting providers",
            "The database (Neon), the API host (Render) and the website host (Vercel) store the data on our behalf. They process it only on our instructions.",
          ],
          [
            "Our email provider",
            "Google, for the mailbox we write to you from and receive your mail at.",
          ],
          [
            "Anyone the law requires",
            "A court, a regulator or a law-enforcement agency acting under a valid legal order. We disclose only what the order actually requires.",
          ],
        ]}
      />
      <p>
        Some of these providers store data on servers outside India. Where that happens, we rely on
        the provider&rsquo;s contractual commitments to protect it, and we transfer only to
        countries not restricted by the Government of India under the DPDP Act.
      </p>

      <h2>If you are outside India</h2>
      {!business.international.live && (
        <p>
          We do not post outside India yet, so this section describes what will happen when we do
          rather than what happens today.
        </p>
      )}
      <p>
        Posting an envelope across a border means your name and address travel with it, and two
        things follow that are worth stating plainly.
      </p>
      <ul>
        <li>
          <strong>Your address is given to foreign postal and customs authorities.</strong> India
          Post hands it to your own country&rsquo;s postal operator, and a customs declaration
          carrying your name, address and a description of the contents is attached to the outside
          of the envelope. There is no way to send you post without this, and we have no control
          over what those authorities do with it — they are acting under their own laws, not as our
          processors.
        </li>
        <li>
          <strong>Your data is processed in India</strong>, where we are, and stored by the
          providers listed above. If you are in a country with its own data-protection law, that law
          may give you rights in addition to the ones set out here.{" "}
          <strong>Those rights apply, and this policy does not reduce them.</strong>
        </li>
      </ul>
      <p>
        We do not sell or post to{" "}
        <strong>{business.international.excluded.short}</strong>, and we do not direct this site or
        any offer at people living there — so we are not set up to process orders under the GDPR or
        the UK GDPR, and the order form does not offer those destinations. The reasons are on the{" "}
        <a href="/shipping">Shipping &amp; Delivery</a> page.
      </p>
      <p>
        Wherever you are, the rights set out above are available to you on request, and if your own
        country&rsquo;s law gives you more than we have listed here, you keep them. Write to{" "}
        <a href={`mailto:${business.grievanceOfficer.email}`}>{business.grievanceOfficer.email}</a>{" "}
        and we will answer within {business.resolveDays} days.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>
          <strong>While your subscription runs, and for a reasonable period after</strong> — so we
          can answer a question about an envelope, honour a returning reader&rsquo;s rate, and
          settle a delivery or payment dispute.
        </li>
        <li>
          <strong>Payment and order records for eight years</strong> from the end of the financial
          year they fall in, because Indian tax and accounting law requires us to keep them. We
          cannot delete these on request before that period is up.
        </li>
        <li>
          <strong>A sign-up that was started and never paid for is deleted after 24 hours.</strong>{" "}
          It happens automatically, without you asking.
        </li>
        <li>
          <strong>Gift messages are deleted once that month&rsquo;s envelope is posted.</strong>
        </li>
      </ul>
      <p>
        When a retention period ends, we delete the data or reduce it to a form that no longer
        identifies you.
      </p>

      <h2>Your rights</h2>
      <p>Under the DPDP Act, 2023 you may:</p>
      <ul>
        <li>
          <strong>Ask what we hold about you</strong>, and get a copy of it, along with who we have
          shared it with.
        </li>
        <li>
          <strong>Correct or complete it.</strong> If you have moved, tell us before the{" "}
          {business.window.closesDay} and that month&rsquo;s envelope goes to the new address.
        </li>
        <li>
          <strong>Have it erased</strong>, unless we are required by law to keep it — see the
          eight-year tax records above.
        </li>
        <li>
          <strong>Withdraw your consent</strong> at any time, as easily as you gave it. Note that
          withdrawing consent to hold your address means we can no longer post to you, so it ends
          the subscription; anything unsent is refunded under the{" "}
          <a href="/refunds">Refunds &amp; Cancellation</a> policy.
        </li>
        <li>
          <strong>Nominate someone</strong> to exercise these rights on your behalf if you die or
          become incapable of exercising them yourself.
        </li>
        <li>
          <strong>Complain</strong> — to us first, and then to the Data Protection Board of India if
          we have not put it right.
        </li>
      </ul>
      <p>
        Write to <a href={`mailto:${business.grievanceOfficer.email}`}>{business.grievanceOfficer.email}</a>{" "}
        and we will answer within {business.resolveDays} days. Please write from the email address
        you subscribed with, or quote your reference number, so we can be sure it is you asking —
        we are not going to hand someone&rsquo;s home address to whoever emails us about it.
      </p>

      <h2>Children</h2>
      <p>
        The letters are written for readers of all ages, and plenty of our envelopes are addressed
        to children. The order itself must be placed by someone aged 18 or over.
      </p>
      <p>
        Where an envelope is for a child, we hold the child&rsquo;s name and the delivery address,
        given to us by their parent or guardian, purely to address and post it. We do not track
        children, do not show them advertising, and do not use their data for anything beyond
        posting the envelope. A parent or guardian may ask us to correct or delete a child&rsquo;s
        details at any time, and we will do it.
      </p>

      <h2>How we protect it</h2>
      <ul>
        <li>The site and the API are served over HTTPS; data in transit is encrypted.</li>
        <li>The database is managed, access-controlled, encrypted at rest and backed up.</li>
        <li>
          Administrative access is limited to the proprietor and protected by a secret token, and
          the account itself by two-factor authentication.
        </li>
        <li>Payment credentials never reach our systems at all — the safest way to hold them.</li>
      </ul>
      <p>
        No system is perfectly secure, and we will not claim otherwise. If a breach occurs that
        affects your data, we will notify you and the Data Protection Board of India as the DPDP Act
        requires, and tell you plainly what happened and what to do about it.
      </p>

      <h2>Cookies</h2>
      <p>
        This site sets no advertising or tracking cookies. Razorpay&rsquo;s checkout window sets its
        own cookies when it opens, which are necessary to process the payment securely; those are
        governed by Razorpay&rsquo;s privacy policy.
      </p>

      <h2>Changes</h2>
      <p>
        If we change this policy we will update the date at the top of the page, and for a change
        that materially affects you we will tell you by email before it takes effect.
      </p>

      <Note>
        <p>
          <strong>In short:</strong> we hold your name, address, phone, email and Instagram handle
          because that is what posting you an envelope takes. We never see your card details. We do
          not sell, rent or trade any of it. Ask us to show it, fix it or delete it at{" "}
          <a href={`mailto:${business.grievanceOfficer.email}`}>{business.grievanceOfficer.email}</a>{" "}
          and we will, within {business.resolveDays} days.
        </p>
      </Note>
    </LegalPage>
  );
}
