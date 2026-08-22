# The Little Door Post

One-page site for the mail club. React + Vite, no other runtime dependencies.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build in dist/
```

## What's where

| Path | What it is |
| --- | --- |
| `src/TheLittleDoorPost.jsx` | the whole page — one component, inline styles |
| `src/styles.css` | Classical design-system tokens and classes (`.btn`, `.card`, `.input`, `.field`, `.plate`, `.hr`) |
| `public/assets/` | the four illustrations (wordmark, forest band, Iris at her desk, envelope folk) |

## Props

```jsx
<TheLittleDoorPost
  envelopeColor="#5e7150"              // the envelope's paper colour
  signupWindow="Automatic"             // "Automatic" | "Open now" | "Closed"
  addressDetail="Full postal address"  // or "Name, email & phone"
/>
```

`signupWindow="Automatic"` reads today's date: open from the 20th to the 2nd, with a live countdown in the hero and above the form.

## The form

The sign-up form is UI only — `onSubmit` validates, seals the envelope and shows the confirmation panel. Point it at your backend (or Formspree / Google Forms / Airtable) in `onSubmit` inside `TheLittleDoorPost.jsx`.

## Notes

- Scroll storytelling uses CSS scroll-driven animations (`animation-timeline: view()`). Browsers without support show the content immediately — nothing breaks.
- `prefers-reduced-motion` is respected.
- The three watercolour illustrations are 2.7–2.9 MB each. Compress them (WebP at ~1600px wide) before launch.
