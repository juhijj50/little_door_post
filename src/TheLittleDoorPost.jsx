/*  The landing page — one page, three sections.
 *
 *      hero       the Yeats line and what this is, on a stamp-edged card
 *      inside     "What's Inside ?" over one photograph of the envelope
 *      subscribe  SubscribeForm, which owns the whole sign-up
 *
 *  Above them, the navbar shared with the policy pages (SiteNav); below them,
 *  one line pointing anybody with a question at Instagram, and the footer,
 *  which is where the policy pages are linked from.
 *
 *  Only one thing on this page is editable from the admin panel — the "what's
 *  inside" photograph. It is written into the site's own files (src/content/
 *  inside.js, public/media) by the panel's publish step, so it is on screen
 *  from the first paint with no wait on a sleeping server. Until the panel has
 *  published once it falls back to /api/config.
 *
 *  Layout is in site.css; the colours and controls are styles.css and
 *  brand-tokens.css.
 */
import React from "react";
import { mediaUrl } from "./api.js";
import useConfig, { useEdition } from "./useConfig.js";
import { business } from "./business.js";
import { inside } from "./content/index.js";
import SubscribeForm from "./SubscribeForm.jsx";
import SiteFooter from "./SiteFooter.jsx";
import SiteNav from "./SiteNav.jsx";

/*  The December edition sheet, shipped with the site. It is what the middle
 *  section shows until the panel has a photograph of its own — and what it
 *  goes back to if that one is removed. A built-in beats an empty band: the
 *  page keeps its shape whatever the panel holds, and whatever the API is
 *  doing. */
const DEFAULT_INSIDE = "/assets/whats-inside.webp";

export default function TheLittleDoorPost() {
  const { config } = useConfig();
  const edition = useEdition();

  /* Published pictures are paths on this site; the API's are on the API. */
  const chosen = inside.published ? inside.image : mediaUrl(config?.inside?.image);
  const insideImage = chosen || DEFAULT_INSIDE;

  return (
    <div className="page">
      <SiteNav />

      {/* ── 1 · hero ───────────────────────────────────────────────────── */}
      <section id="top" className="band band--stamps hero">
        <div className="stamp-card hero__card">
          <p className="hero__quote">
            &ldquo;The world is full of magical things, patiently waiting for our senses to grow
            sharper.&rdquo;
            <span className="hero__attribution">&mdash; W.B. Yeats</span>
          </p>

          <p className="hero__text">
            The Little Door Post goes looking for them, and mails a little piece of the
            world&rsquo;s most magical places to your door, one letter a month.
          </p>
          <p className="hero__text">
            No passport, no plane, just a letter waiting in your mailbox.
          </p>

          <a className="btn btn-primary hero__cta" href="#subscribe">
            Receive a letter
          </a>
        </div>
      </section>

      {/* ── 2 · what's inside ──────────────────────────────────────────── */}
      <section id="inside" className="band band--paper inside">
        <div className="inside__inner">
          <h2 className="inside__title">What&rsquo;s Inside ?</h2>
          <div className="inside__frame">
            <img
              src={insideImage}
              alt="Everything that comes in one month's envelope, laid out and labelled"
            />
          </div>
        </div>
      </section>

      {/* ── 3 · the order form ─────────────────────────────────────────── */}
      <section id="subscribe" className="band band--stamps subscribe">
        <div className="stamp-card subscribe__card">
          <div className="subscribe__intro">
            <h2 className="subscribe__title">Receive a letter</h2>
            {/* Says which batch they are joining, and says so plainly when
              * that batch has gone — marking an edition sold out in the panel
              * has to change what the page says, not only what the form
              * does. Until the API answers, the neutral line. */}
            <p className="subscribe__lede">
              {!edition
                ? "Choose how many months, tell us where to post it, and your address goes into the next batch."
                : edition.open
                ? `Choose how many months, tell us where to post it, and your address goes into the ${edition.name} batch.`
                : `Every copy of the ${edition.name} edition has gone. ${edition.next.name} opens soon.`}
            </p>
          </div>
          <div className="subscribe__form">
            <SubscribeForm />
          </div>
        </div>
      </section>

      {/* ── anything else ──────────────────────────────────────────────── */}
      <section className="ask">
        <p className="ask__text">
          Any questions, or anything you need to know before you order? Send us a message on
          Instagram at{" "}
          <a
            className="ask__handle"
            href={`https://instagram.com/${business.instagram}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            @{business.instagram}
          </a>{" "}
          and we will write back.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
