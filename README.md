# The Little Door Post

The site for the mail club. React + Vite; the API lives in `../backend`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build in dist/
```

`/api` is proxied to `http://localhost:8000` in development, so start the
backend too (see `../backend/README.md`). For production set `VITE_API_URL` to
the API's origin — copy `.env.example` to `.env`.

## What's where

| Path | What it is |
| --- | --- |
| `src/main.jsx` | the route table — one landing page, seven policy pages, a 404 |
| `src/router.js` | the router itself: ~100 lines, no dependency |
| `src/TheLittleDoorPost.jsx` | the landing page, including the `ENVELOPE` contents list |
| `src/SubscribeForm.jsx` | the four-stage sign-up flow and Razorpay Checkout |
| `src/SiteFooter.jsx` | the footer, and `POLICIES` — the one list of policy pages |
| `src/business.js` | **every legal and contact fact the policy pages state** |
| `src/legal/` | the seven policy pages and the 404 |
| `src/legal/LegalPage.jsx` | the shell they share, plus `Fact`, `Note` and `Rows` |
| `src/api.js` | fetch wrappers and the Checkout script loader |
| `src/css.js` | the inline-CSS-to-style-object helper |
| `src/styles.css` | Classical design-system tokens and classes |
| `public/assets/` | the illustrations |
| `vercel.json` | the SPA rewrite, so `/terms` works when typed directly |

## The policy pages

`/terms`, `/privacy`, `/refunds`, `/shipping`, `/pricing`, `/contact` and
`/grievance`. They exist to satisfy three things at once: Razorpay's merchant
activation check, the Consumer Protection (E-Commerce) Rules, 2020, and the
DPDP Act, 2023.

**Every fact they state lives in `src/business.js`, and nowhere else.** Change
the phone number, the rate card or the refund window there and all seven pages
agree at once. Two policy pages quietly disagreeing about a refund window is
exactly what an activation review catches.

Anything still marked `TODO(...)` in `business.js` renders as a visible amber
"to be filled in" mark rather than as silent blank space — a policy page
missing the proprietor's name should *look* unfinished, because it is. Fill
those in before going live.

Two claims are load-bearing and must stay true, because Razorpay declined the
merchant account once for reading as a "mystery envelope" business:

- **Name the printed pieces.** Never sell the envelope as a mystery or a
  surprise. `business.contents` here, `ENVELOPE` in `TheLittleDoorPost.jsx` and
  `ENVELOPE_CONTENTS` in `backend/app/routers/subscriptions.py` must agree.
- **India only, for now.** The backend refuses an international sign-up
  outright, so no page may promise shipping anywhere else — see below.

### Opening international shipping

The international terms are already written and published: customs and duty,
what happens when a destination country's import rules change mid-subscription,
and force majeure. They sit behind `business.international.live`, which is
`false`, so every page currently says "not open yet" while still setting out
the terms in advance.

Flipping that one flag switches every page from "when we open this" to the
present tense. **Do not flip it first.** The order is:

1. set prices and `active = true` on the `international` rows in
   `backend/app/schema.sql`
2. drop the `region == "international"` rejection in `create_subscription`
   (`backend/app/routers/subscriptions.py`), and give the order form a country
   list that **omits everything in `business.international.excluded`**
3. re-read `excluded` — is that still the decision?
4. *then* set `live: true`

Doing (4) first would put a shipping promise on the site that the order form
refuses to honour — which is exactly the kind of inconsistency that fails a
gateway review. Both flag states are covered by the render checks.

### Pricing in the risk, not clawing it back

An international envelope stopped at a border *after* it was posted is refunded
in full, and the printing and postage are already spent by then. That loss is
ours on purpose.

It is covered by **adding 3-5% to the international rates**, not by refunding
the reader a fraction. A half-refund was considered and rejected in Sep 2026:
on a "goods not received" dispute the card network asks the merchant for proof
of delivery, and in this exact scenario there is none — so a partial refund
loses the dispute, the remaining money and a dispute fee, while adding to a
chargeback ratio on an account that was declined once already. Keeping half of
what someone paid for goods that never arrived is also the sort of term the
Consumer Protection Act, 2019 lets a forum strike out.

A margin nobody can see beats a clause everybody argues about. If real losses
run above the margin, raise the margin — do not move the loss onto the reader
after the fact. See `international.riskMarginPercent` in `business.js`.

