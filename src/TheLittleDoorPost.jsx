/*  The landing page.
 *
 *  Six sections, in the order a reader meets them:
 *
 *    hero      →  the wordmark over the forest, and what arrives
 *    meet      →  who Iris is, and a way into her first letter
 *    inside    →  the nine printed pieces, named
 *    gallery   →  ten photographs of real post going out
 *    folk      →  who wrote this month's second letter
 *    subscribe →  SubscribeForm, which owns the whole sign-up
 *
 *  Styling is inline through css() for the same reason as the rest of the app:
 *  the tokens live in styles.css / brand-tokens.css, and everything here reads
 *  from them rather than restating colours.
 */
import React from "react";
import { css } from "./css.js";
import SubscribeForm from "./SubscribeForm.jsx";
import SiteFooter from "./SiteFooter.jsx";
import GlobalWaitlist from "./GlobalWaitlist.jsx";

/* Kept in step with `contents` in business.js and ENVELOPE_CONTENTS in
 * backend/app/routers/subscriptions.py. Nine, not eight: the passport is sent
 * once, with a first envelope, and is listed because a reader who is paying
 * for it should be able to read what it is. */
const ENVELOPE = [
  ["A letter from Iris", "Two printed pages about the place she has wandered into this month."],
  ["A letter from a side character", "One printed page from somebody she met there, in their own words."],
  ["A theme sticker", "A die-cut sticker of that month's world."],
  ["A character sticker", "A die-cut sticker of Iris, or one of the folk she meets."],
  ["An art print", "A small illustrated print on card, drawn for that month's story."],
  ["An activity sheet", "One page — a puzzle, a recipe, or something to make."],
  ["A zine", "A little folded zine of the old traditions of that month's world, with a small keepsake tucked into its fold."],
  ["A stamp of the town", "A paper stamp of that month's place, to paste into your passport."],
  ["A Wanderland Passport", "For first-time subscribers. A stapled booklet with a page for every door, and a stamp to paste in each time a letter lands."],
];

/* Photographs of post that has actually gone out. Two rows of five on a wide
 * screen, two columns on a phone — the grid below does that without a media
 * query, and every tile is the same 3:4 so no row goes ragged. */
const GALLERY = [
  ["/assets/gallery-white-stack.jpg", "A stack of white envelopes printed with the blue door and the Little Door Post wordmark"],
  ["/assets/gallery-green-seals.jpg", "Sage-green envelopes with painted door cards and pressed wax seals"],
  ["/assets/gallery-addressed.jpg", "Green and white envelopes addressed by hand, stamped with strawberries and little doors"],
  ["/assets/gallery-sunlit-nook.jpg", "The Sunlit Nook edition laid out: letters, a recipe, a to-do list and mushroom and flower stickers"],
  ["/assets/gallery-lanterns.jpg", "The Land of Lanterns letters, bordered with pumpkins, ghosts and black cats"],
  ["/assets/gallery-mayor-prints.jpg", "Art prints of the Mayor in his lantern-lit street, fanned out in a stack"],
  ["/assets/gallery-red-race.jpg", "The Red Race envelope opened out: the letter, sticker sheets, wax seals, a colouring page and thank-you notes"],
  ["/assets/gallery-butterfly-seal.jpg", "A white envelope closed with a butterfly wax seal, held over a pot of yellow chrysanthemums"],
  ["/assets/gallery-packing.jpg", "Coloured paper envelopes, handwritten notes, sunflower stickers and sticker books laid out for packing"],
  ["/assets/gallery-sketchbook.jpg", "A sketchbook open to a drawing of Iris in her yellow cardigan, propped up on a desk"],
];

/* This month's three. They stand together on one baseline — the heights differ
 * on purpose, they are different people — and carry nothing but their names:
 * the letter is where they get to speak. */
const FOLK = [
  ["/assets/mayor-folk.png", "Mr. Drumstring, a ghost in a top hat and green coat wearing a Mayor's rosette", "33%", "clamp(168px,27vw,320px)"],
  ["/assets/witch.png", "Martha, a ghost in a wide hat and ribboned skirts carrying a book and a satchel", "30%", "clamp(180px,29vw,344px)"],
  ["/assets/moondog.png", "Mistling, a cream-and-blue hound with flowering branches for antlers and a moon charm", "31%", "clamp(150px,24vw,284px)"],
];

const FOLK_NAMES = ["Mr. Drumstring", "Martha", "Mistling"];

