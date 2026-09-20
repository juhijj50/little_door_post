/*  The sign-up flow.
 *
 *    1 plan   →  how many months
 *    2 who    →  name, email, phone, Instagram, birthday
 *    3 where  →  the address it is posted to, and the optional extras
 *    pay      →  Razorpay Checkout
 *    sealed   →  confirmed
 *
 *  One part on screen at a time, each replacing the last in the same panel
 *  rather than being appended below it — three parts open at once made a very
 *  long page on a phone, and the sign-up button walked further down it with
 *  every answer.
 *
 *  Nothing typed is lost by that: every part reads and writes one `values`
 *  object, so a part that is off screen still has its answers. Going back is
 *  free, and offered two ways — the Back button, and the numbered steps along
 *  the top, where any part already completed is a link to it.
 *
 *  India only. Global shipping is being worked out, and until it is, the
 *  backend refuses an international sign-up outright — so the form does not
 *  ask a question it cannot honour. It says so in part three instead.
 *
 *  Payments are switched on by the backend, not here: each sign-up comes back
 *  with a payment block whose `enabled` flag decides between a pay button and a
 *  "not live yet" notice.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { css } from "./css.js";
import { createSubscription, getConfig, loadRazorpayCheckout, verifyPayment } from "./api.js";
import { business } from "./business.js";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi",
  "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const EMPTY = {
  plan_months: 1,
  first_name: "", last_name: "", email: "",
  phone_cc: "+91", phone_number: "", instagram: "", birthdate: "",
  promo_code: "", is_gift: false, gift_message: "",
  address_line1: "", address_line2: "", landmark: "", city: "", state: "", pincode: "",
  interests_note: "",
};

/*  The half-filled form, kept in this browser.
 *
 *  A sign-up asks for a name, a phone number and a full postal address, and
 *  the API it posts to sleeps after fifteen minutes idle. Losing all of that
 *  to a reload, a closed tab or a first attempt that had to be retried is the
 *  kind of small disaster people do not come back from.
 *
 *  It stays in the reader's own browser and is never sent anywhere by this
 *  code — the only thing that posts it is the sign-up they came to make. It is
 *  cleared the moment a sign-up completes, and expires by itself after a week
 *  so an address does not sit in a shared browser indefinitely.
 *
 *  Every call is wrapped: localStorage throws outright in some private modes,
 *  and a draft is a convenience that must never be the reason a form breaks.
 */
const DRAFT_KEY = "ldp.signup.draft.v1";
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const readDraft = () => {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved?.values || Date.now() - (saved.savedAt || 0) > DRAFT_TTL_MS) {
      window.localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    /* Spread over EMPTY rather than trusting what was stored: a draft written
     * by an older version of this form is missing whatever has been added
     * since, and a missing key would make an input uncontrolled. */
    return { values: { ...EMPTY, ...saved.values }, part: saved.part || 1 };
  } catch {
    return null;
  }
};

const writeDraft = (values, part) => {
  try {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ values, part, savedAt: Date.now() })
    );
  } catch {
    /* Full, blocked, or private browsing. Nothing to do and nothing to say —
     * the form works, it simply will not be remembered. */
  }
};

const clearDraft = () => {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* As above. */
  }
};

/*  A payment that has gone through, kept so a reload shows it.
 *
 *  Without this, refreshing the page after paying put an empty sign-up form
 *  back in front of somebody who had just paid — which reads exactly like the
 *  payment did not happen. Only what the confirmation shows is kept: the two
 *  IDs, the amount and the length. No name, no address.
 */
const DONE_KEY = "ldp.signup.done.v1";

const readDone = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(DONE_KEY) || "null");
    if (!saved?.reference || Date.now() - (saved.savedAt || 0) > DRAFT_TTL_MS) {
      window.localStorage.removeItem(DONE_KEY);
      return null;
    }
    return saved;
  } catch {
    return null;
  }
};

const writeDone = (done) => {
  try {
    window.localStorage.setItem(DONE_KEY, JSON.stringify({ ...done, savedAt: Date.now() }));
  } catch {
    /* Private mode: the confirmation still shows now, it just will not
     * survive a reload. */
  }
};

const clearDone = () => {
  try {
    window.localStorage.removeItem(DONE_KEY);
  } catch {
    /* As above. */
  }
};

/* Worth remembering only once there is something in it. Landing on the page,
 * touching nothing and leaving should not leave a draft behind. */
const worthSaving = (values) =>
  Object.entries(values).some(([k, v]) => {
    if (k === "plan_months") return v !== EMPTY.plan_months;
    if (k === "phone_cc") return v !== EMPTY.phone_cc;
    if (typeof v === "boolean") return v;
    return typeof v === "string" && v.trim() !== "";
  });

/* What each part needs before the next one opens. Instagram and the birthday
 * are in here on purpose: Iris waves back on Instagram, and the birthday is
 * what the extra envelope on the day is keyed to — both were optional and both
 * were routinely left blank, which made neither possible. */
