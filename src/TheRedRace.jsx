/*  The Red Race — Iris's first letter, as its own page.
 *
 *  Reached at #/the-red-race (see main.jsx). Shares styles.css with the
 *  landing page; everything else here is local.
 */
import React, { useEffect, useRef } from "react";
import { css } from "./css.js";

const STYLE = `@keyframes trr-rise { from { opacity: 0; transform: translateY(26px) } to { opacity: 1; transform: none } }
  @keyframes trr-fade { from { opacity: 0 } to { opacity: 1 } }
  @keyframes trr-seal { 0% { opacity: 0; transform: rotate(-28deg) scale(2.4) } 60% { opacity: 1 } 100% { opacity: 1; transform: rotate(-7deg) scale(1) } }
  @keyframes trr-paint { from { height: 6% } to { height: 88% } }
  @keyframes trr-progress { to { transform: scaleX(1) } }
  .trr-body p { margin: 0 0 1.35em; font-size: clamp(16px, 1.25vw + 12px, 19px); line-height: 1.95;
    text-wrap: pretty; hyphens: auto; }
  .trr-body p:last-child { margin-bottom: 0; }
  .trr-drop::first-letter { float: left; font-family: var(--font-heading); font-weight: 400;
    font-size: 3.6em; line-height: .82; padding: .06em .1em 0 0; color: #b3312f; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .001s !important; animation-delay: 0s !important }
  }`;

/* The letter itself. Edit the prose here — everything else is chrome.
 *   lead  — the opening salutation
 *   drop  — takes the drop cap
 *   quote — set apart, larger, in red */
const LETTER = [
  { kind: "lead", text: "Dearest Reader," },
  {
    kind: "drop",
    text:
      "I jumped down the rabbit hole. At the bottom, I found a hall full of doors — some shiny, some unadorned, some carved from old wood, some cast in cold brass. One, I remember, gave off the faint smell of cinnamon. The one that pulled at me most was tall and magnificent: a deep blue door with a golden latch that gleamed like it had a secret. Little did I know how unmagnificent it would be on the other side.",
  },
  {
    kind: "quote",
    text:
      "The door opened into The Red Race — a kingdom I would come to know far too well.",
  },
  {
    kind: "p",
    text:
      "At first glance, it was breathtaking. Marble floors that echoed under every step. A garden of roses so red they looked as though they’d been dipped in wine. But if you looked closely, you could see the roses had been painted. Someone had spent all night with a brush and a bucket, because the real ones underneath were white. That, I would learn, was The Red Race’s greatest talent: painting things to look like other things.",
  },
  {
    kind: "p",
    text:
      "You’d have felt it the moment you walked in — the noise. Somewhere, someone was shouting that a server had crashed (a server, in case you’re not one of the cards, is one of those humming machines hidden away that keeps the whole kingdom quietly running — until it very loudly doesn’t). Presentations dragged on to sleep-heavy eyes. Keyboards clicked like new background music. Deadlines trumpeted from every corner.",
  },
  {
    kind: "p",
    text:
      "The kingdom ran on cards. Everyone was one — spades, clubs, diamonds, hearts. Some had been there so long they’d forgotten they’d ever been anything else. And you know how it starts, don’t you? Slowly. With rewards. Little glimmers of praise that made you think, maybe this isn’t so bad. But behind them lay burnout, resentment, and the constant company of fake smiles and cheerful pings — “hello, how may I help you?” — on Teams. I hope you never have to meet this Teams. It is anything but a team. It is really just you, quietly doing all the work.",
  },
  {
    kind: "p",
    text:
      "Still, every cloud has a silver lining. My sanity-savers: the people who shared my pain within these walls, my dearest friend Max, my family, and my crackheads from the world above — the ones far away from this stupid, crazy place, keeping the lights on in my heart.",
  },
  {
    kind: "p",
    text:
      "Days passed. I was surviving, and somewhere along the way I had started calling it living. Here’s the thing about The Red Race: if you ever did something wrong, the Red Queen would shout your name, followed by “Off with your head!” I thought it was just a saying. Until Halloween came — and while everyone else was busy with costumes and candy, she cried it ten, maybe fifteen times over. Just like that, ten or fifteen heads were gone.",
  },
  {
    kind: "p",
    text:
      "I began to wonder if a day would come when I’d hear her shout “Iris, off with your head!” — and Iris would simply… be gone.",
  },
  {
    kind: "p",
    text: "Well — you must be wondering who Iris is. Forgive me. Where are my manners.",
  },
  {
    kind: "p",
    text:
      "I’m Iris — though some call me Mushroom-Head, on account of the wild mop of red curls I never quite managed to tame. I don’t quite remember when it began, but one afternoon I saw a rabbit sprinting through the garden, yelling that he’d be late, he’d be late — and something about the way he ran made me follow. That’s how I ended up here in the first place. Opening that stupid magnificent door, not knowing it would turn my whole life into a race.",
  },
  {
    kind: "p",
    text:
      "But this was no time to untangle any of that. So I did something not many would call wise — I fled. I ran, dragging my suitcase behind me — stuffed with loose paper, well-loved books, half-used stamps, and one perfectly ripe strawberry I’d stolen from the Queen’s own table (petty, I know).",
  },
  {
    kind: "p",
    text:
      "And now — here I am. Back in the hall of doors. There are so many again, but one is quietly drawing me in: a soft yellow door, warm as sunlight through curtains. I might as well take the chance and see what world is waiting inside.",
  },
  { kind: "p", text: "Don’t worry — I’ll write to you about whatever I find." },
];

