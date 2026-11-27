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
| `src/main.jsx` | the route table — the landing page, seven policy pages, a 404 |
| `src/router.js` | the router itself: ~100 lines, no dependency |
| `src/TheLittleDoorPost.jsx` | the landing page: three sections and nothing else |
| `src/SiteNav.jsx` | the sticky bar at the top, shared with the policy pages |
| `src/site.css` | the landing page's layout, including the stamp-edged card |
| `src/SubscribeForm.jsx` | the sign-up flow and Razorpay Checkout |
| `src/SiteFooter.jsx` | the footer, and `POLICIES` — the one list of policy pages |
| `src/business.js` | **every legal and contact fact the policy pages state** |
| `src/countries.js` | the served countries, mirroring `backend/app/countries.py` |
| `src/legal/` | the seven policy pages and the 404 |
| `src/legal/LegalPage.jsx` | the shell they share, plus `Fact`, `Note` and `Rows` |
| `src/content/` | what the admin panel publishes: `prices.js`, `inside.js` |
| `src/admin/` | the admin panel, lazily loaded — never in a reader's bundle |
| `src/api.js` | fetch wrappers and the Checkout script loader |
| `src/css.js` | the inline-CSS-to-style-object helper |
| `src/styles.css` | design-system tokens and classes |
| `src/brand-tokens.css` | the palette, the fonts and the controls, over `styles.css` |
| `public/assets/` | the illustrations and `stamps-bg.webp`, the passport-stamp wall |
| `vercel.json` | the SPA rewrite, so `/terms` works when typed directly |

## The landing page

One page, three sections, all of it in `TheLittleDoorPost.jsx`:

1. **hero** — the Yeats line and what this is, on a white stamp-edged card over
   the passport-stamp wall
2. **What's Inside ?** — one photograph, on white (the sheet is photographed
   on white, and on cream it would read as a pasted-on rectangle). The only
   thing on the page the admin panel can still change. Until it has one of its
   own it shows `public/assets/whats-inside.webp`, the December edition sheet,
   and it goes back to that if the panel's picture is removed — the section is
   never empty
3. **the order form** — `SubscribeForm`, on a second stamp-edged card

Above them, `SiteNav` — a sticky bar carrying the mark, "What's inside",
"Pricing" and the one button, shared with the policy pages so the chrome is the
same wherever a reader lands. Below 760px the right-hand side folds behind a
three-line button and drops down as a panel; it closes on Escape, on following
a link, on a tap outside, and on widening the window past the breakpoint. That
scrim is rendered **outside** `<header>` on purpose: the bar has a
`backdrop-filter`, which makes it the containing block for anything
`position: fixed` inside it, so a full-screen scrim in there would be sixty
pixels tall.

The bar's height is `--header-h` in `site.css`, which is also the
`scroll-margin-top` on every `section[id]`, so a jump to `#inside` stops below
the bar rather than under it. The breakpoint lives twice — `PHONE` in
`SiteNav.jsx` and the media query in `site.css`; keep them in step.

Below the sections, one line pointing questions at Instagram, and the footer —
three horizontal bands rather than tall columns, so it stays short on a phone:
the brand with "The club" and "Reach us" beside it (and those two stay
side by side at every width), then **all seven policies as one wrapping row**,
then the address and copyright. Do not thin that policy row out to tidy the
layout: a payment aggregator's review looks for them in the footer of every
page.

### The stamp edge

`.stamp-card` in `site.css`. Four scalloped radial-gradient masks intersected
with `mask-composite`, which is what cuts the postage-stamp teeth out of all
four sides of a box of any size. It sits behind `@supports`, so a browser
without `mask-composite` gets the same card with rounded corners instead of
teeth — the content never moves either way.

Keep the card's padding at least `--scallop` plus breathing room, or a tooth
will bite into a word.

### Fonts

The Canva artwork these sections are drawn from is set in **Lulu**, which is
Canva's own font and is not on the web. `--font-hand` in `brand-tokens.css`
names it first all the same: drop a `lulu.woff2` into `public/assets`, add the
`@font-face` written out in the comment there, and every heading picks it up
with no other change. Until then **Patrick Hand** stands in — the nearest
rounded hand on Google Fonts.

