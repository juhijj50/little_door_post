/*  The landing page.
 *
 *  Iris walks through doors, and every door opens onto a real corner of the
 *  world — one that is there today, or one that was there once. Each month's
 *  envelope is about one of them.
 *
 *  Five sections, in the order a reader meets them:
 *
 *    hero      →  the wordmark over the forest, the edition on sale, what arrives
 *    meet      →  who Iris is, and a way into her first letter
 *    inside    →  this edition's envelope, piece by piece
 *    gallery   →  photographs of real post going out
 *    subscribe →  SubscribeForm, which owns the whole sign-up
 *
 *  The edition, the envelope's contents and photograph, and the gallery all
 *  come from /api/config and are edited from the admin panel. The lists below
 *  are only what shows if the API cannot be reached at all.
 *
 *  Styling is inline through css() as before; the parts that need media
 *  queries (the header menu, the envelope grid, the gallery) are in site.css.
 */
import React, { useEffect, useState } from "react";
import { css } from "./css.js";
import { mediaUrl } from "./api.js";
import useConfig from "./useConfig.js";
import SubscribeForm from "./SubscribeForm.jsx";
import SiteFooter from "./SiteFooter.jsx";
import GlobalWaitlist from "./GlobalWaitlist.jsx";
import Gallery from "./Gallery.jsx";

/* Mirrors DEFAULT_CONTENTS in backend/app/cycles.py. Only shown when the API
 * is unreachable; otherwise the edition's own list, from the panel, is used. */
const ENVELOPE_FALLBACK = [
  ["A letter from Iris", "Two printed pages from the corner of the world she has wandered into this month."],
  ["A letter from someone she met", "One printed page from a person who lives there — or lived there, long ago."],
  ["A place sticker", "A die-cut sticker of that month's corner of the world."],
  ["A character sticker", "A die-cut sticker of Iris, or of somebody she met on the way."],
  ["An art print", "A small illustrated print on card, drawn from that month's place."],
  ["An activity sheet", "One page — a puzzle, a recipe from that place, or something to make."],
  ["A special poem", "Written for that month by a friend of Iris, and printed to keep."],
  ["A stamp of the place", "A printed paper stamp of that month's corner of the world, for your passport."],
  ["A Wanderland Passport", "For first-time subscribers. A booklet with a page for every door, and a stamp to paste in each time a letter lands."],
].map(([title, detail]) => ({ title, detail }));

/* The photographs the gallery started with, shipped with the site. Shown only
 * if the API cannot be reached — the live gallery is whatever the panel holds. */
const GALLERY_FALLBACK = [
  ["/assets/gallery-white-stack.webp", "A stack of white envelopes printed with the blue door and the Little Door Post wordmark"],
  ["/assets/gallery-green-seals.webp", "Sage-green envelopes with painted door cards and pressed wax seals"],
  ["/assets/gallery-addressed.webp", "Green and white envelopes addressed by hand, stamped with strawberries and little doors"],
  ["/assets/gallery-sunlit-nook.webp", "An edition laid out: letters, a recipe, a to-do list and stickers"],
  ["/assets/gallery-red-race.webp", "An envelope opened out: the letter, sticker sheets, wax seals and a colouring page"],
  ["/assets/gallery-packing.webp", "Coloured paper envelopes, handwritten notes and sticker books laid out for packing"],
].map(([src, caption]) => ({ src, caption }));

const NAV = [
  ["#meet", "Meet Iris"],
  ["#inside", "What's inside"],
  ["#gallery", "Gallery"],
  ["/red-race", "Read Door 1"],
  ["#global", "Outside India"],
];

/* The ragged lower edge of the hero photograph, cut out of the page colour. */
const TORN_EDGE =
  "polygon(0% 100%,0% 52%,3% 74%,6% 46%,9% 68%,12% 38%,15% 62%,18% 44%,21% 72%,24% 50%,27% 76%,30% 42%,33% 60%,36% 36%,39% 58%,42% 46%,45% 70%,48% 40%,51% 64%,54% 48%,57% 74%,60% 44%,63% 66%,66% 38%,69% 62%,72% 50%,75% 72%,78% 42%,81% 60%,84% 46%,87% 68%,90% 40%,93% 64%,96% 48%,100% 66%,100% 100%)";