### Why the EU, EEA and UK are excluded

Consumer law there gives a distance buyer 14 days to withdraw from a contract
for no reason and be refunded in full — including the envelope already
delivered and its postage. The right follows the **buyer**, not the seller, so
it would bind a seller in Gujarat the moment they sold to someone in Dublin,
and returning paper goods from Europe costs more than the goods are worth.

The decision (Sep 2026) was to not sell there rather than run a second refund
policy for one region. `business.international.excluded` holds the list, and
all four policy pages state it.

**Stating it is not enforcing it.** A policy page that says "not the EU" while
the country dropdown offers Germany puts you in exactly the position this
avoids — step (2) above is the part that does the real work.

## Routing

Real paths, not `#/`, because a policy page needs a URL that can be pasted into
a merchant application form. `src/router.js` is the whole of it: a click
listener that turns a left-click on an internal `<a href="/terms">` into a
history push, and a `usePath()` hook that re-renders on it. Links stay plain
anchors — there is no `<Link>` component to remember.

It deliberately leaves alone everything the browser does better: modified
clicks, middle clicks, `target="_blank"`, downloads, external hosts, and
same-page `#anchor` links, which is why `#subscribe` on the landing page still
scrolls the way it always did.

Two consequences worth knowing:

- **The host must serve `index.html` for unknown paths.** `vercel.json` does
  that; any other host needs its own SPA-rewrite equivalent, or `/terms` will
  404 when typed directly.
- **Policy links inside the sign-up form open in a new tab.** A policy opened
  in the same tab would unmount the form and lose an order that is about to be
  paid for.

Add a page by dropping it in the `ROUTES` map in `src/main.jsx` — and, if it is
a policy, in `POLICIES` in `src/SiteFooter.jsx`, which drives the footer, the
sidebar and the see-also list on every policy page.

## The sign-up flow

`region → details → pay → sealed`, with readers outside India going
`region → waitlisted` instead (there is no international shipping yet).

The pay stage reads `payment.enabled` from the API. While the Razorpay keys are
missing it shows a "payments are not live yet" panel with the reader's
reference; once they are set the same stage opens Razorpay Checkout. Nothing on
the site needs changing to switch it on — see `../backend/README.md`.

## Waking a sleeping API

The API is on Render's free plan, which sleeps after 15 minutes idle and takes
most of a minute to wake, answering 502 while it does. Three things in `api.js`
and `main.jsx` deal with that:

- **`warmUp()` runs at app load, in `main.jsx`.** Not in the sign-up form —
  a reader arriving on `/refunds` never mounts that form, so warming from
  inside it would leave them waiting out the cold start after clicking through
  to subscribe. Warming at app level means the reading is the wait, and someone
  who has just read the refund policy is exactly the person about to sign up.
- **`/config` is single-flight and cached.** The warm-up ping and the form's
  own read share one request and one answer, however they interleave.
- **Retries with backoff, about 45 seconds' worth.** A 502 mid-wake is a pause,
  not a failure. A 4xx is not retried — repeating it changes nothing.

Retries are opt-in per call, and deliberately so: `createSubscription` must
never be repeated, or a dropped reply could sign someone up twice.
`verifyPayment` *is* retried, because it runs after money has changed hands and
the endpoint is idempotent.

The form never blocks on any of this — it does not need `/config` to work, only
to show the price.

## Envelope contents

`ENVELOPE` at the top of `src/TheLittleDoorPost.jsx` is the list readers see.
Two other copies have to agree with it: `ENVELOPE_CONTENTS` in the backend
(`backend/app/routers/subscriptions.py`, served from `/api/config`), and
`contents` in `src/business.js`, which the Terms and Pricing pages print.
Change one, change all three.

This is not housekeeping. Naming the printed goods is what keeps the business
in a category Razorpay supports — see **The policy pages** above.

## Props

```jsx
<TheLittleDoorPost
  envelopeColor="#5e7150"   // the envelope's paper colour
/>
```

## Notes

- Scroll storytelling uses CSS scroll-driven animations (`animation-timeline: view()`).
  Browsers without support show the content immediately — nothing breaks.
- `prefers-reduced-motion` is respected.
- The three watercolour illustrations are 2.7–2.9 MB each. Compress them
  (WebP at ~1600px wide) before launch.