Running text, form fields and the policy pages stay in **Lora**: a hand at 13px
is harder to read than it is worth, and a refund policy has to be readable.

### What the panel publishes

`src/content/prices.js` and `src/content/inside.js` are written by the admin
panel's publish step through the GitHub API, and the photograph they point at
is written into `public/media/`. The host rebuilds from that commit, so the
page carries its own prices and picture from the first paint with no wait on a
sleeping API.

Each file says `published: false` until the panel has written it once; until
then the page reads that part from `/api/config` instead. **Do not edit them by
hand** — the next publish overwrites them.

## Where we post

India, and everywhere except the **twenty-seven EU member states**. The United
Kingdom is served (it came back onto the list in November 2026), as are
Switzerland, Norway, Iceland and the rest of non-EU Europe.

The rule lives in **`backend/app/countries.py`** — `EXCLUDED` is the EU 27,
`INTERNATIONAL` is everything else, and the server enforces it. Two files
follow it:

- **`src/countries.js`** mirrors `INTERNATIONAL`, and is what the order form's
  dropdown falls back to. The API's list wins the moment `/api/config` answers;
  this copy is only there because the free-tier API sleeps, and a reader who
  picked "Somewhere else" during the cold start used to open the dropdown and
  find it empty.
- **`src/business.js`** (`international.excluded`) describes the decision for
  readers, and the policy pages print it from there.

**Change all three together.** A policy page that says "not the EU" while the
dropdown offers Germany is exactly the inconsistency this arrangement exists to
prevent — and stating it is not enforcing it; `countries.py` is the part that
does the real work.

### Why the EU is excluded

EU consumer law gives a distance buyer 14 days to withdraw from a contract for
no reason and be refunded in full — including the envelope already delivered
and its postage. That right follows the **buyer**, not the seller, so it binds
a seller in Gujarat the moment they sell to Dublin, and returning paper goods
from Europe costs more than the goods are worth. On top of that the EU began
charging duty on low-value imports in July 2026.

The decision (Sep 2026, narrowed from "all of Europe" to the EU in Nov 2026)
was to not sell there rather than run a second refund policy for one region.

### Pricing in the risk, not clawing it back

An international envelope stopped at a border *after* it was posted is refunded
in full, and the printing and postage are already spent by then. That loss is
ours on purpose.

It is covered by **adding 3–5% to the international rate**, not by refunding
the reader a fraction. A half-refund was considered and rejected in Sep 2026:
on a "goods not received" dispute the card network asks the merchant for proof
of delivery, and in this exact scenario there is none — so a partial refund
loses the dispute, the remaining money and a dispute fee, while adding to a
chargeback ratio on an account that was declined once already. Keeping half of
what someone paid for goods that never arrived is also the sort of term the
Consumer Protection Act, 2019 lets a forum strike out.

See `international.riskMarginPercent` in `business.js`.

## The policy pages

`/terms`, `/privacy`, `/refunds`, `/shipping`, `/pricing`, `/contact` and
`/grievance`. They exist to satisfy three things at once: Razorpay's merchant
activation check, the Consumer Protection (E-Commerce) Rules, 2020, and the
DPDP Act, 2023.

**Every fact they state lives in `src/business.js`, and nowhere else.** Change
the phone number or the refund window there and all seven pages agree at once.
Two policy pages quietly disagreeing about a refund window is exactly what an
activation review catches. (Prices are the exception, and for the same reason:
they are read live from the `plans` table, so no page can state a figure the
checkout would not charge.)

Anything still marked `TODO(...)` in `business.js` renders as a visible amber
"to be filled in" mark rather than as silent blank space — a policy page
missing the proprietor's name should *look* unfinished, because it is.

### The one claim that is load-bearing

Razorpay declined this merchant account once for reading as a "mystery
envelope" business.

