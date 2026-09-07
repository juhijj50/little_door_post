/*  The Little Door Post — the landing page.
 *  Needs styles.css (the Classical design-system stylesheet) imported once — see main.jsx —
 *  and the four illustrations served from /assets/ (they live in public/assets here).
 *
 *  The sign-up flow lives in SubscribeForm.jsx; this file owns the envelope
 *  illustration beside it and keeps it addressed as the reader types.
 *
 *  Props
 *    envelopeColor  hex — the envelope's paper colour            (default "#5e7150")
 *    The sign-up window comes from the API, which reads it from the database.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { css } from "./css.js";
import { getConfig } from "./api.js";
import SubscribeForm from "./SubscribeForm.jsx";

const STYLE = `html { scroll-behavior: smooth; }
  body { margin: 0; overflow-x: hidden; }
  a { color: var(--color-accent-700); text-decoration-thickness: 1px; }
  a:hover { color: var(--color-accent-600); }
  @keyframes ldp-rise { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: none } }
  @keyframes ldp-fade { from { opacity: 0 } to { opacity: 1 } }
  @keyframes ldp-left { from { opacity: 0; transform: translateX(-26px) } to { opacity: 1; transform: none } }
  @keyframes ldp-hero { from { opacity: 0; transform: translateY(22px) scale(.965) } to { opacity: 1; transform: none } }
  @keyframes ldp-bloom { from { opacity: .28; transform: scale(.88) } to { opacity: .7; transform: scale(1.1) } }
  @keyframes ldp-drift { from { transform: translateY(10px) rotate(-6deg) } to { transform: translateY(-20px) rotate(4deg) } }
  @keyframes ldp-cue { 0%,100% { transform: scaleY(.25); opacity: .3 } 50% { transform: scaleY(1); opacity: .9 } }
  @keyframes ldp-parallax { from { transform: translateY(52px) } to { transform: translateY(-52px) } }
  @keyframes ldp-draw { from { transform: scaleY(0) } to { transform: scaleY(1) } }
  @keyframes ldp-progress { to { transform: scaleX(1) } }
  @keyframes ldp-stamp { 0% { opacity: 0; transform: rotate(-26deg) scale(2.3) } 55% { opacity: 1 } 100% { opacity: 1; transform: rotate(-8deg) scale(1) } }
  @keyframes ldp-seal { 0% { opacity: 0; transform: translate(-50%,-50%) rotate(-30deg) scale(2.6) } 60% { opacity: 1 } 100% { opacity: 1; transform: translate(-50%,-50%) rotate(-8deg) scale(1) } }
  @keyframes ldp-tiltA { from { opacity: 0; transform: translateY(26px) rotate(0deg) } to { opacity: 1; transform: translateY(0) rotate(-2.2deg) } }
  @keyframes ldp-tiltB { from { opacity: 0; transform: translateY(26px) rotate(0deg) } to { opacity: 1; transform: translateY(0) rotate(1.6deg) } }
  @keyframes ldp-tiltC { from { opacity: 0; transform: translateY(26px) rotate(0deg) } to { opacity: 1; transform: translateY(0) rotate(-1.2deg) } }
  @keyframes ldp-tiltD { from { opacity: 0; transform: translateY(26px) rotate(0deg) } to { opacity: 1; transform: translateY(0) rotate(2.4deg) } }
  @keyframes ldp-twinkle { 0%,100% { opacity: .12; transform: scale(.6) } 50% { opacity: .95; transform: scale(1.2) } }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .001s !important; animation-delay: 0s !important; transition-duration: .001s !important }
  }
  [data-hv="0"]:hover { background:var(--color-accent-100) }`;

const FALLBACKS = ["Your name", "Street address", "City \u00b7 Postcode", "Country"];

/* Exactly what is in the envelope. Six printed pieces, the same six every
 * month \u2014 only the artwork and the writing change. Keep this list and the
 * backend's ENVELOPE_CONTENTS saying the same thing. */
const ENVELOPE = [
  {
    title: "A letter from Iris",
    detail: "Two printed pages about the place she has wandered into this month.",
  },
  {
    title: "A letter from a side character",
    detail: "One printed page from somebody she met there, in their own words.",
  },
  {
    title: "A theme sticker",
    detail: "A die-cut vinyl sticker of that month\u2019s world.",
  },
  {
    title: "A character sticker",
    detail: "A die-cut vinyl sticker of Iris or one of the folk she meets.",
  },
  {
    title: "An art print",
    detail: "A small illustrated print on card, drawn for that month\u2019s story.",
  },
  {
    title: "An activity or fact sheet",
    detail: "One printed page \u2014 a puzzle, a recipe, or a page of true facts about the place.",
  },
];

const shade = (hex, amt) => {
  const h = String(hex).replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const v = parseInt(n, 16);
  if (isNaN(v)) return hex;
  return (
    "#" +
    [(v >> 16) & 255, (v >> 8) & 255, v & 255]
      .map((x) => Math.max(0, Math.min(255, Math.round(x + amt))).toString(16).padStart(2, "0"))
      .join("")
  );
};

/* The sign-up window, described from whatever /api/config reports.
 *
 * The dates are not computed here any more: they live in the database, one row
 * per month, so a window that has been moved by hand is the one the site
 * describes. Until config arrives — or if it never does — this falls back to
 * the standard rule so the page is never blank. */