const REQUIRED = {
  who: ["first_name", "last_name", "email", "phone_number", "instagram", "birthdate"],
  where: ["address_line1", "city", "state", "pincode"],
};

const LABELS = {
  first_name: "first name", last_name: "last name", email: "email",
  phone_number: "phone number", instagram: "Instagram handle", birthdate: "birthday",
  address_line1: "street address", city: "city", state: "state", pincode: "PIN code",
};

/* Defined at module scope so React keeps the input mounted between renders —
 * a component defined inside the render loses focus on every keystroke. */
const Field = ({ id, label, optional, hint, error, children }) => (
  <div className="field">
    <label htmlFor={id}>
      {label}
      {optional && <span style={css("opacity:.65;font-style:italic")}> &middot; optional</span>}
    </label>
    {children}
    {hint && !error && (
      <div style={css("font-size:11px;line-height:1.5;margin-top:4px;color:var(--color-neutral-600)")}>{hint}</div>
    )}
    {error && <div style={css("font-size:11px;line-height:1.5;margin-top:4px;color:#b3312f")}>{error}</div>}
  </div>
);

const Legend = ({ children }) => (
  <legend
    style={css(
      "padding:0;font-family:var(--font-heading);font-weight:600;font-size:clamp(20px,2.8vw,25px);line-height:1.25;color:var(--color-accent-800)"
    )}
  >
    {children}
  </legend>
);

/* A part of the form. `first` skips the rule above it, which is only there to
 * separate one part from the last. */
const Part = ({ first, children }) => (
  <fieldset
    style={css(
      "border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:var(--space-3)" +
        (first ? "" : ";border-top:1px solid var(--color-neutral-300);padding-top:clamp(20px,3.2vh,30px)")
    )}
  >
    {children}
  </fieldset>
);

/* The three parts, named. With only one on screen at a time the reader needs
 * something that says where they are and how much is left — and it doubles as
 * the way back: a part already done is a button to it. */
const STEPS = ["Subscription", "Who it’s for", "Where it goes"];

const Stepper = ({ part, onGo }) => (
  <ol
    style={css(
      "display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;list-style:none;margin:0;padding:0"
    )}
  >
    {STEPS.map((label, i) => {
      const n = i + 1;
      const done = n < part;
      const here = n === part;
      const body = (
        <>
          <span
            style={css(
              "display:grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:12px;flex:none;" +
                (here
                  ? "background:var(--color-accent-600);color:#fff"
                  : done
                  ? "background:var(--color-accent-200);color:var(--color-accent-800)"
                  : "background:var(--color-neutral-200);color:var(--color-neutral-600)")
            )}
          >
            {done ? "✓" : n}
          </span>
          <span>{label}</span>
        </>
      );
      const shared =
        "display:inline-flex;align-items:center;gap:7px;font-size:13px;line-height:1.3;";

      return (
        <li key={label} style={css("display:flex;align-items:center;gap:10px")}>
          {done ? (
            <button
              type="button"
              onClick={() => onGo(n)}
              style={css(
                shared +
                  "background:none;border:0;padding:0;cursor:pointer;font:inherit;font-size:13px;color:var(--color-accent-700);text-decoration:underline;text-underline-offset:3px"
              )}
            >
              {body}
            </button>
          ) : (
            <span
              aria-current={here ? "step" : undefined}
              style={css(
                shared +
                  (here ? "color:var(--color-accent-800);font-weight:600" : "color:var(--color-neutral-600)")
              )}
            >
              {body}
            </span>
          )}
          {n < STEPS.length && (
            <span aria-hidden="true" style={css("width:14px;height:1px;background:var(--color-neutral-400)")} />
          )}
        </li>
      );
    })}
  </ol>
);

/* How long they are subscribing for — a duration, not a quantity. One letter
 * arrives each month either way; a longer plan is a longer commitment at a
 * better monthly rate. So each row shows the total it charges, with the rate
 * beside it as the reason to take the longer one.
 *
 * The lengths and both figures come from /api/config — which reads them from
 * the plans table — so a price change never needs a redeploy, and this renders
 * whatever is on offer rather than a hardcoded three. */