const NAV = [
  ["#meet", "Meet Iris"],
  ["#inside", "What's inside"],
  ["#gallery", "The post, photographed"],
  ["#folk", "Who you'll meet"],
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
const tile = css(
  "margin:0;border-radius:var(--radius-md);overflow:hidden;background:var(--color-neutral-200);box-shadow:var(--shadow-sm)"
);

export default function TheLittleDoorPost() {
  return (
    <div style={css("background:var(--color-bg);color:var(--color-text);position:relative;overflow:hidden")}>
      {/* ── header ─────────────────────────────────────────────────────── */}
      <header
        style={css(
          "position:sticky;top:0;z-index:60;background:color-mix(in srgb, var(--color-bg) 92%, transparent);backdrop-filter:blur(9px);border-bottom:1px solid var(--color-neutral-300)"
        )}
      >
        <div
          style={css(
            "width:min(1180px,100%);margin:0 auto;display:flex;align-items:center;flex-wrap:wrap;gap:8px clamp(10px,2vw,22px);padding:8px clamp(14px,4vw,40px)"
          )}
        >
          <a href="/" style={css("display:flex;align-items:center;gap:10px;margin-right:auto;text-decoration:none;color:var(--color-text)")}>
            <img
              src="/assets/logo-round.png"
              alt=""
              style={css(
                "width:clamp(36px,8vw,44px);height:clamp(36px,8vw,44px);border-radius:50%;object-fit:cover;flex:none;box-shadow:var(--shadow-sm)"
              )}
            />
            <span
              style={css(
                "font-family:var(--font-heading);font-weight:600;font-size:clamp(16px,3.6vw,20px);line-height:1.1;letter-spacing:.02em;white-space:nowrap"
              )}
            >
              The Little Door Post
            </span>
          </a>
          <a className="btn btn-primary" href="#subscribe" style={css("padding:10px 20px;font-size:14px;white-space:nowrap;order:2")}>
            Receive a letter
          </a>
          {/* Its own row, so the brand and the one action never have to compete
            * for width on a phone. */}
          <nav style={css("order:3;flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px 18px;padding:2px 0 4px")}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={css("font-size:14px;text-decoration:none;color:var(--color-neutral-800);white-space:nowrap")}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

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
          Every month, Iris finds a new door.
          <br />
          Every month, she sends a letter home.
        </p>

        <p
          style={css(
            "position:relative;max-width:46ch;margin:clamp(14px,2.4vh,22px) 0 0;font-size:clamp(15px,2vw,17px);line-height:1.72;color:var(--color-neutral-700);text-wrap:pretty;animation:ldp-rise 1.1s .6s cubic-bezier(.2,.7,.2,1) both"
          )}
        >
          Eight printed pieces — letters, a zine, stickers, an art print — sealed into one envelope
          and posted to your letterbox. Anywhere in India.
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
          <span>Addressed by hand</span>
          <span style={css("width:5px;height:5px;border-radius:50%;background:#d98f8a")} />
          <span>Printed on real paper</span>
          <span style={css("width:5px;height:5px;border-radius:50%;background:var(--color-accent-2-400)")} />
          <span>Within India, in about a week</span>
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
              She travels through doors, one to the next, and writes to strangers about the towns she
              wanders into. Some are strange. Some are soft. Some hum with music at midnight. Some
              smell of buttered toast.
            </p>
            <p style={css("font-size:clamp(16px,1.8vw,18px);line-height:1.85;margin:14px 0 0;text-wrap:pretty")}>
              Whatever she finds, she posts home: written out, printed, folded and sealed by one pair
              of hands.
            </p>
            <p
              style={css(
                "font-family:var(--font-heading);font-style:italic;font-weight:400;font-size:clamp(21px,3vw,29px);line-height:1.34;margin:clamp(22px,3.6vh,32px) 0 0;padding-left:18px;border-left:2px solid var(--color-accent-400);color:var(--color-accent-300);text-wrap:pretty"
              )}
            >
              She has never once run out of doors.
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
        <div style={css("width:min(1120px,100%);margin:0 auto")}>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:clamp(24px,4.5vw,56px);align-items:center")}>
            <div>
              <div style={kicker}>
                <span style={rule} />
                Nine pieces
              </div>
              <h2 style={h2}>What&rsquo;s in the envelope</h2>
              <p style={{ ...lede, maxWidth: "46ch" }}>
                The same eight pieces every month — only the writing and the artwork change — and a
                Wanderland Passport in your very first envelope. No mystery items, nothing edible,
                nothing you haven&rsquo;t been shown.
              </p>
            </div>
            <div style={css("display:flex;justify-content:center")}>
              <img
                src="/assets/envelope-white.png"
                alt="A white envelope with a painted blue door, wildflowers, butterflies and a pearl wax seal"
                style={css("width:min(470px,92%);filter:drop-shadow(0 20px 32px rgba(58,49,40,.18));animation:ldp-float 9s ease-in-out infinite alternate")}
              />
            </div>
          </div>

          <div
            style={css(
              "display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:clamp(12px,1.8vw,18px);margin-top:clamp(30px,5vh,54px)"
            )}
          >
            {ENVELOPE.map(([title, detail], i) => (
              <div
                key={title}
                style={css(
                  "display:flex;flex-direction:column;gap:9px;padding:clamp(16px,2.4vw,22px);border-radius:var(--radius-md);background:var(--color-neutral-100);border:1px solid var(--color-neutral-300);box-shadow:var(--shadow-sm)"
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
                <p style={css("margin:0;font-size:14px;line-height:1.62;color:var(--color-neutral-700);text-wrap:pretty")}>{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── the photographs ────────────────────────────────────────────── */}
      <section id="gallery" style={css("position:relative;padding:clamp(52px,8vh,104px) clamp(16px,5vw,44px);background:var(--color-accent-100)")}>
        <div style={css("width:min(1120px,100%);margin:0 auto")}>
          <div style={css("max-width:48ch")}>
            <div style={kicker}>
              <span style={rule} />
              Photographed at the desk
            </div>
            <h2 style={h2}>The post, as it really looks</h2>
            <p style={lede}>
              Envelopes printed, sealed and addressed by hand, and the paper that goes inside them.
              These are photographs of real post going out.
            </p>
          </div>

          {/* Five across when there is room, two on a phone, and never a
            * fractional column: the track floor is the width five would take,
            * clamped so it cannot fall below a thumbnail people can see. */}
          <div
            style={css(
              "display:grid;grid-template-columns:repeat(auto-fill,minmax(max(120px, min(45%, calc((100% - 64px) / 5))),1fr));gap:16px;margin-top:clamp(26px,4.4vh,48px)"
            )}
          >
            {GALLERY.map(([src, alt]) => (
              <figure key={src} style={tile}>
                <img src={src} alt={alt} style={css("width:100%;aspect-ratio:3/4;object-fit:cover")} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── who you'll meet ────────────────────────────────────────────── */}
      <section id="folk" style={css("position:relative;padding:clamp(58px,9vh,118px) clamp(20px,5vw,44px)")}>
        <div style={css("width:min(1120px,100%);margin:0 auto")}>
          <div style={css("max-width:50ch")}>
            <div style={kicker}>
              <span style={rule} />
              This month&rsquo;s post
            </div>
            <h2 style={h2}>Who you&rsquo;ll meet this month</h2>
            <p style={lede}>
              Every envelope carries a second letter, written by somebody Iris met on the other side
              of the door. This month it is one of these three.
            </p>
          </div>

          <div style={css("position:relative;margin-top:clamp(26px,4.4vh,48px)")}>
            <div style={css("display:flex;align-items:flex-end;justify-content:center;gap:clamp(2px,2.5vw,34px)")}>
              {FOLK.map(([src, alt, width, height]) => (
                <img
                  key={src}
                  src={src}
                  alt={alt}
                  style={css(
                    `width:${width};height:${height};object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 16px 18px rgba(58,49,40,.16))`
                  )}
                />
              ))}
            </div>
            {/* The ground they stand on. */}
            <div
              style={css(
                "height:1px;background:linear-gradient(90deg, transparent 0%, var(--color-neutral-400) 18%, var(--color-neutral-400) 82%, transparent 100%)"
              )}
            />
          </div>

          <div
            style={css(
              "display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(2px,2.5vw,34px);margin-top:clamp(14px,2.4vh,22px);text-align:center"
            )}
          >
            {FOLK_NAMES.map((name) => (
              <h3
                key={name}
                style={css(
                  "font-family:var(--font-heading);font-weight:600;font-size:clamp(18px,2.6vw,27px);line-height:1.16;margin:0;color:var(--color-accent-800);text-wrap:balance"
                )}
              >
                {name}
              </h3>
            ))}
          </div>
        </div>
      </section>

      {/* ── sign up ────────────────────────────────────────────────────── */}
      <section id="subscribe" style={css("position:relative;padding:clamp(52px,8vh,104px) clamp(14px,4vw,44px);overflow:hidden")}>
        <div style={css("position:absolute;inset:0;pointer-events:none")}>
          <img
            src="/assets/gallery-green-seals.jpg"
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
              Choose a subscription, tell Iris where to post it, and your address goes into this
              month&rsquo;s batch.
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