const kicker = css(
  "display:inline-flex;align-items:center;gap:8px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--color-accent-700)"
);
const rule = css("width:26px;height:1px;background:var(--color-accent-500)");
const h2 = css(
  "font-family:var(--font-heading);font-weight:600;font-size:clamp(34px,6vw,60px);line-height:1.04;margin:clamp(12px,2vh,18px) 0 0;color:var(--color-accent-800);text-wrap:pretty"
);
const lede = css(
  "font-size:clamp(15px,1.8vw,17px);line-height:1.78;margin:clamp(12px,2.2vh,20px) 0 0;color:var(--color-neutral-700);text-wrap:pretty"
);

/* The header. On a phone the links fold behind a three-line button. */
function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    /* Widening past the phone layout puts the links back in the bar; the
     * menu should not still think it is open when the screen narrows again. */
    const onResize = () => window.innerWidth > 760 && setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <a href="/" className="site-header__brand" style={css("display:flex;align-items:center;gap:10px;margin-right:auto;min-width:0;text-decoration:none;color:var(--color-text)")}>
          <img
            src="/assets/logo-round.webp"
            alt=""
            style={css(
              "width:clamp(36px,8vw,44px);height:clamp(36px,8vw,44px);border-radius:50%;object-fit:cover;flex:none;box-shadow:var(--shadow-sm)"
            )}
          />
          <span
            style={css(
              "font-family:var(--font-heading);font-weight:600;font-size:clamp(16px,3.6vw,20px);line-height:1.1;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
            )}
          >
            The Little Door Post
          </span>
        </a>
        <a className="btn btn-primary site-header__cta" href="#subscribe" style={css("padding:10px 20px;font-size:14px;white-space:nowrap;order:2")}>
          Receive a letter
        </a>
        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Close the menu" : "Open the menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            {open ? (
              <path d="M5 5l12 12M17 5 5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
        <nav id="site-nav" className={`site-header__nav${open ? " is-open" : ""}`} aria-label="Sections">
          {NAV.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a className="site-header__nav-cta" href="#subscribe" onClick={() => setOpen(false)}>
            Receive a letter
          </a>
        </nav>
      </div>
    </header>
  );
}

/* "Now taking orders for…" or "…sold out". Nothing at all until the API has
 * answered, rather than a guess that might be wrong. */
function EditionBadge({ edition }) {
  if (!edition) return null;
  const soldOut = edition.status === "sold_out";
  return (
    <div
      style={css(
        "position:relative;display:inline-flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px 10px;margin:0 0 clamp(14px,2.4vh,22px);padding:8px 16px;border-radius:999px;font-size:13px;line-height:1.4;letter-spacing:.02em;animation:ldp-rise 1s .3s both;" +
          (soldOut
            ? "background:#f6e3df;color:#7c2f25;border:1px solid #e6c1b9"
            : "background:var(--color-accent-100);color:var(--color-accent-800);border:1px solid var(--color-accent-300)")
      )}
    >
      <span
        aria-hidden="true"
        style={css(`width:7px;height:7px;border-radius:50%;background:${soldOut ? "#b5503f" : "var(--color-accent-600)"}`)}
      />
      {soldOut ? (
        <span>
          <strong>The {edition.name} edition is sold out</strong> &middot; {edition.next.name} opens soon
        </span>
      ) : (
        <span>
          Now posting the <strong>{edition.name}</strong> edition
        </span>
      )}
    </div>
  );
}

export default function TheLittleDoorPost() {
  const { config, failed } = useConfig();
  const edition = config?.edition;

  const items = config?.envelope?.items?.length ? config.envelope.items : ENVELOPE_FALLBACK;
  const envelopeImage = mediaUrl(config?.envelope?.image) || "/assets/envelope-white.webp";

  const photos = config
    ? (config.gallery || []).map((g) => ({ src: mediaUrl(g.url), caption: g.caption }))
    : failed
    ? GALLERY_FALLBACK
    : [];

  return (
    <div style={css("background:var(--color-bg);color:var(--color-text);position:relative;overflow:clip")}>
      <SiteHeader />

      {/* ── hero ───────────────────────────────────────────────────────── */}
      <section
        id="top"
        style={css(
          "position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 clamp(20px,5vw,40px) clamp(52px,9vh,92px);overflow:hidden"
        )}
      >
        <div style={css("align-self:stretch;position:relative;margin:0 calc(-1 * clamp(20px,5vw,40px)) clamp(22px,4vh,44px);line-height:0")}>
          <img
            src="/assets/forest.webp"
            alt="A watercolour clearing of mushroom folk, pinecone people and paper ghosts"
            style={css(
              "width:100%;height:clamp(190px,34svh,400px);object-fit:cover;object-position:50% 62%;animation:ldp-fade 1.4s both"
            )}
          />
          <div
            style={{
              ...css("position:absolute;left:0;right:0;bottom:-1px;height:clamp(20px,3vw,34px);background:var(--color-bg)"),
              clipPath: TORN_EDGE,
            }}
          />
        </div>

        <div
          style={css(
            "position:absolute;left:50%;top:58%;width:min(680px,92vw);aspect-ratio:1;background:radial-gradient(circle, rgba(134,149,92,.20) 0%, transparent 62%);animation:ldp-bloom 7s ease-in-out infinite alternate;pointer-events:none"
          )}
        />
        <div
          style={css(
            "position:absolute;left:16%;top:46%;width:7px;height:7px;border-radius:50%;background:var(--color-accent-2-400);animation:ldp-twinkle 3.6s ease-in-out infinite;pointer-events:none"
          )}
        />
        <div
          style={css(
            "position:absolute;right:14%;top:54%;width:6px;height:6px;border-radius:50%;background:#d98f8a;animation:ldp-twinkle 4.4s -1.4s ease-in-out infinite;pointer-events:none"
          )}
        />

        <EditionBadge edition={edition} />

        <img
          src="/assets/wordmark.png"
          alt="The Little Door Post"
          style={css("position:relative;width:min(580px,86vw);mix-blend-mode:multiply;animation:ldp-hero 1.5s cubic-bezier(.2,.7,.2,1) both")}
        />

        <p
          style={css(
            "position:relative;max-width:32ch;margin:clamp(6px,1.6vh,16px) 0 0;font-family:var(--font-heading);font-style:italic;font-weight:400;font-size:clamp(21px,4.6vw,32px);line-height:1.34;color:var(--color-accent-800);text-wrap:pretty;animation:ldp-rise 1.1s .45s cubic-bezier(.2,.7,.2,1) both"
          )}
        >
          Every month, Iris opens a new door.
          <br />
          Behind it, a real corner of the world.
        </p>

        <p
          style={css(
            "position:relative;max-width:48ch;margin:clamp(14px,2.4vh,22px) 0 0;font-size:clamp(15px,2vw,17px);line-height:1.72;color:var(--color-neutral-700);text-wrap:pretty;animation:ldp-rise 1.1s .6s cubic-bezier(.2,.7,.2,1) both"
          )}
        >
          Some of those corners are still there today. Some were there once, long ago. Each month
          she writes home about one of them &mdash; letters, a poem, stickers and an art print,
          sealed into one envelope and posted to your letterbox.
        </p>

        <div
          style={css(
            "position:relative;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:clamp(20px,3.4vh,32px);animation:ldp-rise 1.1s .75s cubic-bezier(.2,.7,.2,1) both"
          )}
        >
          <a className="btn btn-primary" href="#subscribe" style={css("padding:13px 26px;font-size:15px")}>
            Receive a letter
          </a>
          <a className="btn btn-secondary" href="#inside" style={css("padding:13px 26px;font-size:15px")}>
            See what&rsquo;s inside
          </a>
        </div>

        <div
          style={css(
            "position:relative;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px 14px;margin-top:clamp(20px,3vh,28px);font-size:13px;letter-spacing:.02em;color:var(--color-neutral-600)"
          )}
        >
          <span>Real places, past and present</span>
          <span style={css("width:5px;height:5px;border-radius:50%;background:#d98f8a")} />
          <span>Printed on real paper</span>
          <span style={css("width:5px;height:5px;border-radius:50%;background:var(--color-accent-2-400)")} />
          <span>Posted across India and abroad</span>
        </div>
      </section>

      {/* ── meet Iris ──────────────────────────────────────────────────── */}
      <section
        id="meet"
        style={css(
          "position:relative;padding:clamp(56px,9vh,116px) clamp(20px,5vw,44px);background:var(--color-accent-800);color:var(--color-neutral-200);overflow:hidden"
        )}
      >
        <div
          style={css(
            "position:absolute;left:66%;top:44%;width:min(760px,120vw);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle, rgba(196,205,159,.20) 0%, transparent 66%);pointer-events:none"
          )}
        />
        <div
          style={css(
            "position:relative;width:min(1120px,100%);margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:clamp(26px,5vw,60px);align-items:center"
          )}
        >
          <div>
            <div style={css("display:inline-flex;align-items:center;gap:8px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--color-accent-300)")}>
              <span style={css("width:26px;height:1px;background:var(--color-accent-300)")} />
              The letter-writer
            </div>
            <h2 style={css("font-family:var(--font-heading);font-weight:600;font-size:clamp(38px,7vw,68px);line-height:1.02;margin:clamp(12px,2vh,18px) 0 0;color:var(--color-neutral-200)")}>
              Meet Iris
            </h2>
            <p style={css("font-size:clamp(16px,1.8vw,18px);line-height:1.85;margin:clamp(16px,2.6vh,24px) 0 0;text-wrap:pretty")}>
              Somewhere between worlds there is a girl with red curls and a suitcase full of paper.
            </p>
            <p style={css("font-size:clamp(16px,1.8vw,18px);line-height:1.85;margin:14px 0 0;text-wrap:pretty")}>
              She travels through doors, one to the next, and every door opens somewhere real. A
              market town that still wakes before dawn. A harbour the sea swallowed centuries ago. A
              village with a single road in. A library that burned two thousand years back.
            </p>
            <p style={css("font-size:clamp(16px,1.8vw,18px);line-height:1.85;margin:14px 0 0;text-wrap:pretty")}>
              Some of these corners are famous. Most are not. Wherever she lands, she meets the
              people who live there &mdash; or lived there once &mdash; and writes it all home:
              printed, folded and sealed by one pair of hands.
            </p>
            <p
              style={css(
                "font-family:var(--font-heading);font-style:italic;font-weight:400;font-size:clamp(21px,3vw,29px);line-height:1.34;margin:clamp(22px,3.6vh,32px) 0 0;padding-left:18px;border-left:2px solid var(--color-accent-400);color:var(--color-accent-300);text-wrap:pretty"
              )}
            >
              The world has never once run out of corners.
            </p>
            <a
              className="btn btn-primary"
              href="/red-race"
              style={css(
                "margin-top:clamp(20px,3vh,28px);padding:12px 22px;font-size:15px;background:var(--color-accent-300);border-color:var(--color-accent-300);color:var(--color-accent-900)"
              )}
            >
              Read her first letter
            </a>
          </div>
          <div style={css("display:flex;justify-content:center")}>
            <img
              src="/assets/iris.webp"
              alt="Iris, red-haired and mid-stride, wheeling her suitcase with letters trailing behind her"
              style={css("width:min(420px,84%);filter:drop-shadow(0 24px 40px rgba(20,26,16,.42));animation:ldp-sway 9s ease-in-out infinite alternate")}
            />
          </div>
        </div>
      </section>

      {/* ── what's inside ──────────────────────────────────────────────── */}
      <section id="inside" style={css("position:relative;padding:clamp(58px,9vh,118px) clamp(20px,5vw,44px)")}>
        <div style={css("width:min(1180px,100%);margin:0 auto")}>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:clamp(24px,4.5vw,56px);align-items:center")}>
            <div>
              <div style={kicker}>
                <span style={rule} />
                {edition ? `The ${edition.name} envelope` : `${items.length} pieces`}
              </div>
              <h2 style={h2}>What&rsquo;s in the envelope</h2>
              <p style={{ ...lede, maxWidth: "46ch" }}>
                Every envelope is about one corner of the world. Here is exactly what is in this
                one &mdash; every piece named, printed on real paper, nothing edible and nothing you
                haven&rsquo;t been shown.
              </p>
            </div>
            <div style={css("display:flex;justify-content:center")}>
              <img
                key={envelopeImage}
                src={envelopeImage}
                alt={edition ? `The ${edition.name} envelope` : "This month's envelope"}
                style={css(
                  "width:min(470px,92%);max-height:420px;object-fit:contain;filter:drop-shadow(0 20px 32px rgba(58,49,40,.18));animation:ldp-float 9s ease-in-out infinite alternate"
                )}
              />
            </div>
          </div>

          <div className="envelope-grid" style={css("margin-top:clamp(30px,5vh,54px)")}>
            {items.map(({ title, detail }, i) => (
              <div
                key={`${i}-${title}`}
                style={css(
                  "display:flex;flex-direction:column;gap:9px;padding:clamp(14px,1.8vw,20px);border-radius:var(--radius-md);background:var(--color-neutral-100);border:1px solid var(--color-neutral-300);box-shadow:var(--shadow-sm)"
                )}
              >
                <div style={css("display:flex;align-items:center;gap:10px")}>
                  <span
                    style={css(
                      "flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--color-accent-200);color:var(--color-accent-800);font-family:var(--font-heading);font-weight:600;font-size:14px;line-height:1"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={css(
                      "font-family:var(--font-heading);font-weight:600;font-size:17px;line-height:1.22;color:var(--color-accent-800);text-wrap:pretty"
                    )}
                  >
                    {title}
                  </span>
                </div>
                {detail && (
                  <p style={css("margin:0;font-size:14px;line-height:1.62;color:var(--color-neutral-700);text-wrap:pretty")}>{detail}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── the photographs ────────────────────────────────────────────── */}
      <section id="gallery" style={css("position:relative;padding:clamp(52px,8vh,104px) clamp(16px,5vw,44px);background:var(--color-accent-100)")}>
        <div style={css("width:min(1180px,100%);margin:0 auto")}>
          <div style={css("max-width:52ch;margin-bottom:clamp(18px,3vh,28px)")}>
            <div style={kicker}>
              <span style={rule} />
              Photographed at the desk
            </div>
            <h2 style={h2}>The post, as it really looks</h2>
            <p style={lede}>
              Envelopes printed, sealed and addressed by hand, and the paper that goes inside them.
              Tap any photograph to see it full size.
            </p>
          </div>
          <Gallery photos={photos} pending={!config && !failed} />
        </div>
      </section>

      {/* ── sign up ────────────────────────────────────────────────────── */}
      <section id="subscribe" style={css("position:relative;padding:clamp(52px,8vh,104px) clamp(14px,4vw,44px);overflow:hidden")}>
        <div style={css("position:absolute;inset:0;pointer-events:none")}>
          <img
            src="/assets/gallery-green-seals.webp"
            alt=""
            style={css("width:100%;height:100%;object-fit:cover;filter:saturate(.62) brightness(1.06)")}
          />
          <div
            style={css(
              "position:absolute;inset:0;background:linear-gradient(180deg, rgba(248,243,232,.92) 0%, rgba(248,243,232,.82) 40%, rgba(248,243,232,.94) 100%)"
            )}
          />
        </div>

        <div
          style={css(
            "position:relative;width:min(660px,100%);margin:0 auto;padding:clamp(20px,5vw,44px);border-radius:var(--radius-lg);background:var(--color-neutral-100);border:1px solid var(--color-neutral-300);box-shadow:var(--shadow-lg)"
          )}
        >
          <div style={css("text-align:center;margin-bottom:clamp(22px,3.6vh,34px)")}>
            <h2 style={css("font-family:var(--font-heading);font-weight:600;font-size:clamp(32px,5.6vw,52px);line-height:1.04;margin:0;color:var(--color-accent-800)")}>
              Receive a letter
            </h2>
            <p style={{ ...lede, maxWidth: "42ch", marginLeft: "auto", marginRight: "auto" }}>
              {!edition
                ? "Choose a subscription, tell Iris where to post it, and your address goes into this month’s batch."
                : edition.open
                ? `Choose a subscription, tell Iris where to post it, and your address goes into the ${edition.name} batch.`
                : `Every copy of the ${edition.name} edition has gone. ${edition.next.name} is next.`}
            </p>
          </div>
          <SubscribeForm />
        </div>
      </section>

      <GlobalWaitlist />

      <SiteFooter />
    </div>
  );
}
