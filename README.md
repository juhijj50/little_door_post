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
| `src/main.jsx` | hash router — `#/` is the landing page, `#/the-red-race` the letter |
| `src/TheLittleDoorPost.jsx` | the landing page, including the `ENVELOPE` contents list |
| `src/TheRedRace.jsx` | Letter No. 001, as its own page |
| `src/SubscribeForm.jsx` | the four-stage sign-up flow and Razorpay Checkout |
| `src/api.js` | fetch wrappers and the Checkout script loader |
| `src/css.js` | the inline-CSS-to-style-object helper both pages use |
| `src/styles.css` | Classical design-system tokens and classes |
| `public/assets/` | the four illustrations |

## Routing

Routes sit behind `#/` so the built site works as a plain folder of static
files — no server rewrite rules. `#meet` and friends stay ordinary anchors on
the landing page, and `#/#subscribe` means "landing page, then that section".

Add a page by dropping it in the `PAGES` map in `src/main.jsx`.

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
  a reader arriving on `#/the-red-race` never mounts that form, so warming from
  inside it would leave them waiting out the cold start after clicking through.
  Warming at app level means the letter is the wait.
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
The backend keeps the same list in `ENVELOPE_CONTENTS`
(`backend/app/routers/subscriptions.py`) and serves it from `/api/config` —
if you change one, change the other.

## Props

```jsx
<TheLittleDoorPost
  envelopeColor="#5e7150"   // the envelope's paper colour
  signupWindow="Automatic"  // "Automatic" | "Open now" | "Closed"
/>
```

## Notes

- Scroll storytelling uses CSS scroll-driven animations (`animation-timeline: view()`).
  Browsers without support show the content immediately — nothing breaks.
- `prefers-reduced-motion` is respected.
- The three watercolour illustrations are 2.7–2.9 MB each. Compress them
  (WebP at ~1600px wide) before launch.
