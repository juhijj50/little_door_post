/*  The sign-up flow, in four stages:
 *
 *    region  →  is the envelope going to India or somewhere else?
 *                (somewhere else stops there — nothing abroad is sold or stored)
 *    details →  everything Iris needs to address it
 *    pay     →  Razorpay Checkout
 *    sealed  →  confirmed
 *
 *  There is no open/closed state here. The site is only linked from the bio
 *  while sign-ups are running, so reaching this page at all is the permission.
 *  That is also why nothing on screen waits for the API: the form is usable the
 *  instant it renders, and /api/config only fills in the prices when it lands.
 *
 *  Payments are switched on by the backend, not here: each sign-up comes back
 *  with a payment block whose `enabled` flag decides between a pay button and a
 *  "not live yet" notice.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { css } from "./css.js";
import {
  createSubscription,
  getConfig,
  loadRazorpayCheckout,
  verifyPayment,
} from "./api.js";

const INTERESTS = [
  "Folklore & fairy tales",
  "Food & recipes",
  "Music",
  "Books & poetry",
  "Art & illustration",
  "Maps & travel",
  "Plants & gardens",
  "History",
  "Animals",
  "Craft & making",
  "Puzzles & games",
  "The sea",
];

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
  phone_cc: "+91", phone_number: "", instagram: "",
  promo_code: "", is_gift: false, gift_message: "",
  address_line1: "", address_line2: "", landmark: "", city: "", state: "", pincode: "",
  country: "", birthdate: "", interests: [], interests_note: "",
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
      <div
        style={css(
          "font-size:11px;line-height:1.5;margin-top:4px;color:color-mix(in srgb, var(--color-text) 52%, transparent)"
        )}
      >
        {hint}
      </div>
    )}
    {error && (
      <div style={css("font-size:11px;line-height:1.5;margin-top:4px;color:#b3312f")}>{error}</div>
    )}
  </div>
);

/* How long they are subscribing for — a duration, not a quantity. One letter
 * arrives each month either way; a longer plan is a longer commitment at a
 * better monthly rate. So each button shows the total it charges, with the
 * rate underneath as the reason to take the longer one.
 *
 * The lengths and both figures come from /api/config — which reads them from
 * the plans table — so a price change never needs a redeploy, and this renders
 * whatever is on offer rather than a hardcoded three. */