const PlanPicker = ({ options, value, onChange, error, pending }) => {
  /* Never nothing. An empty list used to render as empty space under the
   * heading, which read as a broken page rather than a slow one — and the
   * reader could still press Next and buy the default month without ever
   * having been shown a price. */
  if (pending) {
    return (
      <div style={css("display:flex;flex-direction:column;gap:var(--space-2)")} aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={css(
              "height:62px;border-radius:var(--radius-md);border:1px solid var(--color-neutral-300);background:var(--color-neutral-200);opacity:" +
                (0.8 - i * 0.2)
            )}
          />
        ))}
        <p style={css("margin:0;font-size:12px;color:var(--color-neutral-600)")}>
          Fetching this month&rsquo;s prices…
        </p>
      </div>
    );
  }

  if (!options?.length) return null;

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--space-2)")}>
      {options.map((plan) => {
        const on = plan.months === value;
        const months = `${plan.months} ${plan.months === 1 ? "month" : "months"}`;
        return (
          <label
            key={plan.months}
            className="radio"
            style={css(
              "display:flex;align-items:flex-start;gap:14px;width:100%;padding:15px 18px;border-radius:var(--radius-md);font-size:15px;" +
                (on
                  ? "border:1px solid var(--color-accent-500);background:var(--color-accent-100)"
                  : "border:1px solid var(--color-neutral-300);background:var(--color-neutral-100)")
            )}
          >
            <input
              type="radio"
              name="plan_months"
              value={plan.months}
              checked={on}
              onChange={() => onChange(plan.months)}
            />
            <span className="dot" style={css("margin-top:4px")} />
            <span style={css("flex:1;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px")}>
              <span style={css("font-family:var(--font-heading);font-weight:600;font-size:19px;color:var(--color-accent-800)")}>
                {months}
              </span>
              <span style={css("font-size:13px;color:var(--color-neutral-600)")}>
                {plan.months === 1 ? plan.note || "one envelope" : `${plan.months} envelopes · ${plan.rateDisplay} a month`}
              </span>
              <span
                style={css(
                  "margin-left:auto;font-family:var(--font-heading);font-weight:600;font-size:19px;color:var(--color-accent-800);white-space:nowrap"
                )}
              >
                {plan.totalDisplay}
              </span>
            </span>
          </label>
        );
      })}
      {error && <div style={css("font-size:11px;line-height:1.5;color:#b3312f")}>{error}</div>}
    </div>
  );
};

/* "2026-10" -> "October 2026". The cycle key is how the database files a
 * month, and it was being shown to readers as-is. */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
const monthName = (cycle) => {
  const [y, m] = String(cycle || "").split("-").map(Number);
  return y && m >= 1 && m <= 12 ? `${MONTHS[m - 1]} ${y}` : cycle || "";
};

/*  What to say when a sign-up will not send.
 *
 *  Two different situations wearing the same shape. Something wrong with what
 *  was typed is the reader's to fix and the server says exactly what it is. A
 *  server that did not answer at all is nobody's fault and is very often just
 *  the free-tier API waking up, which takes seconds — so it asks for one more
 *  go rather than reporting a failure. Nothing has been charged either way.
 *
 *  Kept out of the up-front banner on purpose: told at the moment it happens,
 *  it is useful; shown before anyone has typed anything, it only suggests the
 *  form is broken when it is not.
 */
const WAKING = new Set([0, 408, 429, 500, 502, 503, 504]);

const sendingMessage = (err) =>
  WAKING.has(err?.status)
    ? "The sign-up desk is just waking up. Everything you have typed is safe — please press the button again in a few seconds."
    : err?.message || "Something went wrong. Try again in a moment.";

/* One ID on the confirmation, with what it is for. */
const IdRow = ({ label, value, hint }) =>
  !value ? null : (
    <div style={css("padding:12px 14px;border:1px solid var(--color-neutral-300);border-radius:var(--radius-md);background:var(--color-neutral-100)")}>
      <div style={css("font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-600)")}>
        {label}
      </div>
      <div style={css("font-size:16px;letter-spacing:.03em;margin-top:3px;font-feature-settings:'tnum';overflow-wrap:anywhere")}>
        {value}
      </div>
      <div style={css("font-size:12px;line-height:1.5;margin-top:3px;color:var(--color-neutral-600)")}>{hint}</div>
    </div>
  );

const Notice = ({ tone = "error", children }) =>
  !children ? null : (
    <p
      style={css(
        "margin:0;padding:10px 13px;font-size:13px;line-height:1.55;border-radius:var(--radius-md);border:1px solid " +
          (tone === "error"
            ? "color-mix(in srgb, #b3312f 40%, transparent);color:#8c2523;background:color-mix(in srgb, #b3312f 7%, transparent)"
            : "var(--color-neutral-300);color:var(--color-text);background:var(--color-neutral-200)")
      )}
    >
      {children}
    </p>
  );

