/*  Door 1 — The Red Race.
 *
 *  The first letter Iris posted, republished on its own page. It is not on the
 *  landing page on purpose: it is a long read, and a reader who wants it will
 *  follow a link to it rather than scroll past it on the way to signing up.
 *
 *  The text is the letter as it went out in the envelope, unedited.
 */
import React from "react";
import { css } from "./css.js";
import SiteFooter from "./SiteFooter.jsx";

const body = css("font-size:clamp(16px,2.2vw,18px);line-height:1.92;margin:18px 0 0;text-wrap:pretty");

export default function RedRace() {
  return (
    <div style={css("background:var(--color-bg);color:var(--color-text)")}>
      <header
        style={css(
          "position:sticky;top:0;z-index:60;background:color-mix(in srgb, var(--color-bg) 92%, transparent);backdrop-filter:blur(9px);border-bottom:1px solid var(--color-neutral-300)"
        )}
      >
        <div style={css("width:min(1180px,100%);margin:0 auto;display:flex;align-items:center;gap:12px;padding:10px clamp(14px,4vw,40px)")}>
          <a href="/" style={css("display:flex;align-items:center;gap:10px;margin-right:auto;text-decoration:none;color:var(--color-text)")}>
            <img
              src="/assets/logo-round.png"
              alt=""
              style={css("width:clamp(34px,7vw,42px);height:clamp(34px,7vw,42px);border-radius:50%;object-fit:cover;flex:none;box-shadow:var(--shadow-sm)")}
            />
            <span style={css("font-family:var(--font-heading);font-weight:600;font-size:clamp(15px,3.4vw,20px);line-height:1.1;letter-spacing:.02em")}>
              The Little Door Post
            </span>
          </a>
          <a className="btn btn-primary" href="/#subscribe" style={css("padding:10px 18px;font-size:14px;white-space:nowrap")}>
            Receive a letter
          </a>
        </div>
      </header>

      <section style={css("padding:clamp(34px,6vh,72px) clamp(16px,4vw,44px) clamp(16px,3vh,30px)")}>
        <div style={css("width:min(760px,100%);margin:0 auto;text-align:center;animation:ldp-rise .9s both")}>
          <div style={css("display:inline-flex;align-items:center;gap:10px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--color-accent-700)")}>
            <span style={css("width:22px;height:1px;background:var(--color-accent-500)")} />
            Door 1 &middot; The first letter
            <span style={css("width:22px;height:1px;background:var(--color-accent-500)")} />
          </div>
          {/* The letterhead colour, which is the one red in the whole site. */}
          <h1
            style={css(
              "font-family:var(--font-heading);font-weight:700;font-size:clamp(40px,11vw,86px);line-height:.94;margin:clamp(12px,2vh,20px) 0 0;letter-spacing:.01em;color:#a8402f"
            )}
          >
            THE
            <br />
            <span style={css("font-style:italic;font-weight:400;font-size:.78em;letter-spacing:0")}>Red Race</span>
          </h1>
          <p
            style={css(
              "max-width:38ch;margin:clamp(16px,2.6vh,26px) auto 0;font-family:var(--font-heading);font-style:italic;font-size:clamp(18px,3.4vw,25px);line-height:1.4;color:var(--color-accent-800);text-wrap:pretty"
            )}
          >
            The letter that started it — written from a kingdom that painted its roses red.
          </p>
        </div>
      </section>

      <section style={css("padding:0 clamp(12px,4vw,44px) clamp(40px,7vh,90px)")}>
        <article
          style={css(
            "width:min(720px,100%);margin:0 auto;padding:clamp(22px,6vw,60px) clamp(18px,6vw,64px);background:var(--color-neutral-100);border:1px solid var(--color-neutral-300);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg)"
          )}
        >
          <p style={css("margin:0;font-family:var(--font-heading);font-weight:600;font-size:clamp(19px,3.4vw,24px);color:var(--color-accent-800)")}>
            Dearest Reader
          </p>

          <p style={{ ...body, marginTop: "clamp(18px,3vh,26px)" }}>I jumped down the rabbit hole.</p>

          <p style={body}>
            At the bottom, I found a hall full of doors — some shiny, some unadorned, some carved
            from old wood, some cast in cold brass. One, I remember, gave off the faint smell of
            cinnamon. The one that pulled at me most was tall and magnificent: a deep blue door with
            a golden latch that gleamed like it had a secret. Little did I know how unmagnificent it
            would be on the other side.
          </p>

          <p
            style={css(
              "font-family:var(--font-heading);font-style:italic;font-weight:400;font-size:clamp(21px,3.6vw,29px);line-height:1.38;margin:clamp(22px,3.4vh,32px) 0;padding-left:18px;border-left:2px solid #c0705f;color:#a8402f;text-wrap:pretty"
            )}
          >
            The door opened into The Red Race — a kingdom I would come to know far too well.
          </p>

          <p style={body}>
            At first glance, it was breathtaking. Marble floors that echoed under every step. A
            garden of roses so red they looked as though they&rsquo;d been dipped in wine. But if you
            looked closely, you could see the roses had been painted. Someone had spent all night
            with a brush and a bucket, because the real ones underneath were white. That, I would
            learn, was The Red Race&rsquo;s greatest talent: painting things to look like other
            things.
          </p>

          <p style={body}>
            You&rsquo;d have felt it the moment you walked in — the noise. Somewhere, someone was
            shouting that a server had crashed (a server, in case you&rsquo;re not one of the cards,
            is one of those humming machines hidden away that keeps the whole kingdom quietly
            running — until it very loudly doesn&rsquo;t). Presentations dragged on to sleep-heavy
            eyes. Keyboards clicked like new background music. Deadlines trumpeted from every corner.
          </p>

          <p style={body}>
            The kingdom ran on cards. Everyone was one — spades, clubs, diamonds, hearts. Some had
            been there so long they&rsquo;d forgotten they&rsquo;d ever been anything else. And you
            know how it starts, don&rsquo;t you? Slowly. With rewards. Little glimmers of praise that
            made you think, maybe this isn&rsquo;t so bad. But behind them lay burnout, resentment,
            and the constant company of fake smiles and cheerful pings — &ldquo;hello, how may I help
            you?&rdquo; — on Teams. I hope you never have to meet this Teams. It is anything but a
            team. It is really just you, quietly doing all the work.
          </p>

          <div style={css("display:flex;align-items:center;gap:14px;margin:clamp(26px,4vh,40px) 0")}>
            <span style={css("flex:1;height:1px;background:var(--color-neutral-300)")} />
            <span style={css("font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--color-neutral-500)")}>
              Page two
            </span>
            <span style={css("flex:1;height:1px;background:var(--color-neutral-300)")} />
          </div>

          <p style={{ ...body, margin: 0 }}>
            Days passed. I was surviving, and somewhere along the way I had started calling it
            living. Here&rsquo;s the thing about The Red Race: if you ever did something wrong, the
            Red Queen would shout your name, followed by &ldquo;Off with your head!&rdquo; I thought
            it was just a saying. Until Halloween came — and while everyone else was busy with
            costumes and candy, she cried it ten, maybe fifteen times over. Just like that, ten or
            fifteen heads were gone.
          </p>

          <p style={body}>
            I began to wonder if a day would come when I&rsquo;d hear her shout &ldquo;Iris, off with
            your head!&rdquo; — and Iris would simply… be gone.
          </p>

          <p style={body}>
            Well — you must be wondering who Iris is. Forgive me. Where are my manners.
          </p>

          <div
            style={css(
              "display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:clamp(18px,3vw,30px);align-items:center;margin:clamp(22px,3.4vh,34px) 0"
            )}
          >
            <p style={{ ...body, margin: 0 }}>
              I&rsquo;m Iris — though some call me Mushroom-Head, on account of the wild mop of red
              curls I never quite managed to tame. I don&rsquo;t quite remember when it began, but one
              afternoon I saw a rabbit sprinting through the garden, yelling that he&rsquo;d be late,
              he&rsquo;d be late — and something about the way he ran made me follow. That&rsquo;s how
              I ended up here in the first place. Opening that stupid magnificent door, not knowing it
              would turn my whole life into a race.
            </p>
            <img
              src="/assets/iris.webp"
              alt="Iris, red-haired and mid-stride, wheeling her suitcase with letters trailing behind her"
              style={css("width:min(240px,80%);margin:0 auto;filter:drop-shadow(0 14px 22px rgba(58,49,40,.18))")}
            />
          </div>

          <p style={body}>
            Still, every cloud has a silver lining. My sanity-savers: the people who shared my pain
            within these walls, my dearest friend Max, my family, and my crackheads from the world
            above — the ones far away from this stupid, crazy place, keeping the lights on in my
            heart.
          </p>

          <p style={body}>
            But this was no time to untangle any of that. So I did something not many would call wise
            — I fled. I ran, dragging my suitcase behind me — stuffed with loose paper, well-loved
            books, half-used stamps, and one perfectly ripe strawberry I&rsquo;d stolen from the
            Queen&rsquo;s own table (petty, I know).
          </p>

          <p style={body}>
            And now — here I am. Back in the hall of doors. There are so many again, but one is
            quietly drawing me in: a soft yellow door, warm as sunlight through curtains. I might as
            well take the chance and see what world is waiting inside.
          </p>

          <p style={body}>Don&rsquo;t worry — I&rsquo;ll write to you about whatever I find.</p>

          <p style={css("font-size:clamp(15px,2vw,17px);line-height:1.7;margin:clamp(24px,4vh,36px) 0 0;color:var(--color-neutral-700)")}>
            Yours, with papers still in my suitcase,
          </p>
          <p
            style={css(
              "font-family:var(--font-heading);font-style:italic;font-weight:600;font-size:clamp(28px,6vw,42px);line-height:1;margin:8px 0 0;color:var(--color-accent-800)"
            )}
          >
            Iris
          </p>
        </article>
      </section>

      <SiteFooter />
    </div>
  );
}
