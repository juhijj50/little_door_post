/*  "Not in India?" — the waiting list for posting abroad.
 *
 *  Posting abroad is not open. The export process is still being set up, the
 *  international rows in the plans table are inactive, and the backend refuses
 *  an international sign-up outright. So this section sells nothing and takes
 *  no address: it records a handle to write back to and a country to count,
 *  which is also what decides which country is worth opening first.
 *
 *  Everything it states — the indicative price, how long the paperwork is
 *  expected to take, the countries that are not being opened — comes from
 *  `business.international`, so the page and the policy pages cannot drift
 *  apart on any of it.
 */
import React, { useState } from "react";
import { css } from "./css.js";
import { business } from "./business.js";
import { registerInternationalInterest } from "./api.js";

const { international: intl } = business;

const label = css(
  "display:block;font-size:12px;margin-bottom:5px;color:var(--color-neutral-700)"
);

export default function GlobalWaitlist() {
  const [values, setValues] = useState({ instagram: "", country: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrs, setFieldErrs] = useState({});
  const [done, setDone] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (fieldErrs[name]) setFieldErrs((f) => ({ ...f, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setFieldErrs({});
    try {
      const result = await registerInternationalInterest({
        instagram: values.instagram.trim(),
        country: values.country.trim(),
        email: values.email.trim() || null,
      });
      setDone(result);
    } catch (err) {
      setFieldErrs(err.fields || {});
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      id="global"
      style={css(
        "position:relative;padding:clamp(58px,9vh,118px) clamp(20px,5vw,44px);border-top:1px solid var(--color-neutral-300);background:var(--color-neutral-200)"
      )}
    >
      <div
        style={css(
          "width:min(1120px,100%);margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:clamp(28px,5vw,64px);align-items:start"
        )}
      >
        {/* ── the explanation ──────────────────────────────────────────── */}
        <div style={css("max-width:52ch")}>
          <div
            style={css(
              "display:inline-flex;align-items:center;gap:8px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--color-accent-700)"
            )}
          >
            <span style={css("width:26px;height:1px;background:var(--color-accent-500)")} />
            Outside India
          </div>

          <h2
            style={css(
              "font-family:var(--font-heading);font-weight:600;font-size:clamp(30px,5vw,50px);line-height:1.06;margin:clamp(12px,2vh,18px) 0 0;color:var(--color-accent-800);text-wrap:pretty"
            )}
          >
            Not in India? Not yet &mdash; but soon.
          </h2>

          <p
            style={css(
              "font-size:clamp(15px,1.8vw,17px);line-height:1.78;margin:clamp(12px,2.2vh,20px) 0 0;color:var(--color-neutral-700);text-wrap:pretty"
            )}
          >
            Iris posts across India today, and nowhere else. Sending paper over a border needs an
            export process set up first, and{" "}
            <strong>that is the part being worked on right now.</strong>
          </p>
          <p
            style={css(
              "font-size:clamp(15px,1.8vw,17px);line-height:1.78;margin:var(--space-3) 0 0;color:var(--color-neutral-700);text-wrap:pretty"
            )}
          >
            If it comes through, everyone on this list hears from us{" "}
            <strong>within about {intl.setupDays} days.</strong> If it does not, you will hear that
            too &mdash; we would rather tell you plainly than leave you refreshing the page.
          </p>

          <div
            style={css(
              "margin-top:clamp(20px,3.4vh,30px);padding:var(--space-4);border-radius:var(--radius-md);border:1px solid var(--color-neutral-300);background:var(--color-neutral-100)"
            )}
          >
            <div
              style={css(
                "font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-600)"
              )}
            >
              What it will cost
            </div>
            <div
              style={css(
                "font-family:var(--font-heading);font-weight:600;font-size:clamp(26px,4.2vw,34px);line-height:1.1;margin-top:6px;color:var(--color-accent-800)"
              )}
            >
              ${intl.indicativeUsdPerLetter} a letter
            </div>
            <p
              style={css(
                "font-size:13px;line-height:1.7;margin:10px 0 0;color:var(--color-neutral-700)"
              )}
            >
              One envelope of {business.piecesPerMonth} printed pieces, posted to you, with the
              international postage in the price. It is more than the India price because the
              postage is.
            </p>
            <p
              style={css(
                "font-size:13px;line-height:1.7;margin:10px 0 0;color:var(--color-neutral-700)"
              )}
            >
              <strong>An estimate, not a final price</strong> &mdash; it cannot be fixed until the
              export process is. Any customs duty or import tax your own country charges is
              separate and is set by them, not by us:{" "}
              <a href="/shipping">how that works</a>.
            </p>
          </div>
        </div>

        {/* ── the form ─────────────────────────────────────────────────── */}
        <div
          style={css(
            "padding:clamp(22px,3.6vw,34px);border-radius:var(--radius-lg);border:1px solid var(--color-neutral-300);background:var(--color-surface);box-shadow:var(--shadow-sm)"
          )}
        >
          {done ? (
            <div>
              <h3
                style={css(
                  "font-family:var(--font-heading);font-weight:600;font-size:clamp(21px,3vw,26px);line-height:1.2;margin:0;color:var(--color-accent-800)"
                )}
              >
                {done.already_on_list ? "You were already on the list." : "You are on the list."}
              </h3>
              <hr className="hr" />
              <p style={css("font-size:15px;line-height:1.8;margin:0 0 var(--space-3)")}>
                {done.already_on_list
                  ? `We had @${done.instagram} down already — your country is noted as ${done.country}, and nothing has been added twice.`
                  : `@${done.instagram}, in ${done.country}. Iris will write to you the moment posting to your country is possible.`}
              </p>
              <p
                style={css(
                  "font-size:13px;line-height:1.7;margin:0;color:var(--color-neutral-700)"
                )}
              >
                Nothing has been charged and no address has been taken &mdash; there is nothing to
                pay for yet. In the meantime the letters are on Instagram, at{" "}
                <a
                  href={`https://instagram.com/${business.instagram}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  @{business.instagram}
                </a>
                .
              </p>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setDone(null);
                  setValues({ instagram: "", country: "", email: "" });
                }}
                style={css("margin-top:var(--space-4)")}
              >
                Add someone else
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate style={css("display:flex;flex-direction:column;gap:var(--space-3)")}>
              <h3
                style={css(
                  "font-family:var(--font-heading);font-weight:600;font-size:clamp(21px,3vw,26px);line-height:1.2;margin:0;color:var(--color-accent-800)"
                )}
              >
                Tell me when it opens
              </h3>
              <p
                style={css(
                  "font-size:13px;line-height:1.7;margin:0;color:var(--color-neutral-700)"
                )}
              >
                Two things, and no address &mdash; there is nothing to post yet.
              </p>

              <div className="field">
                <label htmlFor="ldp-gw-insta" style={label}>
                  Your Instagram
                </label>
                <input
                  className="input"
                  id="ldp-gw-insta"
                  name="instagram"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="@yourhandle"
                  value={values.instagram}
                  onChange={onChange}
                />
                {fieldErrs.instagram && (
                  <div style={css("font-size:11px;line-height:1.5;margin-top:4px;color:#b3312f")}>
                    {fieldErrs.instagram}
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="ldp-gw-country" style={label}>
                  Which country are you in?
                </label>
                <input
                  className="input"
                  id="ldp-gw-country"
                  name="country"
                  type="text"
                  required
                  autoComplete="country-name"
                  placeholder="Singapore"
                  value={values.country}
                  onChange={onChange}
                />
                {fieldErrs.country ? (
                  <div style={css("font-size:11px;line-height:1.5;margin-top:4px;color:#b3312f")}>
                    {fieldErrs.country}
                  </div>
                ) : (
                  <div
                    style={css(
                      "font-size:11px;line-height:1.5;margin-top:4px;color:var(--color-neutral-600)"
                    )}
                  >
                    It decides which country we open first &mdash; the ones with the most readers
                    waiting go first.
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="ldp-gw-email" style={label}>
                  Email
                  <span style={css("opacity:.65;font-style:italic")}> &middot; optional</span>
                </label>
                <input
                  className="input"
                  id="ldp-gw-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@somewhere.com"
                  value={values.email}
                  onChange={onChange}
                />
                {fieldErrs.email ? (
                  <div style={css("font-size:11px;line-height:1.5;margin-top:4px;color:#b3312f")}>
                    {fieldErrs.email}
                  </div>
                ) : (
                  <div
                    style={css(
                      "font-size:11px;line-height:1.5;margin-top:4px;color:var(--color-neutral-600)"
                    )}
                  >
                    Surer than a DM, which lands in a folder nobody checks if you do not follow us.
                  </div>
                )}
              </div>

              {error && (
                <p
                  style={css(
                    "margin:0;padding:10px 13px;font-size:13px;line-height:1.55;border-radius:var(--radius-md);border:1px solid color-mix(in srgb, #b3312f 40%, transparent);color:#8c2523;background:color-mix(in srgb, #b3312f 7%, transparent)"
                  )}
                >
                  {error}
                </p>
              )}

              <button
                className="btn btn-primary btn-block"
                type="submit"
                disabled={busy}
                style={css("padding:13px 22px;font-size:15px;margin-top:var(--space-1)")}
              >
                {busy ? "Just a moment…" : "Notify me"}
              </button>

              <p
                style={css(
                  "font-size:11px;line-height:1.6;margin:0;color:var(--color-neutral-600)"
                )}
              >
                We use this only to tell you when posting to your country opens. Nothing else, and
                never passed on &mdash; see our{" "}
                <a href="/privacy" target="_blank" rel="noreferrer noopener">
                  Privacy Policy
                </a>
                .
              </p>

              {/* Stated here rather than discovered later. Somebody in Dublin
                * joining a list we have decided not to serve is a small
                * unkindness we can avoid with one sentence. */}
              <p
                style={css(
                  "font-size:11px;line-height:1.6;margin:0;padding-top:var(--space-2);border-top:1px solid var(--color-neutral-300);color:var(--color-neutral-600)"
                )}
              >
                One exception, and we would rather say it now: we do not expect to post to{" "}
                {intl.excluded.short}. Consumer law there asks for a returns process we cannot run
                from a two-person workshop in Gujarat &mdash;{" "}
                <a href="/shipping">the reasoning is here</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