function windowState(config) {
  if (!config) {
    return { open: false, text: "Sign-ups open on the 15th of every month." };
  }

  const now = new Date();
  const days = (to) => Math.max(1, Math.ceil((new Date(to) - now) / 86400000));
  const plural = (n) => `${n} day${n === 1 ? "" : "s"}`;
  /* Named in Indian time, to match the panel below and the post itself. */
  const day = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "long",
    });

  if (config.signupOpen) {
    return {
      open: true,
      text: `Sign-ups are open — they close on ${day(config.closesAt)}, ${plural(days(config.closesAt))} from now.`,
    };
  }
  return {
    open: false,
    text: `Sign-ups open on ${day(config.opensAt)} — ${plural(days(config.opensAt))} away.`,
  };
}

export default function TheLittleDoorPost({ envelopeColor = "#5e7150" }) {
  /* Shares the single-flight request main.jsx already started, so reading the
   * window here costs no extra call. */
  const [config, setConfig] = useState(null);

  const rootRef = useRef(null);
  const headerRef = useRef(null);
  const envWrap = useRef(null);
  const sealRef = useRef(null);
  const outName = useRef(null);
  const outStreet = useRef(null);
  const outCity = useRef(null);
  const outCountry = useRef(null);
  const statusTop = useRef(null);
  const statusText = useRef(null);

  /* envelope colour */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !envelopeColor) return;
    const face = root.querySelector('[data-env="face"]');
    const flap = root.querySelector('[data-env="flap"]');
    if (face) face.style.background = envelopeColor;
    if (flap) flap.style.background = shade(envelopeColor, -18);
  }, [envelopeColor]);

  useEffect(() => {
    let live = true;
    getConfig().then((c) => live && setConfig(c)).catch(() => {});
    return () => { live = false; };
  }, []);

  /* sign-up window copy */
  useEffect(() => {
    const w = windowState(config);
    if (statusText.current) statusText.current.textContent = w.text;
    if (statusTop.current) statusTop.current.textContent = w.open ? "Sign-ups are open now" : "Sign-ups open the 15th of every month";
  }, [config]);

  /* sticky header shadow + decorations off on small screens */
  useEffect(() => {
    const onScroll = () => {
      if (headerRef.current) headerRef.current.style.boxShadow = window.scrollY > 12 ? "var(--shadow-sm)" : "none";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const mq = window.matchMedia("(max-width: 720px)");
    const apply = () => {
      const root = rootRef.current;
      if (!root) return;
      root.querySelectorAll("[data-deco]").forEach((el) => (el.style.display = mq.matches ? "none" : "block"));
      root.querySelectorAll("[data-navlink]").forEach((el) => (el.style.display = mq.matches ? "none" : "inline"));
    };
    apply();
    mq.addEventListener?.("change", apply);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener?.("change", apply);
    };
  }, []);

  /* The envelope is addressed straight through the DOM rather than through
   * state \u2014 it repaints on every keystroke, and React does not need to know. */
  const onAddressChange = useCallback((a) => {
    const set = (ref, v, fb) => { if (ref.current) ref.current.textContent = (v || "").trim() || fb; };
    set(outName, a.name, FALLBACKS[0]);
    set(outStreet, a.street, FALLBACKS[1]);
    set(outCity, a.cityLine, FALLBACKS[2]);
    set(outCountry, a.country, FALLBACKS[3]);
  }, []);

  const onSealed = useCallback(() => {
    const seal = sealRef.current;
    if (seal) {
      seal.style.animation = "none";
      void seal.offsetWidth; /* forces the restart */
      seal.style.animation = "ldp-seal .8s cubic-bezier(.2,1.4,.4,1) both";
    }
    if (envWrap.current) envWrap.current.style.transform = "translateY(-10px) rotate(-1.5deg)";
  }, []);

  const onUnsealed = useCallback(() => {
    if (sealRef.current) { sealRef.current.style.animation = "none"; sealRef.current.style.opacity = "0"; }
    if (envWrap.current) envWrap.current.style.transform = "none";
    [outName, outStreet, outCity, outCountry].forEach((r, i) => { if (r.current) r.current.textContent = FALLBACKS[i]; });
  }, []);

  return (
    <>
      <style>{STYLE}</style>
      <div ref={rootRef} style={css("background:var(--color-bg);color:var(--color-text);font-family:var(--font-body);position:relative")}>
      
        <div style={css("position:fixed;top:0;left:0;right:0;height:2px;background:var(--color-accent);transform:scaleX(0);transform-origin:0 50%;z-index:60;animation-name:ldp-progress;animation-timing-function:linear;animation-fill-mode:both;animation-timeline:scroll(root)")}></div>
      
        <header ref={headerRef} style={css("position:sticky;top:0;z-index:55;display:flex;align-items:center;gap:clamp(14px,3vw,30px);padding:11px clamp(16px,4vw,44px);background:color-mix(in srgb, var(--color-bg) 92%, transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--color-divider);transition:box-shadow .4s")}>
          <a href="#top" style={css("font-family:var(--font-heading);font-size:clamp(15px,3.4vw,19px);letter-spacing:.02em;margin-right:auto;text-decoration:none;color:var(--color-text);white-space:nowrap")}>The Little Door Post</a>
          <a data-navlink="1" href="#meet" style={css("font-size:14px;text-decoration:none;color:var(--color-text);white-space:nowrap")}>Meet Iris</a>
          <a data-navlink="1" href="#how" style={css("font-size:14px;text-decoration:none;color:var(--color-text);white-space:nowrap")}>How it works</a>
          <a data-navlink="1" href="#inside" style={css("font-size:14px;text-decoration:none;color:var(--color-text);white-space:nowrap")}>What you get</a>
          <a data-navlink="1" href="#/the-red-race" style={css("font-size:14px;text-decoration:none;color:var(--color-text);white-space:nowrap")}>The letters</a>
          <a className="btn btn-primary" href="#subscribe" style={css("white-space:nowrap")}>Receive a letter</a>
        </header>
      
        <section id="top" style={css("position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 clamp(20px,5vw,40px) clamp(104px,14vh,132px);overflow:hidden;text-align:center")}>
          <div style={css("align-self:stretch;position:relative;margin:0 calc(-1 * clamp(20px,5vw,40px)) clamp(26px,4.5vh,48px);line-height:0")}>
            <img src="/assets/forest.png" alt="A watercolour clearing of mushroom folk, pinecone people and paper ghosts" style={css("width:100%;height:clamp(170px,32svh,380px);object-fit:cover;object-position:50% 62%;animation-name:ldp-fade;animation-duration:1.4s;animation-fill-mode:both")} />
            <div style={css("position:absolute;left:0;right:0;bottom:-1px;height:clamp(20px,3vw,34px);background:var(--color-bg);clip-path:polygon(0% 100%,0% 52%,3% 74%,6% 46%,9% 68%,12% 38%,15% 62%,18% 44%,21% 72%,24% 50%,27% 76%,30% 42%,33% 60%,36% 36%,39% 58%,42% 46%,45% 70%,48% 40%,51% 64%,54% 48%,57% 74%,60% 44%,63% 66%,66% 38%,69% 62%,72% 50%,75% 72%,78% 42%,81% 60%,84% 46%,87% 68%,90% 40%,93% 64%,96% 48%,100% 66%,100% 100%)")}></div>
          </div>
          <div style={css("position:absolute;left:50%;top:56%;width:min(620px,90vw);aspect-ratio:1;transform:translate(-50%,-50%);background:radial-gradient(circle, color-mix(in srgb, var(--color-accent) 22%, transparent) 0%, transparent 62%);animation-name:ldp-bloom;animation-duration:7s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;animation-direction:alternate;pointer-events:none")}></div>
      
          <img src="/assets/wordmark.png" alt="The Little Door Post" style={css("position:relative;width:min(600px,88vw);mix-blend-mode:multiply;animation-name:ldp-hero;animation-duration:1.5s;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-fill-mode:both")} />
      
          <p style={css("position:relative;max-width:34ch;margin:clamp(4px,1.5vh,16px) 0 0;font-family:var(--font-heading);font-style:italic;font-size:clamp(20px,4.4vw,30px);line-height:1.35;text-wrap:pretty;animation-name:ldp-rise;animation-duration:1.1s;animation-delay:.5s;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-fill-mode:both")}>Every month, Iris finds a new door.<br />Every month, she sends a letter home.</p>
      
          <div style={css("position:relative;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;margin-top:clamp(20px,3.5vh,34px);animation-name:ldp-rise;animation-duration:1.1s;animation-delay:.75s;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-fill-mode:both")}>
            <a className="btn btn-primary" href="#subscribe" style={css("padding:12px 24px;font-size:15px;white-space:nowrap")}>Receive a letter</a>
            <a className="btn btn-secondary" href="#how" style={css("padding:12px 24px;font-size:15px;white-space:nowrap")}>How it works</a>
          </div>
      
          <div ref={statusTop} style={css("position:relative;margin-top:clamp(16px,2.6vh,26px);font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 58%, transparent);animation-name:ldp-fade;animation-duration:1.2s;animation-delay:1s;animation-fill-mode:both")}>Sign-ups open the 15th of every month</div>
      
          <div style={css("position:relative;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px 18px;margin-top:clamp(14px,2.2vh,22px);font-size:12px;letter-spacing:.06em;color:color-mix(in srgb, var(--color-text) 62%, transparent);animation-name:ldp-fade;animation-duration:1.2s;animation-delay:1.15s;animation-fill-mode:both")}>
            <span>Posted across India</span>
            <span style={css("width:3px;height:3px;border-radius:50%;background:#5e7150")}></span>
            <span>Six printed pieces</span>
            <span style={css("width:3px;height:3px;border-radius:50%;background:#5e7150")}></span>
            <span>Arrives in 5–10 working days</span>
          </div>
      
          <div style={css("position:absolute;left:50%;bottom:clamp(18px,3vh,34px);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px")}>
            <span style={css("font-size:11px;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;color:color-mix(in srgb, var(--color-text) 45%, transparent)")}>read on</span>
            <span style={css("width:1px;height:44px;background:var(--color-accent);transform-origin:top;animation-name:ldp-cue;animation-duration:2.4s;animation-timing-function:ease-in-out;animation-iteration-count:infinite")}></span>
          </div>
        </section>
      
        <section id="meet" style={css("position:relative;padding:clamp(74px,11vh,134px) clamp(20px,5vw,40px) clamp(80px,12vh,142px);overflow:hidden;background:#4e5f43;color:#f4f2ec")}>
          <div style={css("position:absolute;left:68%;top:52%;width:min(820px,120vw);aspect-ratio:1;transform:translate(-50%,-50%);background:radial-gradient(circle, color-mix(in srgb, #f0c579 20%, transparent) 0%, transparent 66%);animation-name:ldp-bloom;animation-duration:9s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;animation-direction:alternate;pointer-events:none")}></div>
          <div data-deco="1" style={css("position:absolute;left:52%;top:24%;width:7px;height:7px;border-radius:50%;background:#f0c579;animation-name:ldp-twinkle;animation-duration:3.4s;animation-delay:0s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;pointer-events:none")}></div>
          <div data-deco="1" style={css("position:absolute;left:61%;top:15%;width:5px;height:5px;border-radius:50%;background:#f4f2ec;animation-name:ldp-twinkle;animation-duration:4.2s;animation-delay:-1.1s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;pointer-events:none")}></div>
          <div data-deco="1" style={css("position:absolute;left:88%;top:31%;width:6px;height:6px;border-radius:50%;background:#f0c579;animation-name:ldp-twinkle;animation-duration:3.8s;animation-delay:-2.3s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;pointer-events:none")}></div>
          <div data-deco="1" style={css("position:absolute;left:74%;top:70%;width:5px;height:5px;border-radius:50%;background:#f4f2ec;animation-name:ldp-twinkle;animation-duration:4.6s;animation-delay:-0.6s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;pointer-events:none")}></div>
          <div data-deco="1" style={css("position:absolute;left:93%;top:59%;width:7px;height:7px;border-radius:50%;background:#f0c579;animation-name:ldp-twinkle;animation-duration:5.2s;animation-delay:-3s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;pointer-events:none")}></div>
          <div data-deco="1" style={css("position:absolute;left:57%;top:82%;width:6px;height:6px;border-radius:50%;background:#f4f2ec;animation-name:ldp-twinkle;animation-duration:4s;animation-delay:-1.8s;animation-timing-function:ease-in-out;animation-iteration-count:infinite;pointer-events:none")}></div>
          <div style={css("position:absolute;left:0;right:0;top:-1px;height:clamp(20px,3vw,34px);background:var(--color-bg);transform:scaleY(-1);clip-path:polygon(0% 100%,0% 52%,3% 74%,6% 46%,9% 68%,12% 38%,15% 62%,18% 44%,21% 72%,24% 50%,27% 76%,30% 42%,33% 60%,36% 36%,39% 58%,42% 46%,45% 70%,48% 40%,51% 64%,54% 48%,57% 74%,60% 44%,63% 66%,66% 38%,69% 62%,72% 50%,75% 72%,78% 42%,81% 60%,84% 46%,87% 68%,90% 40%,93% 64%,96% 48%,100% 66%,100% 100%)")}></div>
          <div style={css("position:absolute;left:0;right:0;bottom:-1px;height:clamp(20px,3vw,34px);background:var(--color-bg);clip-path:polygon(0% 100%,0% 52%,3% 74%,6% 46%,9% 68%,12% 38%,15% 62%,18% 44%,21% 72%,24% 50%,27% 76%,30% 42%,33% 60%,36% 36%,39% 58%,42% 46%,45% 70%,48% 40%,51% 64%,54% 48%,57% 74%,60% 44%,63% 66%,66% 38%,69% 62%,72% 50%,75% 72%,78% 42%,81% 60%,84% 46%,87% 68%,90% 40%,93% 64%,96% 48%,100% 66%,100% 100%)")}></div>
          <div style={css("position:relative;width:min(1080px,100%);margin:0 auto")}>
            <div style={css("text-align:center;animation-name:ldp-rise;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 8% cover 26%")}>
              <div style={css("font-family:var(--font-heading);font-weight:400;text-transform:uppercase;letter-spacing:.07em;font-size:clamp(38px,8.5vw,74px);line-height:1")}>Meet</div>
              <div style={css("font-family:var(--font-heading);font-style:italic;font-weight:400;font-size:clamp(46px,10.5vw,92px);line-height:1;color:#f0c579;margin-top:-.08em")}>Iris</div>
              <div style={css("width:56px;height:1px;background:color-mix(in srgb, #f4f2ec 45%, transparent);margin:clamp(22px,3.6vh,34px) auto 0")}></div>
            </div>
      
            <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(24px,4.5vw,58px);align-items:center;margin-top:clamp(28px,5vh,52px)")}>
              <div style={css("animation-name:ldp-rise;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 10% cover 30%")}>
                <p style={css("text-align:justify;hyphens:auto;font-size:clamp(15px,1.7vw,17px);line-height:1.85;text-wrap:pretty")}>Somewhere between worlds, there&rsquo;s a girl with red curls and a suitcase full of paper.</p>
                <p style={css("text-align:justify;hyphens:auto;font-size:clamp(15px,1.7vw,17px);line-height:1.85;text-wrap:pretty")}>Her name is Iris. She travels through doors, one to the next, writing letters to strangers about the towns she wanders into.</p>
                <p style={css("text-align:justify;hyphens:auto;font-size:clamp(15px,1.7vw,17px);line-height:1.85;text-wrap:pretty")}>Some places are strange. Some are soft. Some hum with music at midnight. Some smell of buttered toast.</p>
                <div style={css("height:1px;background:color-mix(in srgb, #f4f2ec 28%, transparent);margin:var(--space-4) 0")}></div>
                <p style={css("font-family:var(--font-heading);font-style:italic;font-size:clamp(21px,3.4vw,29px);line-height:1.4;margin:0;color:#f0c579")}>Every month, Iris finds a new door.<br />Every month, she sends a letter home.</p>

                <a href="#/the-red-race" style={css("display:inline-flex;align-items:center;gap:10px;margin-top:var(--space-4);padding:11px 18px;border:1px solid color-mix(in srgb, #f4f2ec 42%, transparent);border-radius:var(--radius-md);font-family:var(--font-heading);font-size:15px;text-decoration:none;color:#f4f2ec;white-space:nowrap")}>
                  <span style={css("width:7px;height:7px;border-radius:50%;background:#b3312f;flex:none")}></span>
                  Read her first letter — <em style={css("font-style:italic;color:#f0c579")}>The Red Race</em>
                </a>
              </div>
              <div style={css("display:flex;justify-content:center;animation-name:ldp-parallax;animation-timing-function:linear;animation-fill-mode:both;animation-timeline:view();animation-range:cover 0% cover 100%")}>
                <img src="/assets/iris-desk.png" alt="Iris at her writing desk, letters and a sleeping cat beside her" style={css("width:min(440px,88vw);filter:drop-shadow(0 22px 38px rgba(20,26,16,.38))")} />
              </div>
            </div>
          </div>
        </section>
      
        <section id="how" style={css("position:relative;padding:clamp(64px,11vh,130px) clamp(20px,5vw,40px);border-top:1px solid var(--color-divider)")}>
          <div style={css("width:min(880px,100%);margin:0 auto")}>
            <div style={css("text-align:center;animation-name:ldp-rise;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 8% cover 26%")}>
              <div style={css("font-family:var(--font-heading);font-weight:400;text-transform:uppercase;letter-spacing:.07em;font-size:clamp(38px,8.5vw,74px);line-height:1")}>How</div>
              <div style={css("font-family:var(--font-heading);font-style:italic;font-weight:400;font-size:clamp(38px,8.5vw,76px);line-height:1;color:#b3312f;margin-top:-.06em")}>Does it work?</div>
            </div>
      
            <p style={css("text-align:center;font-family:var(--font-heading);font-style:italic;font-size:clamp(20px,3.4vw,28px);line-height:1.45;margin:clamp(28px,5vh,44px) auto clamp(34px,6vh,56px);max-width:26ch;animation-name:ldp-fade;animation-fill-mode:both;animation-timeline:view();animation-range:entry 14% cover 34%")}>Every month, Iris sends one envelope to her readers.</p>
      
            <div style={css("position:relative;max-width:720px;margin:0 auto")}>
              <div style={css("position:absolute;left:clamp(22px,3.7vw,29px);top:14px;bottom:26px;width:1px;background:#5e7150;transform-origin:top;animation-name:ldp-draw;animation-timing-function:linear;animation-fill-mode:both;animation-timeline:view();animation-range:entry 20% cover 74%")}></div>
              <div style={css("display:grid;grid-template-columns:clamp(44px,7.4vw,58px) 1fr;gap:0 clamp(16px,3vw,26px);align-items:center")}>
              <div style={css("position:relative;z-index:1;display:grid;place-items:center;width:clamp(44px,7.4vw,58px);height:clamp(44px,7.4vw,58px);border:1px solid #5e7150;border-radius:50%;background:var(--color-bg);font-family:var(--font-heading);font-size:clamp(19px,3.2vw,25px);line-height:1;color:#b3312f;font-feature-settings:'tnum';animation-name:ldp-fade;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 12% cover 32%")}>1</div>
              <div style={css("padding:clamp(12px,2vh,18px) 0 clamp(22px,3.6vh,32px);border-bottom:1px solid var(--color-divider);animation-name:ldp-left;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 12% cover 32%")}>
                <p style={css("margin:0;font-size:clamp(16px,2vw,19px);line-height:1.6;text-wrap:pretty")}>Sign-ups open the 15th of every month</p>
              </div>
              <div style={css("position:relative;z-index:1;display:grid;place-items:center;width:clamp(44px,7.4vw,58px);height:clamp(44px,7.4vw,58px);border:1px solid #5e7150;border-radius:50%;background:var(--color-bg);font-family:var(--font-heading);font-size:clamp(19px,3.2vw,25px);line-height:1;color:#b3312f;font-feature-settings:'tnum';animation-name:ldp-fade;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 16% cover 36%")}>2</div>
              <div style={css("padding:clamp(12px,2vh,18px) 0 clamp(22px,3.6vh,32px);border-bottom:1px solid var(--color-divider);animation-name:ldp-left;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 16% cover 36%")}>
                <p style={css("margin:0;font-size:clamp(16px,2vw,19px);line-height:1.6;text-wrap:pretty")}>They close on the 5th of the following month</p>
              </div>
              <div style={css("position:relative;z-index:1;display:grid;place-items:center;width:clamp(44px,7.4vw,58px);height:clamp(44px,7.4vw,58px);border:1px solid #5e7150;border-radius:50%;background:var(--color-bg);font-family:var(--font-heading);font-size:clamp(19px,3.2vw,25px);line-height:1;color:#b3312f;font-feature-settings:'tnum';animation-name:ldp-fade;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 20% cover 40%")}>3</div>
              <div style={css("padding:clamp(12px,2vh,18px) 0 clamp(22px,3.6vh,32px);border-bottom:1px solid var(--color-divider);animation-name:ldp-left;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 20% cover 40%")}>
                <p style={css("margin:0;font-size:clamp(16px,2vw,19px);line-height:1.6;text-wrap:pretty")}>The link lives in our bio during that window</p>
              </div>
              <div style={css("position:relative;z-index:1;display:grid;place-items:center;width:clamp(44px,7.4vw,58px);height:clamp(44px,7.4vw,58px);border:1px solid #5e7150;border-radius:50%;background:var(--color-bg);font-family:var(--font-heading);font-size:clamp(19px,3.2vw,25px);line-height:1;color:#b3312f;font-feature-settings:'tnum';animation-name:ldp-fade;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 24% cover 44%")}>4</div>
              <div style={css("padding:clamp(12px,2vh,18px) 0 clamp(22px,3.6vh,32px);border-bottom:1px solid var(--color-divider);animation-name:ldp-left;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 24% cover 44%")}>
                <p style={css("margin:0;font-size:clamp(16px,2vw,19px);line-height:1.6;text-wrap:pretty")}>Then Iris packs her suitcase, seals the envelopes, and sends them out</p>
              </div>
              <div style={css("position:relative;z-index:1;display:grid;place-items:center;width:clamp(44px,7.4vw,58px);height:clamp(44px,7.4vw,58px);border:1px solid #5e7150;border-radius:50%;background:var(--color-bg);font-family:var(--font-heading);font-size:clamp(19px,3.2vw,25px);line-height:1;color:#b3312f;font-feature-settings:'tnum';animation-name:ldp-fade;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 28% cover 48%")}>5</div>
              <div style={css("padding:clamp(12px,2vh,18px) 0 clamp(22px,3.6vh,32px);animation-name:ldp-left;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 28% cover 48%")}>
                <p style={css("margin:0;font-size:clamp(16px,2vw,19px);line-height:1.6;text-wrap:pretty")}>Your envelope arrives in 5–10 working days</p>
              </div>
              </div>
            </div>
          </div>
        </section>
      
        <section id="inside" style={css("position:relative;padding:clamp(76px,12vh,140px) clamp(20px,5vw,40px) clamp(82px,13vh,150px);overflow:hidden")}>
          <img src="/assets/envelope-folk.png" alt="Envelope folk of the wood, each carrying a sealed letter" style={css("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 58%")} />
          <div style={css("position:absolute;inset:0;background:color-mix(in srgb, var(--color-bg) 74%, transparent)")}></div>
          <div style={css("position:absolute;left:0;right:0;top:-1px;height:clamp(20px,3vw,34px);background:var(--color-bg);transform:scaleY(-1);clip-path:polygon(0% 100%,0% 52%,3% 74%,6% 46%,9% 68%,12% 38%,15% 62%,18% 44%,21% 72%,24% 50%,27% 76%,30% 42%,33% 60%,36% 36%,39% 58%,42% 46%,45% 70%,48% 40%,51% 64%,54% 48%,57% 74%,60% 44%,63% 66%,66% 38%,69% 62%,72% 50%,75% 72%,78% 42%,81% 60%,84% 46%,87% 68%,90% 40%,93% 64%,96% 48%,100% 66%,100% 100%)")}></div>
          <div style={css("position:absolute;left:0;right:0;bottom:-1px;height:clamp(20px,3vw,34px);background:var(--color-bg);clip-path:polygon(0% 100%,0% 52%,3% 74%,6% 46%,9% 68%,12% 38%,15% 62%,18% 44%,21% 72%,24% 50%,27% 76%,30% 42%,33% 60%,36% 36%,39% 58%,42% 46%,45% 70%,48% 40%,51% 64%,54% 48%,57% 74%,60% 44%,63% 66%,66% 38%,69% 62%,72% 50%,75% 72%,78% 42%,81% 60%,84% 46%,87% 68%,90% 40%,93% 64%,96% 48%,100% 66%,100% 100%)")}></div>
          <div style={css("position:relative;width:min(1080px,100%);margin:0 auto")}>
            <div style={css("text-align:center;animation-name:ldp-rise;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 8% cover 26%")}>
              <div style={css("font-family:var(--font-heading);font-weight:400;text-transform:uppercase;letter-spacing:.07em;font-size:clamp(38px,8.5vw,74px);line-height:1")}>What's in</div>
              <div style={css("font-family:var(--font-heading);font-style:italic;font-weight:400;font-size:clamp(44px,9.5vw,86px);line-height:1;color:#b3312f;margin-top:-.06em")}>The envelope</div>
              <p style={css("max-width:46ch;margin:clamp(20px,3.4vh,30px) auto 0;font-size:clamp(15px,1.8vw,17px);line-height:1.75;text-wrap:pretty")}>Six printed pieces, the same six every month — only the writing and the artwork change. No mystery items, nothing edible, nothing you have not been shown.</p>
              <div style={css("width:56px;height:1px;background:#5e7150;margin:clamp(24px,4vh,38px) auto 0")}></div>
            </div>

            <div style={css("position:relative;max-width:660px;margin:clamp(38px,6.5vh,66px) auto 0;animation-name:ldp-rise;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 6% cover 28%")}>
              <div style={css("position:absolute;top:-14px;left:50%;transform:translateX(-50%) rotate(-1.6deg);width:clamp(100px,24%,144px);height:30px;background:color-mix(in srgb, var(--color-accent-300) 60%, transparent);border-left:1px solid color-mix(in srgb, var(--color-accent-500) 28%, transparent);border-right:1px solid color-mix(in srgb, var(--color-accent-500) 28%, transparent);box-shadow:var(--shadow-sm);z-index:2")}></div>
              <div style={css("position:relative;padding:clamp(28px,4.5vw,44px) clamp(18px,3.4vw,34px);background-color:var(--color-neutral-100);background-image:repeating-linear-gradient(to bottom, transparent 0 33px, color-mix(in srgb, var(--color-accent) 15%, transparent) 33px 34px);border:1px solid var(--color-divider);border-radius:var(--radius-md);box-shadow:var(--shadow-md);transform:rotate(-.4deg)")}>
                <div style={css("display:flex;flex-direction:column;gap:clamp(10px,1.6vw,14px)")}>
                  {ENVELOPE.map((item, i) => (
                    <div key={item.title} style={css(`display:flex;align-items:flex-start;gap:14px;padding:13px clamp(14px,2.4vw,20px);background:var(--color-bg);border:1px solid var(--color-divider);border-radius:var(--radius-md);transition:background .35s;animation-name:ldp-left;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry ${10 + i * 3}% cover ${30 + i * 3}%`)} data-hv="0">
                      <span style={css("flex:none;margin-top:2px;width:22px;height:22px;border:1px solid var(--color-accent);border-radius:var(--radius-sm);display:grid;place-items:center;color:var(--color-accent-700);font-size:13px;line-height:1")}>✓</span>
                      <span style={css("font-size:clamp(15px,1.9vw,17px);line-height:1.5;text-wrap:pretty")}>
                        <strong style={css("font-weight:600")}>{item.title}</strong>
                        <span style={css("display:block;font-size:.86em;line-height:1.55;margin-top:3px;color:color-mix(in srgb, var(--color-text) 66%, transparent)")}>{item.detail}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
      
            <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:clamp(24px,4vw,52px);align-items:center;margin-top:clamp(44px,7vh,86px);padding-top:clamp(34px,5vh,54px);border-top:1px solid var(--color-divider)")}>
              <div style={css("animation-name:ldp-rise;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 12% cover 34%")}>
                <p style={css("font-size:clamp(16px,2vw,19px);line-height:1.8;text-wrap:pretty;margin-bottom:var(--space-3)")}>First-time readers also get a printed <em style={css("font-family:var(--font-heading);font-style:italic;font-size:1.22em;color:#b3312f")}>Wanderland Passport</em> — a small stapled booklet with a page for each month, and a paper stamp to paste in every time an envelope arrives.</p>
                <p style={css("font-family:var(--font-heading);font-style:italic;font-size:clamp(20px,3vw,26px);line-height:1.4;margin:0")}>One booklet, twelve months, twelve stamps.</p>
              </div>
              <div style={css("display:flex;justify-content:center")}>
                <div style={css("position:relative;width:min(230px,62vw);aspect-ratio:1;display:grid;place-items:center")}>
                  <div style={css("position:absolute;inset:0;border:1px solid var(--color-divider);border-radius:50%")}></div>
                  <div style={css("position:absolute;inset:12%;border:1px solid var(--color-divider);border-radius:50%")}></div>
                  <div style={css("position:relative;display:grid;place-items:center;gap:4px;text-align:center;color:var(--color-accent-700);animation-name:ldp-stamp;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,1.5,.5,1);animation-timeline:view();animation-range:entry 30% entry 90%")}>
                    <div style={css("width:min(150px,44vw);aspect-ratio:1;border:2px solid #b3312f;border-radius:50%;display:grid;place-items:center;padding:12%")}>
                      <div>
                        <div style={css("font-size:10px;letter-spacing:.18em;text-transform:uppercase")}>Wanderland</div>
                        <div style={css("font-family:var(--font-heading);font-style:italic;font-size:clamp(20px,5.4vw,28px);line-height:1.1;margin:2px 0")}>Passport</div>
                        <div style={css("font-size:10px;letter-spacing:.18em;text-transform:uppercase;font-feature-settings:'tnum'")}>No. 001</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      
        <section id="subscribe" style={css("position:relative;padding:clamp(64px,11vh,130px) clamp(20px,5vw,40px) clamp(48px,8vh,90px);border-top:1px solid var(--color-divider);background:color-mix(in srgb, var(--color-surface) 55%, var(--color-bg))")}>
          <div style={css("width:min(1080px,100%);margin:0 auto")}>
            <div style={css("text-align:center;animation-name:ldp-rise;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 6% cover 24%")}>
              <div style={css("font-family:var(--font-heading);font-weight:400;text-transform:uppercase;letter-spacing:.07em;font-size:clamp(38px,8.5vw,74px);line-height:1")}>Send me</div>
              <div style={css("font-family:var(--font-heading);font-style:italic;font-weight:400;font-size:clamp(44px,9.5vw,86px);line-height:1;color:#b3312f;margin-top:-.06em")}>A letter</div>
              <p style={css("max-width:44ch;margin:clamp(22px,4vh,34px) auto 0;font-size:clamp(15px,1.8vw,17px);line-height:1.75;text-wrap:pretty")}>Tell Iris where to post it. She writes the address by hand, so please give it exactly as your post office likes it.</p>
            </div>
      
            <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(34px,5vw,64px);align-items:start;margin-top:clamp(38px,6vh,68px)")}>
      
              <div ref={envWrap} style={css("position:relative;max-width:480px;margin:0 auto;width:100%;transition:transform 1s cubic-bezier(.2,.7,.2,1), opacity 1s;animation-name:ldp-rise;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 10% cover 32%")}>
                <div data-env="face" style={css("position:relative;aspect-ratio:1.58/1;background:#5e7150;border-radius:var(--radius-sm);box-shadow:var(--shadow-lg);overflow:hidden")}>
                  <div data-env="flap" style={css("position:absolute;top:0;left:0;right:0;height:57%;background:#526344;clip-path:polygon(0 0,100% 0,50% 100%)")}></div>
                  <div style={css("position:absolute;inset:0;background:linear-gradient(155deg, rgba(255,255,255,.10), rgba(0,0,0,.14))")}></div>
      
                  <div style={css("position:absolute;right:6%;top:6%;width:clamp(54px,15%,80px);aspect-ratio:.78;background:var(--color-neutral-100);border:1px solid var(--color-divider);display:grid;place-items:center;text-align:center;padding:5px;transform:rotate(2deg);box-shadow:var(--shadow-sm)")}>
                    <div>
                      <div style={css("font-family:var(--font-heading);font-style:italic;font-size:11px;line-height:1.15;color:var(--color-accent-700)")}>Little Door</div>
                      <div style={css("font-size:8px;letter-spacing:.12em;text-transform:uppercase;margin-top:2px;color:color-mix(in srgb, var(--color-text) 55%, transparent)")}>Post</div>
                    </div>
                  </div>
      
                  <div style={css("position:absolute;left:7%;bottom:9%;width:58%;max-width:268px;background:var(--color-neutral-100);border:1px solid var(--color-divider);padding:10px 13px 11px;transform:rotate(-1.2deg);box-shadow:var(--shadow-sm)")}>
                    <div style={css("font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 50%, transparent);margin-bottom:5px")}>To</div>
                    <div ref={outName} style={css("font-family:var(--font-heading);font-size:clamp(15px,3.2vw,19px);line-height:1.25;color:var(--color-text);overflow-wrap:anywhere")}>Your name</div>
                    <div ref={outStreet} style={css("font-size:clamp(11px,2.3vw,13px);line-height:1.5;margin-top:3px;color:color-mix(in srgb, var(--color-text) 72%, transparent);overflow-wrap:anywhere")}>Street address</div>
                    <div ref={outCity} style={css("font-size:clamp(11px,2.3vw,13px);line-height:1.5;color:color-mix(in srgb, var(--color-text) 72%, transparent);overflow-wrap:anywhere")}>City · Postcode</div>
                    <div ref={outCountry} style={css("font-size:clamp(11px,2.3vw,13px);line-height:1.5;letter-spacing:.06em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 72%, transparent);overflow-wrap:anywhere")}>Country</div>
                  </div>
                </div>
      
                <div ref={sealRef} style={css("position:absolute;left:76%;top:50%;width:clamp(62px,16%,80px);aspect-ratio:1;border-radius:50%;background:#b3312f;color:var(--color-neutral-100);display:grid;place-items:center;opacity:0;transform:translate(-50%,-50%) rotate(-8deg);box-shadow:var(--shadow-md);pointer-events:none")}>
                  <div style={css("width:74%;height:74%;border:1px solid color-mix(in srgb, #fff 55%, transparent);border-radius:50%;display:grid;place-items:center;font-family:var(--font-heading);font-style:italic;font-size:clamp(19px,4.4vw,25px);letter-spacing:.02em")}>LD</div>
                </div>
      
                <p style={css("text-align:center;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 50%, transparent);margin:16px 0 0")}>Your envelope, as Iris will address it</p>
              </div>
      
              <div style={css("animation-name:ldp-rise;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 12% cover 34%")}>
                <div style={css("display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--color-divider);border-radius:var(--radius-md);margin-bottom:var(--space-4)")}>
                  <span style={css("width:7px;height:7px;border-radius:50%;background:var(--color-accent);flex:none")}></span>
                  <span ref={statusText} style={css("font-size:13px;line-height:1.4")}>Sign-ups open the 15th of every month.</span>
                </div>
      
                <SubscribeForm
                  onAddressChange={onAddressChange}
                  onSealed={onSealed}
                  onUnsealed={onUnsealed}
                />
              </div>
            </div>
          </div>
        </section>
      
        <footer style={css("border-top:1px solid var(--color-divider);padding:clamp(34px,6vh,58px) clamp(20px,5vw,40px)")}>
          <div style={css("width:min(1080px,100%);margin:0 auto;display:flex;flex-wrap:wrap;gap:16px 32px;align-items:baseline;justify-content:space-between")}>
            <div style={css("font-family:var(--font-heading);font-size:clamp(17px,3vw,21px)")}>The Little Door Post</div>
            <div style={css("font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 52%, transparent)")}>One envelope a month · Posted across India</div>
          </div>
        </footer>
      </div>
    </>
  );
}
