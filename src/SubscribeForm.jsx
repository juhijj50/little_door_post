/*  The sign-up flow, in four stages:
 *
 *    region  →  is the envelope going to India or somewhere else?
 *    details →  everything Iris needs to address it
 *    pay     →  Razorpay Checkout
 *    sealed  →  confirmed
 *
 *  Readers outside India go region → waitlisted; there is no international post
 *  yet, so there is nothing to charge them for.
 *
 *  Payments are switched on by the backend, not here: /api/config reports
 *  paymentsEnabled, and each sign-up comes back with a payment block whose
 *  `enabled` flag decides between a pay button and a "not live yet" notice.
 *  Until the Razorpay keys are in backend/.env, nothing is ever charged.
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
  full_name: "", email: "", phone: "", instagram: "",
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
  const [offline, setOffline] = useState("");

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
      .catch((err) => live && setOffline(err.message));
    return () => {
      live = false;
    };
  }, []);

  /* Keep the envelope illustration addressed as they type. */
  useEffect(() => {
    onAddressChange?.({
      name: values.full_name,
      street: values.address_line1,
      cityLine: [values.city, values.pincode].filter(Boolean).join(" · "),
      country: region === "india" ? "India" : values.country,
    });
  }, [values, region, onAddressChange]);

  const set = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setFieldErrs((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

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
      full_name: clean(values.full_name),
      email: clean(values.email),
      phone: clean(values.phone),
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
      setStage(region === "india" ? "pay" : "waitlisted");
      if (region !== "india") onSealed?.();
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
        amount: payment.amount_inr * 100,
        currency: payment.currency || "INR",
        name: "The Little Door Post",
        description: `One envelope — ${subscription.cycle}`,
        prefill: {
          name: values.full_name,
          email: values.email,
          contact: values.phone,
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

  /* ── which door? ─────────────────────────────────────────────────────── */
  if (stage === "region") {
    return (
      <div style={gap}>
        <Notice tone="info">
          {offline
            ? "Iris cannot be reached right now — the sign-up desk is offline. Please try again shortly."
            : "First things first: where should the envelope be posted?"}
        </Notice>
        <button
          className="btn btn-primary btn-block"
          type="button"
          disabled={!!offline}
          onClick={() => chooseRegion("india")}
          style={css("padding:16px 22px;font-size:15px;flex-direction:column;gap:3px;margin-top:0")}
        >
          <span>Post it within India</span>
          <span style={css("font-family:var(--font-body);font-size:12px;opacity:.75")}>
            {config ? `₹${config.priceInr} for the month's envelope` : "Sign up below"}
          </span>
        </button>
        <button
          className="btn btn-secondary btn-block"
          type="button"
          disabled={!!offline}
          onClick={() => chooseRegion("international")}
          style={css("padding:16px 22px;font-size:15px;flex-direction:column;gap:3px;margin-top:0")}
        >
          <span>Post it outside India</span>
          <span style={css("font-family:var(--font-body);font-size:12px;opacity:.7")}>
            Not available yet &mdash; join the list
          </span>
        </button>
      </div>
    );
  }

  /* ── outside India: not yet ──────────────────────────────────────────── */
  if (stage === "international") {
    return (
      <form onSubmit={submitDetails} style={gap}>
        <div style={panel}>
          <h3 style={heading}>Not posting there yet.</h3>
          <hr className="hr" />
          <p style={css("font-size:15px;line-height:1.8;margin-bottom:var(--space-3)")}>
            The Little Door Post ships within India only for now. Postage and customs for other
            countries are still being worked out.
          </p>
          <p style={css("font-size:15px;line-height:1.8;margin:0")}>
            Leave your details and you&rsquo;ll be the first to hear when shipping opens. Nothing
            is charged.
          </p>
        </div>

        <Field id="ldp-i-name" label="Full name" error={fieldErrs.full_name}>
          <input className="input" id="ldp-i-name" name="full_name" type="text" required
            autoComplete="name" value={values.full_name} onChange={onChange}
            placeholder="The name on the envelope" />
        </Field>
        <div style={twoUp}>
          <Field id="ldp-i-email" label="Email" error={fieldErrs.email}>
            <input className="input" id="ldp-i-email" name="email" type="email" required
              autoComplete="email" value={values.email} onChange={onChange}
              placeholder="you@somewhere.com" />
          </Field>
          <Field id="ldp-i-country" label="Country" error={fieldErrs.country}>
            <input className="input" id="ldp-i-country" name="country" type="text" required
              autoComplete="country-name" value={values.country} onChange={onChange}
              placeholder="Where you are" />
          </Field>
        </div>
        <div style={twoUp}>
          <Field id="ldp-i-phone" label="Phone" error={fieldErrs.phone}>
            <input className="input" id="ldp-i-phone" name="phone" type="tel" required
              autoComplete="tel" value={values.phone} onChange={onChange}
              placeholder="With country code" />
          </Field>
          <Field id="ldp-i-insta" label="Instagram" optional error={fieldErrs.instagram}>
            <input className="input" id="ldp-i-insta" name="instagram" type="text"
              value={values.instagram} onChange={onChange} placeholder="@yourhandle" />
          </Field>
        </div>

        <Notice>{formError}</Notice>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}
          style={css("padding:13px 22px;font-size:15px;margin-top:var(--space-2)")}>
          {busy ? "Sending…" : "Tell me when it opens"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={startOver} style={css("font-size:13px")}>
          &larr; I&rsquo;m in India after all
        </button>
      </form>
    );
  }

  /* ── India: the details ──────────────────────────────────────────────── */
  if (stage === "details") {
    return (
      <form onSubmit={submitDetails} style={gap}>
        <Field id="ldp-name" label="Full name" error={fieldErrs.full_name}
          hint="Exactly as your post office likes it — Iris writes it by hand.">
          <input className="input" id="ldp-name" name="full_name" type="text" required
            autoComplete="name" value={values.full_name} onChange={onChange}
            placeholder="The name on the envelope" />
        </Field>

        <div style={twoUp}>
          <Field id="ldp-email" label="Email" error={fieldErrs.email}>
            <input className="input" id="ldp-email" name="email" type="email" required
              autoComplete="email" value={values.email} onChange={onChange}
              placeholder="you@somewhere.com" />
          </Field>
          <Field id="ldp-phone" label="Phone" error={fieldErrs.phone}>
            <input className="input" id="ldp-phone" name="phone" type="tel" required
              autoComplete="tel" value={values.phone} onChange={onChange}
              placeholder="For delivery only" />
          </Field>
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
    const amount = payment?.amount_inr ?? config?.priceInr;

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
              When it opens, one envelope for the month costs &#8377;{amount}, including delivery
              anywhere in India.
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
              One envelope &mdash; {subscription.cycle}
            </span>
            <span
              style={css(
                "font-family:var(--font-heading);font-size:clamp(22px,4vw,28px);line-height:1;white-space:nowrap"
              )}
            >
              &#8377;{amount}
            </span>
          </div>
          <p
            style={css(
              "font-size:13px;line-height:1.7;margin:var(--space-3) 0 0;color:color-mix(in srgb, var(--color-text) 68%, transparent)"
            )}
          >
            Six printed pieces, posted to your address. Delivery within India is included. Payment
            is handled by Razorpay &mdash; card, UPI, net banking or wallet.
          </p>
        </div>

        <Notice>{formError}</Notice>

        <button className="btn btn-primary btn-block" type="button" disabled={busy}
          onClick={openCheckout}
          style={css("padding:13px 22px;font-size:15px;margin-top:var(--space-2)")}>
          {busy ? "Opening…" : `Pay ₹${amount}`}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => setStage("details")}
          style={css("font-size:13px")}>
          &larr; Change my details
        </button>
      </div>
    );
  }

  /* ── outside India: on the list ──────────────────────────────────────── */
  if (stage === "waitlisted") {
    return (
      <div
        style={css(
          "border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:clamp(22px,4vw,32px);background:var(--color-neutral-100)"
        )}
      >
        <div style={heading}>You&rsquo;re on the list.</div>
        <hr className="hr" />
        <p style={css("font-size:15px;line-height:1.8;margin-bottom:var(--space-3)")}>
          Iris has your name and your corner of the world. The moment international shipping opens,
          you&rsquo;ll hear from her before anyone else.
        </p>
        <p style={css("font-size:15px;line-height:1.8;margin:0")}>
          Nothing has been charged &mdash; there is nothing to pay for yet.
        </p>
        <button className="btn btn-secondary" type="button" onClick={startOver}
          style={css("margin-top:var(--space-4)")}>
          Add someone else
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