**Name the printed pieces. Never sell the envelope as a mystery or a
surprise.** `business.contents` is the list the Terms and Pricing pages print,
and it has to keep describing what actually goes in an envelope. The landing
page now shows a photograph instead of a list, which is fine — a labelled
photograph names the pieces too — but the policy pages' list is the one a
reviewer reads.

## Routing

Real paths, not `#/`, because a policy page needs a URL that can be pasted into
a merchant application form. `src/router.js` is the whole of it: a click
listener that turns a left-click on an internal `<a href="/terms">` into a
history push, and a `usePath()` hook that re-renders on it. Links stay plain
anchors — there is no `<Link>` component to remember.

It deliberately leaves alone everything the browser does better: modified
clicks, middle clicks, `target="_blank"`, downloads, external hosts, and
same-page `#anchor` links, which is why `#subscribe` still scrolls the way it
always did.

Two consequences worth knowing:

- **The host must serve `index.html` for unknown paths.** `vercel.json` does
  that; any other host needs its own SPA-rewrite equivalent, or `/terms` will
  404 when typed directly.
- **Policy links inside the sign-up form open in a new tab.** A policy opened
  in the same tab would unmount the form and lose an order about to be paid for.

Add a page by dropping it in the `ROUTES` map in `src/main.jsx` — and, if it is
a policy, in `POLICIES` in `src/SiteFooter.jsx`, which drives the footer, the
sidebar and the see-also list on every policy page.

## The sign-up flow

`plan → who → where → pay → sealed`. One part on screen at a time, each
replacing the last in the same panel rather than being appended below it:
three parts open at once made a very long page on a phone and walked the
sign-up button further down it with every answer.

Nothing typed is lost by that: all three parts read and write one `values`
object held by `SubscribeForm`, so a part that is off screen still has its
answers. Going back is offered twice over — a Back button, and the numbered
steps along the top, where any part already completed is a link to it.

**The half-filled form is kept in `localStorage`** under `ldp.signup.draft.v1`
— a sign-up asks for a full postal address and posts it to an API that sleeps,
so losing all of it to a reload is a small disaster. It is written as they
type, restored into the very first render (lazily, so no empty-form flash),
cleared the moment a sign-up completes, and expires after seven days. Every
call is wrapped: `localStorage` throws outright in some private modes, and a
draft must never be why a form breaks. When a draft is picked up the form says
so and offers *Start fresh*.

**There is no up-front "the API is slow" banner.** It only worried people
before they had typed anything. A sign-up that fails because the server did not
answer — status 0, or 5xx — says so at the moment it happens and asks for
another go in a few seconds, which is about how long the free-tier API takes to
wake. See `sendingMessage`.

`PlanPicker` never renders nothing. It has three states: a skeleton while
`/api/config` is in flight, the live rate card once it lands, and — if the API
cannot be reached at all — the published `content/prices.js`. It used to return
`null` on an empty list, which left the heading standing over blank space
whenever the API was asleep, with a Next button that still went through on the
default of one month. The fallback is safe because the amount actually charged
is computed server-side from the `plans` table and shown again on the pay step
before anything is taken.

The pay stage reads `payment.enabled` from the API. While the Razorpay keys are
missing it shows a "payments are not live yet" panel with the reader's
reference; once they are set the same stage opens Razorpay Checkout. Nothing on
the site needs changing to switch it on — see `../backend/README.md`.

## Waking a sleeping API

The API is on Render's free plan, which sleeps after 15 minutes idle and takes
most of a minute to wake, answering 502 while it does. Three things in `api.js`
and `main.jsx` deal with that:

- **`warmUp()` runs at app load, in `main.jsx`.** Not in the sign-up form — a
  reader arriving on `/refunds` never mounts that form, so warming from inside
  it would leave them waiting out the cold start after clicking through to
  subscribe. Warming at app level means the reading is the wait.
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

## Notes

- `prefers-reduced-motion` is respected (`brand-tokens.css`).
- `public/assets/` and `public/media/` still hold the illustrations and
  photographs the old page used. Nothing references them any more and a publish
  never deletes a file, so they are harmless; clear them out by hand if the
  repository size ever matters.