export default function SubscribeForm({ onSealed, onUnsealed }) {
  const [config, setConfig] = useState(null);
  /* Only ever a warning. The form does not need /config to work — it carries
   * the price and nothing else — so a slow or missing answer must not be
   * allowed to bar the way. */
  const [configFailed, setConfigFailed] = useState(false);

  /* Read once, lazily, so a restored draft is in the very first render and
   * the reader never sees an empty form flash back to a full one. */
  const [restored] = useState(readDraft);
  const [resumed, setResumed] = useState(() => Boolean(restored));

  /* Which part is on screen. One at a time; the stepper and the Back buttons
   * move it in both directions. */
  const [part, setPart] = useState(() => restored?.part || 1);
  const [done, setDone] = useState(readDone);
  const [stage, setStage] = useState(() => (done ? "sealed" : "form")); // form | pay | sealed
  const [values, setValues] = useState(() => restored?.values || EMPTY);
  const [fieldErrs, setFieldErrs] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const [subscription, setSubscription] = useState(null);
  const [payment, setPayment] = useState(null);

  /* Consent to the terms, given at the moment of paying.
   *
   * Starts false and is never pre-ticked: the Consumer Protection (E-Commerce)
   * Rules, 2020 require consent to a purchase to be an explicit affirmative
   * act, and specifically not "automatic means such as pre-ticked checkboxes". */
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    let live = true;
    getConfig()
      .then((c) => live && setConfig(c))
      .catch(() => live && setConfigFailed(true));
    return () => {
      live = false;
    };
  }, []);

  /* Kept up to date as they type. Writing on every keystroke is fine — it is
   * a few hundred bytes to the same key, and the alternative is deciding when
   * a pause is long enough to count, which is how drafts get lost. */
  useEffect(() => {
    if (stage !== "form") return;
    if (worthSaving(values)) writeDraft(values, part);
  }, [values, part, stage]);

  const set = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setFieldErrs((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

  const onChange = useCallback((e) => set(e.target.name, e.target.value), [set]);

  const livePlans = config?.plans?.india || [];

  /* Falling back to the rate card in business.js rather than to nothing.
   * It mirrors the plans table, and the amount actually charged is computed
   * server-side from that same table — so the worst case here is a figure that
   * is briefly out of date, shown again from the server on the pay step before
   * a rupee moves. An empty list, by contrast, is a dead end. */
  const fallbackPlans = useMemo(
    () =>
      business.plans.map((p) => ({
        months: p.months,
        rateDisplay: p.rate,
        totalDisplay: p.total,
        note: p.note,
      })),
    []
  );

  const plans = livePlans.length ? livePlans : configFailed ? fallbackPlans : [];
  const plansPending = !livePlans.length && !configFailed;

  /* Open the next part, or say what is still blank. Checked here rather than
   * left to the browser so the message names the field in words. */
  const advance = (which, next) => {
    const missing = REQUIRED[which].filter((k) => !String(values[k] || "").trim());
    if (missing.length) {
      setFieldErrs(Object.fromEntries(missing.map((k) => [k, `Iris needs your ${LABELS[k]}.`])));
      setFormError(`Still to fill in: ${missing.map((k) => LABELS[k]).join(", ")}.`);
      return;
    }
    setFieldErrs({});
    setFormError("");
    setPart(next);
  };

  /* Back, or a jump to any part already done via the stepper.
   *
   * `values` is untouched: every part reads and writes the one object, so the
   * answers are still there when the part comes back on screen. Only the
   * complaints are cleared — errors raised about a part you have left are
   * noise by the time you return to it. */
  const goTo = useCallback((n) => {
    setFieldErrs({});
    setFormError("");
    setPart(n);
  }, []);

  const startOver = () => {
    clearDraft();
    clearDone();
    setDone(null);
    setResumed(false);
    setPart(1);
    setStage("form");
    setValues(EMPTY);
    setFieldErrs({});
    setFormError("");
    setSubscription(null);
    setPayment(null);
    setAgreed(false);
    onUnsealed?.();
  };

  const payload = useMemo(() => {
    const clean = (s) => (typeof s === "string" ? s.trim() : s);
    return {
      region: "india",
      plan_months: values.plan_months,
      first_name: clean(values.first_name),
      last_name: clean(values.last_name),
      email: clean(values.email),
      phone_cc: clean(values.phone_cc) || "+91",
      phone_number: clean(values.phone_number),
      instagram: clean(values.instagram),
      birthdate: clean(values.birthdate),
      promo_code: clean(values.promo_code) || null,
      is_gift: values.is_gift,
      gift_message: values.is_gift ? clean(values.gift_message) || null : null,
      interests_note: clean(values.interests_note) || null,
      address_line1: clean(values.address_line1),
      address_line2: clean(values.address_line2) || null,
      landmark: clean(values.landmark) || null,
      city: clean(values.city),
      state: clean(values.state),
      pincode: clean(values.pincode),
      country: "India",
    };
  }, [values]);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const missing = [...REQUIRED.who, ...REQUIRED.where].filter((k) => !String(values[k] || "").trim());
    if (missing.length) {
      setFieldErrs(Object.fromEntries(missing.map((k) => [k, `Iris needs your ${LABELS[k]}.`])));
      setFormError(`Still to fill in: ${missing.map((k) => LABELS[k]).join(", ")}.`);
      return;
    }

    setBusy(true);
    setFormError("");
    setFieldErrs({});
    try {
      const result = await createSubscription(payload);
      setSubscription(result.subscription);
      setPayment(result.payment);
      setStage("pay");
    } catch (err) {
      setFieldErrs(err.fields || {});
      setFormError(sendingMessage(err));
    } finally {
      setBusy(false);
    }
  };

  /* Razorpay Checkout. Only reachable when the backend says payments are on,
   * which means the keys exist and an order has been created for this row. */
  const openCheckout = async () => {
    if (busy) return;
    setBusy(true);
    setFormError("");
    try {
      const Razorpay = await loadRazorpayCheckout();
      const checkout = new Razorpay({
        key: payment.key_id,
        order_id: payment.order_id,
        /* Already in paise — the unit both our plans table and Razorpay use,
         * so it is passed straight through with no arithmetic. */
        amount: payment.amount_minor,
        currency: payment.currency || "INR",
        name: "The Little Door Post",
        description: `${subscription.plan_months} ${
          subscription.plan_months === 1 ? "month" : "months"
        }, from ${subscription.cycle}`,
        prefill: {
          name: [values.first_name, values.last_name].filter(Boolean).join(" "),
          email: values.email,
          contact: `${values.phone_cc}${values.phone_number}`,
        },
        notes: { reference: subscription.reference },
        theme: { color: "#6b7a46" },
        modal: {
          /* They closed the window without paying — put the button back
           * rather than leaving a spinner running. */
          ondismiss: () => setBusy(false),
        },
        handler: async (response) => {
          try {
            const result = await verifyPayment(subscription.id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSubscription(result.subscription);
            /* Two IDs, and both are real. Razorpay's pay_… identifies the money
             * moving; our LDP-… identifies the subscription it bought. A reader
             * matching this page against their bank or UPI app is looking for
             * the first, so it is shown first. */
            const record = {
              paymentId: response.razorpay_payment_id,
              reference: result.subscription?.reference || subscription.reference,
              amount: result.subscription?.amount_display || subscription.amount_display,
              months: result.subscription?.plan_months || subscription.plan_months,
              cycle: result.subscription?.cycle || subscription.cycle,
            };
            writeDone(record);
            setDone(record);
            clearDraft();
            setStage("sealed");
            onSealed?.();
          } catch (err) {
            setFormError(err.message);
          } finally {
            setBusy(false);
          }
        },
      });
      checkout.on("payment.failed", (response) => {
        setFormError(
          response?.error?.description ||
            "That payment did not go through. Nothing has been charged — please try again."
        );
        setBusy(false);
      });
      checkout.open();
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  };

  const gap = css("display:flex;flex-direction:column;gap:clamp(22px,3.4vh,32px)");
  const twoUp = css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:var(--space-3)");
  const panel = css(
    "border:1px solid var(--color-neutral-300);border-radius:var(--radius-md);padding:clamp(20px,4vw,30px);background:var(--color-neutral-200)"
  );
  const heading = css(
    "font-family:var(--font-heading);font-weight:600;font-size:clamp(24px,4.2vw,32px);line-height:1.2;color:var(--color-accent-800);margin:0"
  );
  const muted = css("font-size:13px;line-height:1.7;color:var(--color-neutral-700)");

  /* ── payment ───────────────────────────────────────────────────────── */
  if (stage === "pay") {
    const amount = payment?.amount_display || subscription?.amount_display;

    /* Razorpay is not switched on yet — say so plainly and keep the details
     * that have already been saved. Nothing is charged. */
    if (!payment?.enabled) {
      return (
        <div style={gap}>
          <div style={panel}>
            <h3 style={heading}>Your details are saved.</h3>
            <hr className="hr" />
            <p style={css("font-size:15px;line-height:1.8;margin-bottom:var(--space-3)")}>
              {payment?.message ||
                "Card and UPI payments are being set up and are not live yet. Iris will email you the moment checkout opens."}
            </p>
            <p style={css("font-size:15px;line-height:1.8;margin-bottom:var(--space-3)")}>
              <strong>Nothing has been charged.</strong> Your place for this month is held under the
              reference below &mdash; keep it if you write to us.
            </p>
            <div
              style={css(
                "display:flex;align-items:baseline;gap:12px;padding:11px 14px;border:1px solid var(--color-neutral-300);border-radius:var(--radius-md);background:var(--color-neutral-100)"
              )}
            >
              <span style={css("font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-600)")}>
                Reference
              </span>
              <span style={css("font-size:16px;letter-spacing:.05em;font-feature-settings:'tnum'")}>
                {subscription.reference}
              </span>
            </div>
            <p style={{ ...muted, marginTop: "var(--space-3)" }}>
              When it opens, your subscription costs {amount}, postage included.
            </p>
          </div>
          <button className="btn btn-secondary btn-block" type="button" onClick={startOver} style={css("margin-top:0")}>
            Add someone else
          </button>
        </div>
      );
    }

    /* Short on purpose. This screen used to carry three paragraphs and a
     * four-policy sentence, and a reader about to pay does not read three
     * paragraphs — they scroll past them, which is worse than not having them.
     *
     * What must stay, stays: the box is unticked and theirs to tick (the
     * E-Commerce Rules forbid pre-ticked consent), the policies that govern
     * the purchase are one tap away, and "charged once" is said plainly
     * because it is the thing people actually worry about. The privacy notice
     * was given on the step that collected the details. */
    return (
      <div style={gap}>
        <div style={panel}>
          <h3 style={heading}>Review and pay</h3>
          <hr className="hr" />
          <div
            style={css(
              "display:flex;align-items:baseline;justify-content:space-between;gap:16px"
            )}
          >
            <span style={css("font-size:15px;line-height:1.5")}>
              {subscription.plan_months} {subscription.plan_months === 1 ? "month" : "months"}
              <span style={css("display:block;font-size:13px;color:var(--color-neutral-600)")}>
                Starts with the {monthName(subscription.cycle)} letter
              </span>
            </span>
            <span style={css("font-family:var(--font-heading);font-size:clamp(24px,4.4vw,30px);line-height:1;white-space:nowrap")}>
              {amount}
            </span>
          </div>
          <p style={{ ...muted, marginTop: "var(--space-3)", marginBottom: 0 }}>
            Postage included &middot; charged once, never renewed automatically.
          </p>
        </div>

        <label style={css("display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:13px;line-height:1.6")}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (e.target.checked) setFormError("");
            }}
            style={css("width:18px;height:18px;margin-top:1px;flex:none;accent-color:var(--color-accent-600)")}
          />
          {/* New tab, deliberately: a policy opened in this one would unmount
            * the form a click before payment. */}
          <span>
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noreferrer noopener">Terms</a>,{" "}
            <a href="/refunds" target="_blank" rel="noreferrer noopener">refund</a> and{" "}
            <a href="/shipping" target="_blank" rel="noreferrer noopener">shipping</a> policies.
          </span>
        </label>

        <Notice>{formError}</Notice>

        <button
          className="btn btn-primary btn-block"
          type="button"
          disabled={busy || !agreed}
          onClick={openCheckout}
          style={css("padding:15px 24px;font-size:16px;margin-top:0")}
        >
          {busy ? "Opening…" : `Pay ${amount}`}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => setStage("form")} style={css("font-size:13px")}>
          &larr; Change my details
        </button>
      </div>
    );
  }

  /* ── sealed ────────────────────────────────────────────────────────── */
  if (stage === "sealed") {
    const paid = done || {
      reference: subscription?.reference,
      amount: subscription?.amount_display,
      months: subscription?.plan_months,
      cycle: subscription?.cycle,
    };

    return (
      <div
        style={css(
          "border:1px solid var(--color-accent-300);border-radius:var(--radius-md);padding:clamp(22px,4vw,32px);background:var(--color-accent-100);animation:ldp-rise .7s cubic-bezier(.2,.7,.2,1) both"
        )}
      >
        <div style={css("display:flex;align-items:center;gap:10px")}>
          <span
            aria-hidden="true"
            style={css("display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--color-accent-600);color:#fff;font-size:17px;flex:none")}
          >
            &#10003;
          </span>
          <div style={heading}>Payment done</div>
        </div>
        <p style={css("font-size:15px;line-height:1.7;margin:var(--space-3) 0")}>
          {paid.amount ? <><strong>{paid.amount}</strong> paid for </> : "Paid for "}
          {paid.months} {paid.months === 1 ? "month" : "months"}. Your first letter goes out with the{" "}
          {monthName(paid.cycle)} post.
        </p>

        <div style={css("display:flex;flex-direction:column;gap:var(--space-2)")}>
          <IdRow
            label="Payment ID"
            value={paid.paymentId}
            hint="From Razorpay — the one your bank or UPI app shows."
          />
          <IdRow
            label="Order reference"
            value={paid.reference}
            hint="Ours — quote it if you write to us."
          />
        </div>

        <button className="btn btn-secondary" type="button" onClick={startOver} style={css("margin-top:var(--space-4)")}>
          Subscribe someone else
        </button>
      </div>
    );
  }

  /* ── the form ──────────────────────────────────────────────────────── */
  return (
    <form onSubmit={submit} style={gap}>
      <Stepper part={part} onGo={goTo} />

      {/* Finding a form already filled in is unsettling if nothing says why.
        * One line, and a way to wipe it. */}
      {resumed && (
        <Notice tone="info">
          Picked up where you left off &mdash; this is kept in your browser only.{" "}
          <button
            type="button"
            onClick={startOver}
            style={css(
              "background:none;border:0;padding:0;font:inherit;font-size:13px;color:var(--color-accent-700);text-decoration:underline;text-underline-offset:3px;cursor:pointer"
            )}
          >
            Start fresh
          </button>
        </Notice>
      )}

      {/* 1 ── the subscription ─────────────────────────────────────────── */}
      {part === 1 && (
      <Part first>
        <Legend>1 &middot; Choose a subscription</Legend>
        {/* What this says depends on what is actually on sale. Promising a
          * better rate for a longer subscription while only one length is
          * offered is a promise the page cannot keep. */}
        <p style={{ ...muted, margin: 0 }}>
          Postage within India is included.{" "}
          {plans.length > 1
            ? "A longer subscription is a better monthly rate, not a different envelope."
            : "One envelope, posted to your address — longer subscriptions are coming back shortly."}
        </p>
        <PlanPicker
          pending={plansPending}
          options={plans}
          value={values.plan_months}
          onChange={(m) => set("plan_months", m)}
          error={fieldErrs.plan_months}
        />
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => goTo(2)}
          style={css("align-self:flex-start;padding:13px 24px;font-size:15px;margin-top:6px")}
        >
          Next: who it&rsquo;s for
        </button>
      </Part>
      )}

      {/* 2 ── who it is for ───────────────────────────────────────────── */}
      {part === 2 && (
        <Part first>
          <Legend>2 &middot; Who is it for?</Legend>
          <div style={twoUp}>
            <Field id="ldp-first" label="First name" error={fieldErrs.first_name}>
              <input
                className="input" id="ldp-first" name="first_name" type="text" required
                autoComplete="given-name" value={values.first_name} onChange={onChange} placeholder="Meera"
              />
            </Field>
            <Field id="ldp-last" label="Last name" error={fieldErrs.last_name}>
              <input
                className="input" id="ldp-last" name="last_name" type="text" required
                autoComplete="family-name" value={values.last_name} onChange={onChange} placeholder="Raghavan"
              />
            </Field>
          </div>

          <Field id="ldp-email" label="Email" error={fieldErrs.email}>
            <input
              className="input" id="ldp-email" name="email" type="email" required
              autoComplete="email" value={values.email} onChange={onChange} placeholder="you@somewhere.com"
            />
          </Field>

          {/* The phone has a row to itself. Sharing one with Instagram gave it
            * half the width on a phone, and it then spent 92px of that half on
            * "+91" — leaving the number itself too narrow to show ten digits. */}
          <div className="field">
              <label htmlFor="ldp-phone">Phone</label>
              {/* Two inputs, one field: the code is a short fixed thing and the
                * number is the part that identifies somebody, so they are
                * stored and compared separately. The code box is sized for
                * "+91" and no wider; every spare pixel goes to the number. */}
              <div style={css("display:grid;grid-template-columns:4.6em minmax(0,1fr);gap:var(--space-2)")}>
                <input
                  className="input" name="phone_cc" type="text" required aria-label="Country code"
                  value={values.phone_cc} onChange={onChange} placeholder="+91"
                />
                <input
                  className="input" id="ldp-phone" name="phone_number" type="tel" required
                  inputMode="numeric" autoComplete="tel-national" value={values.phone_number}
                  onChange={onChange} placeholder="98765 43210"
                  style={css("letter-spacing:.02em;font-feature-settings:'tnum'")}
                />
              </div>
              {(fieldErrs.phone_cc || fieldErrs.phone_number) ? (
                <div style={css("font-size:11px;line-height:1.5;margin-top:4px;color:#b3312f")}>
                  {fieldErrs.phone_cc || fieldErrs.phone_number}
                </div>
              ) : (
                <div style={css("font-size:11px;line-height:1.5;margin-top:4px;color:var(--color-neutral-600)")}>
                  For delivery only &mdash; couriers call before they come.
                </div>
              )}
          </div>

          <div style={twoUp}>
            <Field
              id="ldp-insta" label="Instagram" error={fieldErrs.instagram}
              hint="So Iris knows who you are when she waves back."
            >
              <input
                className="input" id="ldp-insta" name="instagram" type="text" required
                value={values.instagram} onChange={onChange} placeholder="@yourhandle"
              />
            </Field>
            <Field
              id="ldp-bday" label="Birthday" error={fieldErrs.birthdate}
              hint="Iris sends something extra on the day."
            >
              <input
                className="input" id="ldp-bday" name="birthdate" type="date" required
                max={new Date().toISOString().slice(0, 10)} value={values.birthdate} onChange={onChange}
              />
            </Field>
          </div>

          <div style={css("display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:6px")}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => advance("who", 3)}
              style={css("padding:13px 24px;font-size:15px")}
            >
              Next: the address
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => goTo(1)}
              style={css("font-size:13px")}
            >
              &larr; Back to the subscription
            </button>
          </div>
        </Part>
      )}

      {/* 3 ── where it goes ───────────────────────────────────────────── */}
      {part === 3 && (
        <Part first>
          <Legend>3 &middot; Where does it go?</Legend>

          <Field id="ldp-street" label="Street address" error={fieldErrs.address_line1}>
            <input
              className="input" id="ldp-street" name="address_line1" type="text" required
              autoComplete="address-line1" value={values.address_line1} onChange={onChange}
              placeholder="House or flat number and street"
            />
          </Field>
          <Field id="ldp-area" label="Area, colony or apartment" optional error={fieldErrs.address_line2}>
            <input
              className="input" id="ldp-area" name="address_line2" type="text"
              autoComplete="address-line2" value={values.address_line2} onChange={onChange}
              placeholder="Sector, society, block"
            />
          </Field>
          <Field id="ldp-landmark" label="Landmark" optional error={fieldErrs.landmark}>
            <input
              className="input" id="ldp-landmark" name="landmark" type="text"
              value={values.landmark} onChange={onChange} placeholder="Near the old banyan tree"
            />
          </Field>

          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:var(--space-3)")}>
            <Field id="ldp-city" label="City" error={fieldErrs.city}>
              <input
                className="input" id="ldp-city" name="city" type="text" required
                autoComplete="address-level2" value={values.city} onChange={onChange} placeholder="Town or city"
              />
            </Field>
            <Field id="ldp-pin" label="PIN code" error={fieldErrs.pincode}>
              <input
                className="input" id="ldp-pin" name="pincode" type="text" required inputMode="numeric"
                pattern="[1-9][0-9]{5}" maxLength={6} autoComplete="postal-code" value={values.pincode}
                onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6 digits"
              />
            </Field>
          </div>

          <Field id="ldp-state" label="State" error={fieldErrs.state}>
            <select
              className="input" id="ldp-state" name="state" required autoComplete="address-level1"
              value={values.state} onChange={onChange}
            >
              <option value="">Choose a state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <p style={{ ...muted, margin: 0 }}>
            Delivery within India takes up to a week. We post within India only for the moment
            &mdash; global shipping is being worked out, and if you are somewhere else you can{" "}
            <a href="#global">ask to be told when it opens</a>.
          </p>

          {/* Not behind a toggle. These three are the ones that make the next
            * letter better than the last, and a toggle is where they went to
            * die. */}
          <div
            style={css(
              "display:flex;flex-direction:column;gap:var(--space-3);margin-top:6px;padding:14px;border-radius:var(--radius-md);background:var(--color-accent-100)"
            )}
          >
            {/* Written out rather than picked from a list. A row of tick-boxes
              * only ever tells Iris which of her own suggestions a reader
              * recognised; their own words say something she could not have
              * guessed. */}
            <Field
              id="ldp-note" label="Anything you'd love a letter about?" optional
              error={fieldErrs.interests_note} hint="It helps Iris choose what to write about next."
            >
              <textarea
                className="input" id="ldp-note" name="interests_note" rows={3} maxLength={600}
                value={values.interests_note} onChange={onChange}
                placeholder="A place you love, a story you want"
              />
            </Field>
            <Field
              id="ldp-code" label="Have a code?" optional error={fieldErrs.promo_code}
              hint="It works from the number you signed up with."
            >
              {/* No placeholder: a code in grey text is a code being handed
                * out. The people who have one already know what it says. */}
              <input
                className="input" id="ldp-code" name="promo_code" type="text" value={values.promo_code}
                onChange={(e) => set("promo_code", e.target.value.toUpperCase())}
                style={css("letter-spacing:.06em")}
              />
            </Field>
            <label className="radio" style={css("gap:10px;font-size:14px;min-height:44px")}>
              <input
                type="checkbox" checked={values.is_gift}
                onChange={(e) => set("is_gift", e.target.checked)}
                style={css(
                  "position:static;opacity:1;width:18px;height:18px;pointer-events:auto;accent-color:var(--color-accent-600)"
                )}
              />
              <span>This is a gift for somebody else</span>
            </label>
            {values.is_gift && (
              <Field
                id="ldp-gift" label="A line to go in with it" error={fieldErrs.gift_message}
                hint="Iris copies it onto a card and tucks it into the first envelope."
              >
                <textarea
                  className="input" id="ldp-gift" name="gift_message" rows={3} maxLength={600} required
                  value={values.gift_message} onChange={onChange}
                  placeholder="For Ammu, who reads everything twice — happy birthday."
                />
              </Field>
            )}
          </div>

          {/* The DPDP Act wants the notice at the point the details are handed
            * over, not only on a page somewhere else. Nothing is charged by
            * this button, so it is a notice rather than a consent gate — the
            * tick that authorises the purchase is on the next step. */}
          <p style={muted}>
            We use these details to address and post your envelope, and nothing else. We never see
            your card or UPI details. See the{" "}
            <a href="/privacy" target="_blank" rel="noreferrer noopener">Privacy Policy</a>.
          </p>

          <Notice>{formError}</Notice>

          <button
            className="btn btn-primary btn-block" type="submit" disabled={busy}
            style={css("padding:15px 24px;font-size:16px;margin-top:0")}
          >
            {busy ? "Just a moment…" : "Seal the envelope"}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => goTo(2)}
            style={css("align-self:flex-start;font-size:13px")}
          >
            &larr; Back to who it&rsquo;s for
          </button>
          <p style={css("margin:0;font-size:12px;line-height:1.6;color:var(--color-neutral-600)")}>
            Iris writes the address by hand, so please give it exactly as your post office likes it.
            See <a href="/pricing">pricing</a> and <a href="/refunds">cancellations</a>.
          </p>
        </Part>
      )}

      {part < 3 && <Notice>{formError}</Notice>}
    </form>
  );
}