/* The Queen's roses: white underneath, red on top, and the paint creeps up the
 * bloom as you scroll past. */
const RoseRow = () => (
  <div
    aria-hidden="true"
    style={css(
      "display:flex;justify-content:center;align-items:flex-end;gap:clamp(10px,2.4vw,20px);margin:clamp(26px,4.4vh,40px) 0 0"
    )}
  >
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        style={css(
          "position:relative;width:clamp(14px,3vw,22px);aspect-ratio:1;border-radius:50%;overflow:hidden;background:#f6f4ef;border:1px solid " +
            (i % 2 ? "#d6cfc2" : "#c9b9a8")
        )}
      >
        <div
          style={css(
            "position:absolute;left:0;right:0;bottom:0;height:88%;background:#b3312f;animation-name:trr-paint;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-timeline:view();animation-range:entry 10% cover 45%;animation-delay:" +
              i * 0.06 +
              "s"
          )}
        ></div>
      </div>
    ))}
  </div>
);

export default function TheRedRace() {
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (headerRef.current) {
        headerRef.current.style.boxShadow = window.scrollY > 12 ? "var(--shadow-sm)" : "none";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const paragraph = (item, index) => {
    if (item.kind === "lead") {
      return (
        <p
          key={index}
          style={css(
            "font-family:var(--font-heading);font-style:italic;font-size:clamp(24px,3.6vw,32px);line-height:1.3;margin:0 0 1.1em;color:var(--color-text)"
          )}
        >
          {item.text}
        </p>
      );
    }
    if (item.kind === "quote") {
      return (
        <p
          key={index}
          style={css(
            "font-family:var(--font-heading);font-style:italic;font-size:clamp(22px,3.4vw,30px);line-height:1.45;color:#b3312f;margin:clamp(26px,4vh,38px) 0;padding-left:clamp(16px,3vw,26px);border-left:2px solid #b3312f;text-wrap:pretty"
          )}
        >
          {item.text}
        </p>
      );
    }
    return (
      <p key={index} className={item.kind === "drop" ? "trr-drop" : undefined}>
        {item.text}
      </p>
    );
  };

  return (
    <>
      <style>{STYLE}</style>
      <div
        style={css(
          "background:var(--color-bg);color:var(--color-text);font-family:var(--font-body);min-height:100svh"
        )}
      >
        <div
          style={css(
            "position:fixed;top:0;left:0;right:0;height:2px;background:#b3312f;transform:scaleX(0);transform-origin:0 50%;z-index:60;animation-name:trr-progress;animation-timing-function:linear;animation-fill-mode:both;animation-timeline:scroll(root)"
          )}
        ></div>

        <header
          ref={headerRef}
          style={css(
            "position:sticky;top:0;z-index:55;display:flex;align-items:center;gap:clamp(12px,3vw,26px);padding:11px clamp(16px,4vw,44px);background:color-mix(in srgb, var(--color-bg) 92%, transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--color-divider);transition:box-shadow .4s"
          )}
        >
          <a
            href="#/"
            style={css(
              "font-family:var(--font-heading);font-size:clamp(15px,3.4vw,19px);letter-spacing:.02em;margin-right:auto;text-decoration:none;color:var(--color-text);white-space:nowrap"
            )}
          >
            &larr; The Little Door Post
          </a>
          <a className="btn btn-primary" href="#/#subscribe" style={css("white-space:nowrap")}>
            Receive a letter
          </a>
        </header>

        {/* — the cover — */}
        <section
          style={css(
            "position:relative;overflow:hidden;padding:clamp(52px,9vh,110px) clamp(20px,5vw,40px) clamp(34px,6vh,60px);text-align:center"
          )}
        >
          <div
            style={css(
              "position:absolute;left:50%;top:44%;width:min(680px,110vw);aspect-ratio:1;transform:translate(-50%,-50%);background:radial-gradient(circle, color-mix(in srgb, #b3312f 15%, transparent) 0%, transparent 64%);pointer-events:none"
            )}
          ></div>

          <div
            style={css(
              "position:relative;width:min(760px,100%);margin:0 auto;animation-name:trr-rise;animation-duration:1s;animation-timing-function:cubic-bezier(.2,.7,.2,1);animation-fill-mode:both"
            )}
          >
            <div
              style={css(
                "font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 55%, transparent)"
              )}
            >
              Letter No. 001 &middot; From the hall of doors
            </div>

            <h1
              style={css(
                "font-family:var(--font-heading);font-weight:400;font-style:italic;font-size:clamp(52px,12vw,110px);line-height:1;letter-spacing:-.01em;color:#b3312f;margin:clamp(12px,2vh,20px) 0 0"
              )}
            >
              The Red Race
            </h1>

            <p
              style={css(
                "max-width:38ch;margin:clamp(18px,3vh,28px) auto 0;font-size:clamp(15px,1.8vw,17px);line-height:1.8;text-wrap:pretty;color:color-mix(in srgb, var(--color-text) 78%, transparent)"
              )}
            >
              A kingdom of painted roses, a queen with a temper, and a girl who finally ran. This is
              the letter Iris posted on her way out.
            </p>

            <RoseRow />
          </div>
        </section>

        {/* — the letter — */}
        <section style={css("padding:0 clamp(16px,5vw,40px) clamp(48px,8vh,90px)")}>
          <article
            style={css(
              "position:relative;width:min(720px,100%);margin:0 auto;padding:clamp(30px,6vw,72px) clamp(22px,5vw,64px) clamp(56px,8vw,86px);background:var(--color-neutral-100);border:1px solid var(--color-divider);border-radius:var(--radius-md);box-shadow:var(--shadow-md);animation-name:trr-fade;animation-duration:1.1s;animation-delay:.25s;animation-fill-mode:both"
            )}
          >
            {/* postmark, top right */}
            <div
              aria-hidden="true"
              style={css(
                "position:absolute;right:clamp(18px,4vw,44px);top:clamp(18px,4vw,40px);width:clamp(62px,12vw,86px);aspect-ratio:1;border:1px solid color-mix(in srgb, #b3312f 45%, transparent);border-radius:50%;display:grid;place-items:center;text-align:center;color:color-mix(in srgb, #b3312f 70%, transparent);transform:rotate(-9deg);pointer-events:none"
              )}
            >
              <div>
                <div style={css("font-size:8px;letter-spacing:.14em;text-transform:uppercase")}>
                  Posted
                </div>
                <div
                  style={css(
                    "font-family:var(--font-heading);font-style:italic;font-size:clamp(15px,3vw,19px);line-height:1.1"
                  )}
                >
                  Wanderland
                </div>
                <div
                  style={css(
                    "font-size:8px;letter-spacing:.14em;text-transform:uppercase;font-feature-settings:'tnum'"
                  )}
                >
                  No. 001
                </div>
              </div>
            </div>

            <div className="trr-body" style={css("max-width:62ch")}>
              {LETTER.map(paragraph)}
            </div>

            <div
              style={css(
                "display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px;margin-top:clamp(34px,5vh,52px);padding-top:clamp(24px,4vh,36px);border-top:1px solid var(--color-divider)"
              )}
            >
              <div>
                <div
                  style={css(
                    "font-size:clamp(15px,1.8vw,17px);line-height:1.8;color:color-mix(in srgb, var(--color-text) 78%, transparent)"
                  )}
                >
                  Yours, with papers still in my suitcase,
                </div>
                <div
                  style={css(
                    "font-family:var(--font-heading);font-style:italic;font-size:clamp(34px,6.5vw,52px);line-height:1.1;margin-top:6px;color:#b3312f"
                  )}
                >
                  Iris
                </div>
              </div>

              <div
                aria-hidden="true"
                style={css(
                  "flex:none;width:clamp(62px,14vw,84px);aspect-ratio:1;border-radius:50%;background:#b3312f;color:var(--color-neutral-100);display:grid;place-items:center;box-shadow:var(--shadow-md);animation-name:trr-seal;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,1.5,.5,1);animation-timeline:view();animation-range:entry 20% entry 85%"
                )}
              >
                <div
                  style={css(
                    "width:74%;height:74%;border:1px solid color-mix(in srgb, #fff 55%, transparent);border-radius:50%;display:grid;place-items:center;font-family:var(--font-heading);font-style:italic;font-size:clamp(19px,4.4vw,25px)"
                  )}
                >
                  LD
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* — what happens next — */}
        <section
          style={css(
            "position:relative;padding:clamp(56px,9vh,110px) clamp(20px,5vw,40px);border-top:1px solid var(--color-divider);background:color-mix(in srgb, var(--color-surface) 55%, var(--color-bg));text-align:center"
          )}
        >
          <div style={css("width:min(620px,100%);margin:0 auto")}>
            <div
              style={css(
                "font-family:var(--font-heading);font-style:italic;font-size:clamp(26px,4.6vw,38px);line-height:1.3;text-wrap:pretty"
              )}
            >
              Next month, Iris opens the soft yellow door.
            </div>
            <p
              style={css(
                "margin:clamp(16px,2.6vh,24px) 0 0;font-size:clamp(15px,1.8vw,17px);line-height:1.8;text-wrap:pretty;color:color-mix(in srgb, var(--color-text) 72%, transparent)"
              )}
            >
              Whatever is behind it arrives in your letterbox &mdash; one hand-addressed envelope
              holding her letter, a letter from someone she meets there, two stickers, an art print
              and an activity sheet.
            </p>
            <div
              style={css(
                "display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:clamp(24px,4vh,36px)"
              )}
            >
              <a
                className="btn btn-primary"
                href="#/#subscribe"
                style={css("padding:12px 24px;font-size:15px")}
              >
                Receive a letter
              </a>
              <a
                className="btn btn-secondary"
                href="#/"
                style={css("padding:12px 24px;font-size:15px")}
              >
                Back to the door
              </a>
            </div>
          </div>
        </section>

        <footer
          style={css(
            "border-top:1px solid var(--color-divider);padding:clamp(30px,5vh,52px) clamp(20px,5vw,40px)"
          )}
        >
          <div
            style={css(
              "width:min(1080px,100%);margin:0 auto;display:flex;flex-wrap:wrap;gap:16px 32px;align-items:baseline;justify-content:space-between"
            )}
          >
            <a
              href="#/"
              style={css(
                "font-family:var(--font-heading);font-size:clamp(17px,3vw,21px);text-decoration:none;color:var(--color-text)"
              )}
            >
              The Little Door Post
            </a>
            <div
              style={css(
                "font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 52%, transparent)"
              )}
            >
              Letter No. 001 &middot; The Red Race
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