const PlanPicker = ({ options, value, onChange, error }) => {
  if (!options?.length) return null;

  return (
    <div className="field">
      <label>How many months?</label>
      <div
        style={css(
          "display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:var(--space-2);margin-top:2px"
        )}
      >
        {options.map((plan) => {
          const on = plan.months === value;
          return (
            <button
              key={plan.months}
              type="button"
              onClick={() => onChange(plan.months)}
              aria-pressed={on}
              style={css(
                "cursor:pointer;font:inherit;text-align:left;padding:12px 13px;border-radius:var(--radius-md);transition:background .2s,border-color .2s;" +
                  (on
                    ? "border:1px solid var(--color-accent);background:var(--color-accent-100)"
                    : "border:1px solid var(--color-divider);background:transparent")
              )}
            >
              <div
                style={css(
                  "font-family:var(--font-heading);font-size:17px;line-height:1.1;" +
                    (on ? "color:var(--color-accent-800)" : "color:var(--color-text)")
                )}
              >
                {plan.months} {plan.months === 1 ? "month" : "months"}
              </div>
              <div style={css("font-size:15px;line-height:1.3;margin-top:4px")}>{plan.totalDisplay}</div>
              {plan.months > 1 && (
                <div
                  style={css(
                    "font-size:11px;line-height:1.4;margin-top:2px;color:color-mix(in srgb, var(--color-text) 58%, transparent)"
                  )}
                >
                  {plan.rateDisplay} a month
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <div style={css("font-size:11px;line-height:1.5;margin-top:4px;color:#b3312f")}>{error}</div>
      )}
    </div>
  );
};

const Notice = ({ tone = "error", children }) =>
  !children ? null : (
    <p
      style={css(
        "margin:0;padding:10px 13px;font-size:13px;line-height:1.55;border-radius:var(--radius-md);border:1px solid " +
          (tone === "error"
            ? "color-mix(in srgb, #b3312f 40%, transparent);color:#8c2523;background:color-mix(in srgb, #b3312f 7%, transparent)"
            : "var(--color-divider);color:var(--color-text);background:var(--color-neutral-100)")
      )}
    >
      {children}
    </p>
  );

export default function SubscribeForm({ onAddressChange, onSealed, onUnsealed }) {
  const [config, setConfig] = useState(null);
  /* Only ever a warning. The form does not need /config to work — it carries
   * the price and nothing else — so a slow or missing answer must not be
   * allowed to bar the way, which is what disabling these buttons used to do. */
  const [configFailed, setConfigFailed] = useState(false);

  const [stage, setStage] = useState("region");
  const [region, setRegion] = useState(null);
  const [values, setValues] = useState(EMPTY);
  const [fieldErrs, setFieldErrs] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const [subscription, setSubscription] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    let live = true;
    getConfig()
      .then((c) => live && setConfig(c))
      .catch(() => live && setConfigFailed(true));
    return () => {
      live = false;
    };
  }, []);

  /* Keep the envelope illustration addressed as they type. */
  useEffect(() => {
    onAddressChange?.({
      name: [values.first_name, values.last_name].filter(Boolean).join(" "),
      street: values.address_line1,
      cityLine: [values.city, values.pincode].filter(Boolean).join(" · "),
      country: region === "india" ? "India" : values.country,
    });
  }, [values, region, onAddressChange]);

  const set = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setFieldErrs((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

  /* The plans on offer for a region, and the cheapest per-month among them —
   * both empty until /config lands, which the callers cope with. */
  const plansFor = useCallback((r) => config?.plans?.[r] || [], [config]);

  const onChange = useCallback((e) => set(e.target.name, e.target.value), [set]);

  const toggleInterest = useCallback((interest) => {
    setValues((v) => ({
      ...v,
      interests: v.interests.includes(interest)
        ? v.interests.filter((i) => i !== interest)
        : v.interests.length >= 12
          ? v.interests
          : [...v.interests, interest],
    }));
  }, []);

  const chooseRegion = (next) => {
    setRegion(next);
    setFormError("");
    setFieldErrs({});
    setStage(next === "india" ? "details" : "international");
  };

  const startOver = () => {
    setStage("region");
    setRegion(null);
    setValues(EMPTY);
    setFieldErrs({});
    setFormError("");
    setSubscription(null);
    setPayment(null);
    onUnsealed?.();
  };

  const payload = useMemo(() => {
    const clean = (s) => (typeof s === "string" ? s.trim() : s);
    const base = {
      region,
      plan_months: values.plan_months,
      first_name: clean(values.first_name),
      last_name: clean(values.last_name),
      email: clean(values.email),
      phone_cc: clean(values.phone_cc) || "+91",
      phone_number: clean(values.phone_number),
      promo_code: clean(values.promo_code) || null,
      is_gift: values.is_gift,
      gift_message: values.is_gift ? clean(values.gift_message) || null : null,
      instagram: clean(values.instagram) || null,
      birthdate: clean(values.birthdate) || null,
      interests: values.interests,
      interests_note: clean(values.interests_note) || null,
    };
    if (region === "india") {
      return {
        ...base,
        address_line1: clean(values.address_line1),
        address_line2: clean(values.address_line2) || null,
        landmark: clean(values.landmark) || null,
        city: clean(values.city),
        state: clean(values.state),
        pincode: clean(values.pincode),
        country: "India",
      };
    }
    return { ...base, country: clean(values.country) };
  }, [region, values]);

  const submitDetails = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setFormError("");
    setFieldErrs({});
    try {
      const result = await createSubscription(payload);
      setSubscription(result.subscription);
      setPayment(result.payment);
      /* Only the India form submits — the international branch never gets
       * here, because it has no form to submit. */
      setStage("pay");
    } catch (err) {
      setFieldErrs(err.fields || {});
      setFormError(err.message);
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
        theme: { color: "#b3312f" },
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

  const gap = css("display:flex;flex-direction:column;gap:var(--space-3)");
  const twoUp = css("display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:var(--space-3)");
  const panel = css(
    "border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:clamp(20px,4vw,30px);background:var(--color-neutral-100)"
  );
  const heading = css(
    "font-family:var(--font-heading);font-style:italic;font-size:clamp(24px,4.2vw,32px);line-height:1.2;color:var(--color-accent-700);margin:0"
  );

  /* ── closed: no form at all ────────────────────────────────────────────
   *
   * Shown instead of the form, not alongside it. Filling in an address only to
   * be told at the end that the desk is shut is a waste of somebody's evening;
   * far better to say when to come back before they start.
   *
   * Only when the API has actually said so. While config is loading, or if it
   * never arrives, the form stays — a slow API must not look like a shut door,
   * and a sign-up that gets through is worth more than a tidy message.
   */
  /* ── which door? ─────────────────────────────────────────────────────── */
  if (stage === "region") {
    return (
      <div style={gap}>
        <Notice tone="info">First things first: where should the envelope be posted?</Notice>
        {configFailed && (
          <Notice>
            The sign-up desk is slow to answer just now. You can still fill everything in &mdash;
            if it will not send, give it a minute and try again.
          </Notice>
        )}
        <button
          className="btn btn-primary btn-block"
          type="button"
          onClick={() => chooseRegion("india")}
          style={css("padding:16px 22px;font-size:15px;flex-direction:column;gap:3px;margin-top:0")}
        >
          <span>Post it within India</span>
          <span style={css("font-family:var(--font-body);font-size:12px;opacity:.75")}>
            One envelope a month
          </span>
        </button>
        <button
          className="btn btn-secondary btn-block"
          type="button"
          onClick={() => chooseRegion("international")}
          style={css("padding:16px 22px;font-size:15px;flex-direction:column;gap:3px;margin-top:0")}
        >
          <span>Post it outside India</span>
          <span style={css("font-family:var(--font-body);font-size:12px;opacity:.7")}>
            Coming soon
          </span>
        </button>
      </div>
    );
  }

  /* ── outside India: nothing to collect ─────────────────────────────────
   *
   * No form and no request. There is no shipping abroad yet, so there is
   * nothing to sell and nothing worth keeping — and no promise made that would
   * need an address to keep it.
   */
  if (stage === "international") {
    return (
      <div style={gap}>
        <div style={panel}>
          <h3 style={heading}>Not posting there yet.</h3>
          <hr className="hr" />
          <p style={css("font-size:15px;line-height:1.8;margin-bottom:var(--space-3)")}>
            The Little Door Post ships within India only. Postage and customs for other
            countries are still being worked out, and until that is settled there is no
            honest way to promise you an envelope.
          </p>
          <p style={css("font-size:15px;line-height:1.8;margin:0")}>
            <strong>International post is coming soon.</strong> Do follow along on Instagram
            &mdash; that is where it will be announced the moment Iris can post further afield.
          </p>
        </div>
        <button className="btn btn-secondary btn-block" type="button" onClick={startOver}
          style={css("margin-top:0")}>
          &larr; Back
        </button>
      </div>
    );
  }

  /* ── India: the details ──────────────────────────────────────────────── */
  if (stage === "details") {
    return (
      <form onSubmit={submitDetails} style={gap}>
        <PlanPicker
          options={plansFor("india")}
          value={values.plan_months}
          onChange={(m) => set("plan_months", m)}
          error={fieldErrs.plan_months}
        />

        <div style={twoUp}>
          <Field id="ldp-first" label="First name" error={fieldErrs.first_name}
            hint="As your post office likes it — Iris writes it by hand.">
            <input className="input" id="ldp-first" name="first_name" type="text" required
              autoComplete="given-name" value={values.first_name} onChange={onChange}
              placeholder="Meera" />
          </Field>
          <Field id="ldp-last" label="Last name" error={fieldErrs.last_name}>
            <input className="input" id="ldp-last" name="last_name" type="text" required
              autoComplete="family-name" value={values.last_name} onChange={onChange}
              placeholder="Raghavan" />
          </Field>
        </div>

        <Field id="ldp-email" label="Email" error={fieldErrs.email}>
          <input className="input" id="ldp-email" name="email" type="email" required
            autoComplete="email" value={values.email} onChange={onChange}
            placeholder="you@somewhere.com" />
        </Field>

        <div className="field">
          <label htmlFor="ldp-phone">Phone</label>
          {/* Two inputs, one field: the code is a short fixed thing and the
            * number is the part that identifies somebody, so they are stored
            * and compared separately. */}
          <div style={css("display:grid;grid-template-columns:92px 1fr;gap:var(--space-2);margin-top:2px")}>
            <input className="input" name="phone_cc" type="text" required
              aria-label="Country code" value={values.phone_cc} onChange={onChange}
              placeholder="+91" />
            <input className="input" id="ldp-phone" name="phone_number" type="tel" required
              inputMode="numeric" autoComplete="tel-national"
              value={values.phone_number} onChange={onChange}
              placeholder="For delivery only" />
          </div>
          {(fieldErrs.phone_cc || fieldErrs.phone_number) && (
            <div style={css("font-size:11px;line-height:1.5;margin-top:4px;color:#b3312f")}>
              {fieldErrs.phone_cc || fieldErrs.phone_number}
            </div>
          )}
        </div>

        <Field id="ldp-insta" label="Instagram" error={fieldErrs.instagram}
          hint="So Iris knows who you are when she waves back.">
          <input className="input" id="ldp-insta" name="instagram" type="text" required
            value={values.instagram} onChange={onChange} placeholder="@yourhandle" />
        </Field>

        <hr className="hr" style={css("margin:var(--space-2) 0")} />

        <Field id="ldp-street" label="Street address" error={fieldErrs.address_line1}>
          <input className="input" id="ldp-street" name="address_line1" type="text" required
            autoComplete="address-line1" value={values.address_line1} onChange={onChange}
            placeholder="House / flat number and street" />
        </Field>
        <Field id="ldp-area" label="Area, colony or apartment" optional error={fieldErrs.address_line2}>
          <input className="input" id="ldp-area" name="address_line2" type="text"
            autoComplete="address-line2" value={values.address_line2} onChange={onChange}
            placeholder="Sector, society, block" />
        </Field>
        <Field id="ldp-landmark" label="Landmark" optional error={fieldErrs.landmark}>
          <input className="input" id="ldp-landmark" name="landmark" type="text"
            value={values.landmark} onChange={onChange} placeholder="Near the old banyan tree" />
        </Field>

        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--space-3)")}>
          <Field id="ldp-city" label="City" error={fieldErrs.city}>
            <input className="input" id="ldp-city" name="city" type="text" required
              autoComplete="address-level2" value={values.city} onChange={onChange}
              placeholder="Town or city" />
          </Field>
          <Field id="ldp-state" label="State" error={fieldErrs.state}>
            <select className="input" id="ldp-state" name="state" required
              autoComplete="address-level1" value={values.state} onChange={onChange}>
              <option value="">Choose a state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field id="ldp-pin" label="PIN code" error={fieldErrs.pincode}>
            <input className="input" id="ldp-pin" name="pincode" type="text" required
              inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} autoComplete="postal-code"
              value={values.pincode}
              onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6 digits" />
          </Field>
        </div>

        <hr className="hr" style={css("margin:var(--space-2) 0")} />

        <Field id="ldp-bday" label="Birthday" optional error={fieldErrs.birthdate}
          hint="Iris likes to send something extra on the day.">
          <input className="input" id="ldp-bday" name="birthdate" type="date"
            max={new Date().toISOString().slice(0, 10)} value={values.birthdate} onChange={onChange} />
        </Field>

        <div className="field">
          <label>
            What do you like reading about?
            <span style={css("opacity:.65;font-style:italic")}> &middot; optional</span>
          </label>
          <div style={css("display:flex;flex-wrap:wrap;gap:7px;margin-top:2px")}>
            {INTERESTS.map((interest) => {
              const on = values.interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  aria-pressed={on}
                  style={css(
                    "cursor:pointer;font:inherit;font-size:12.5px;line-height:1.3;padding:6px 12px;border-radius:999px;transition:background .2s,border-color .2s;" +
                      (on
                        ? "border:1px solid var(--color-accent);background:var(--color-accent-100);color:var(--color-accent-800)"
                        : "border:1px solid var(--color-divider);background:transparent;color:var(--color-text)")
                  )}
                >
                  {interest}
                </button>
              );
            })}
          </div>
          <div
            style={css(
              "font-size:11px;line-height:1.5;margin-top:6px;color:color-mix(in srgb, var(--color-text) 52%, transparent)"
            )}
          >
            It helps Iris choose what to write about next.
          </div>
        </div>

        <Field id="ldp-note" label="Anything else she should know?" optional error={fieldErrs.interests_note}>
          <textarea className="input" id="ldp-note" name="interests_note" rows={3} maxLength={600}
            value={values.interests_note} onChange={onChange}
            placeholder="A place you love, a story you want, a person to write to" />
        </Field>

        <hr className="hr" style={css("margin:var(--space-2) 0")} />

        <Field id="ldp-code" label="Have a code?" optional error={fieldErrs.promo_code}
          hint="For readers who were here in September — it works from the number you signed up with.">
          <input className="input" id="ldp-code" name="promo_code" type="text"
            value={values.promo_code}
            onChange={(e) => set("promo_code", e.target.value.toUpperCase())}
            placeholder="FOUNDING15" style={css("letter-spacing:.06em")} />
        </Field>

        <div className="field">
          <label className="radio" style={css("cursor:pointer")}>
            <input type="checkbox" checked={values.is_gift}
              onChange={(e) => set("is_gift", e.target.checked)}
              style={css("position:static;opacity:1;width:auto;height:auto;pointer-events:auto;accent-color:var(--color-accent)")} />
            <span style={css("font-size:14px")}>This is a gift for somebody else</span>
          </label>
          {values.is_gift && (
            <div style={css("margin-top:var(--space-3)")}>
              <Field id="ldp-gift" label="A line to go in with it"
                error={fieldErrs.gift_message}
                hint="Iris copies it onto a card and tucks it into the first envelope.">
                <textarea className="input" id="ldp-gift" name="gift_message" rows={3}
                  maxLength={600} required value={values.gift_message} onChange={onChange}
                  placeholder="For Ammu, who reads everything twice — happy birthday." />
              </Field>
            </div>
          )}
        </div>

        <Notice>{formError}</Notice>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}
          style={css("padding:13px 22px;font-size:15px;margin-top:var(--space-2)")}>
          {busy ? "Just a moment…" : "Continue"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={startOver} style={css("font-size:13px")}>
          &larr; I&rsquo;m not in India
        </button>
      </form>
    );
  }

  /* ── India: payment ──────────────────────────────────────────────────── */
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
              <strong>Nothing has been charged.</strong> Your place for this month is held under
              the reference below &mdash; keep it if you write to us.
            </p>
            <div
              style={css(
                "display:flex;align-items:baseline;gap:12px;padding:11px 14px;border:1px solid var(--color-divider);border-radius:var(--radius-md);background:var(--color-bg)"
              )}
            >
              <span
                style={css(
                  "font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:color-mix(in srgb, var(--color-text) 52%, transparent)"
                )}
              >
                Reference
              </span>
              <span style={css("font-size:16px;letter-spacing:.05em;font-feature-settings:'tnum'")}>
                {subscription.reference}
              </span>
            </div>
            <p
              style={css(
                "font-size:13px;line-height:1.7;margin:var(--space-3) 0 0;color:color-mix(in srgb, var(--color-text) 65%, transparent)"
              )}
            >
              When it opens, your subscription costs {amount}, including delivery anywhere in India.
            </p>
          </div>
          <button className="btn btn-secondary btn-block" type="button" onClick={startOver}
            style={css("margin-top:0")}>
            Add someone else
          </button>
        </div>
      );
    }

    return (
      <div style={gap}>
        <div style={panel}>
          <h3 style={heading}>One last step.</h3>
          <hr className="hr" />
          <div
            style={css(
              "display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding-bottom:var(--space-3);border-bottom:1px solid var(--color-divider)"
            )}
          >
            <span style={css("font-size:15px;line-height:1.6")}>
              {subscription.plan_months} {subscription.plan_months === 1 ? "month" : "months"} &mdash; from {subscription.cycle}
            </span>
            <span
              style={css(
                "font-family:var(--font-heading);font-size:clamp(22px,4vw,28px);line-height:1;white-space:nowrap"
              )}
            >
              {amount}
            </span>
          </div>
          <p
            style={css(
              "font-size:13px;line-height:1.7;margin:var(--space-3) 0 0;color:color-mix(in srgb, var(--color-text) 68%, transparent)"
            )}
          >
            Six printed pieces every month, posted to your address. Delivery within India is included. Payment
            is handled by Razorpay &mdash; card, UPI, net banking or wallet.
          </p>
        </div>

        <Notice>{formError}</Notice>

        <button className="btn btn-primary btn-block" type="button" disabled={busy}
          onClick={openCheckout}
          style={css("padding:13px 22px;font-size:15px;margin-top:var(--space-2)")}>
          {busy ? "Opening…" : `Pay ${amount}`}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => setStage("details")}
          style={css("font-size:13px")}>
          &larr; Change my details
        </button>
      </div>
    );
  }

  /* ── sealed ──────────────────────────────────────────────────────────── */
  return (
    <div
      style={css(
        "border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:clamp(22px,4vw,32px);background:var(--color-neutral-100);animation-name:ldp-rise;animation-duration:.7s;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1)"
      )}
    >
      <div style={heading}>Your envelope is addressed.</div>
      <hr className="hr" />
      <p style={css("font-size:15px;line-height:1.8;margin-bottom:var(--space-3)")}>
        Iris has your address and your payment. Your envelope goes out with this month&rsquo;s
        post, and your Wanderland Passport travels with it.
      </p>
      {subscription?.reference && (
        <p style={css("font-size:15px;line-height:1.8;margin-bottom:var(--space-3)")}>
          Your reference is{" "}
          <strong style={css("letter-spacing:.05em;font-feature-settings:'tnum'")}>
            {subscription.reference}
          </strong>
          {" "}&mdash; keep it if you ever write to us about this order.
        </p>
      )}
      <p style={css("font-size:15px;line-height:1.8;margin:0")}>
        It arrives in 5&ndash;10 working days.
      </p>
      <button className="btn btn-secondary" type="button" onClick={startOver}
        style={css("margin-top:var(--space-4)")}>
        Address another
      </button>
    </div>
  );
}
