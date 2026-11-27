/*  The admin panel, at /admin.
 *
 *  Signed in with a username and password kept (hashed) in the database —
 *  accounts are made with `python -m app.create_admin`, never from here.
 *
 *    What's inside  the one photograph on the landing page's middle section
 *    Prices         the rate card: what each length costs, and what is on sale
 *    Readers        look somebody up, cancel or reinstate; Excel per month
 *    Account        change the password, sign out
 *
 *  That is the whole panel. The edition, envelope-contents, gallery and design
 *  tabs were retired in Nov 2026 along with the parts of the site they fed:
 *  the landing page is now three fixed sections, and the only thing on it that
 *  changes is the "what's inside" photograph.
 *
 *  Saving the photograph or a price also publishes: the server rewrites the
 *  site's own files through the GitHub API a few seconds later, and the host
 *  rebuilds from that. The bar under the tabs says where that has got to.
 *
 *  Loaded only when /admin is visited (see main.jsx), so none of this is in
 *  the bundle a reader downloads.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./admin.css";
import { mediaUrl } from "../api.js";
import {
  changePassword,
  downloadExport,
  getOverview,
  getPublish,
  getSession,
  listSubscriptions,
  publishNow,
  setInsideImage,
  setPlan,
  setSubscriptionStatus,
  signIn,
  signOut,
  uploadImage,
  whenSignedOut,
} from "./adminApi.js";

/* ── small helpers ─────────────────────────────────────────────────────── */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

const monthName = (cycle) => {
  const [y, m] = String(cycle || "").split("-").map(Number);
  return y && m >= 1 && m <= 12 ? `${MONTHS[m - 1]} ${y}` : cycle || "";
};

/* One action at a time per section, with its outcome shown beside it. */
function useAction() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const run = useCallback(async (fn, okText) => {
    setBusy(true);
    setMsg(null);
    try {
      const result = await fn();
      if (okText) setMsg({ tone: "ok", text: typeof okText === "function" ? okText(result) : okText });
      return result;
    } catch (err) {
      setMsg({ tone: "error", text: err.message });
      return undefined;
    } finally {
      setBusy(false);
    }
  }, []);
  return { busy, msg, setMsg, run };
}

const Msg = ({ msg }) => (msg ? <div className={`adm-msg adm-msg--${msg.tone}`} role="status">{msg.text}</div> : null);

/* ── sign in ───────────────────────────────────────────────────────────── */

function Login({ onIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { busy, msg, run } = useAction();

  const submit = async (e) => {
    e.preventDefault();
    const session = await run(() => signIn(username.trim(), password));
    if (session) onIn(session);
  };

  return (
    <div className="adm adm-login">
      <form onSubmit={submit}>
        <h1>The Little Door Post</h1>
        <p className="adm-help" style={{ textAlign: "center", margin: 0 }}>Sign in to the admin panel.</p>
        <div>
          <label className="adm-label" htmlFor="adm-user">Username</label>
          <input id="adm-user" className="adm-input" autoComplete="username" required
            value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="adm-label" htmlFor="adm-pass">Password</label>
          <input id="adm-pass" className="adm-input" type="password" autoComplete="current-password" required
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Msg msg={msg} />
        <button className="adm-btn adm-btn--primary" type="submit" disabled={busy}>
          {busy ? "Signing in… (the server may be waking up)" : "Sign in"}
        </button>
        <a href="/" className="adm-help" style={{ textAlign: "center", margin: 0 }}>&larr; Back to the site</a>
      </form>
    </div>
  );
}

/* ── what's inside ─────────────────────────────────────────────────────── */

/*  One photograph: the picture under "What's Inside ?" on the landing page.
 *
 *  Uploading replaces whatever is there — the old one is deleted, because the
 *  site only ever shows one and an orphan takes up room in the database and in
 *  the repository. Removing it puts the built-in December sheet back
 *  (react-app/public/assets/whats-inside.webp); the section is never empty,
 *  because an empty middle section would read as a broken page.
 */
function InsideTab({ data, reload }) {
  const current = data.inside?.url || null;
  const [progress, setProgress] = useState(false);
  const { busy, msg, setMsg, run } = useAction();
  const fileRef = useRef(null);

  const onFile = async (e) => {
    const file = (e.target.files || [])[0];
    e.target.value = "";
    if (!file) return;
    setMsg(null);
    setProgress(true);
    try {
      const uploaded = await uploadImage(file, { kind: "inside" });
      await setInsideImage(uploaded.id);
      setMsg({ tone: "ok", text: "Saved. It reaches the site in about a minute." });
      reload();
    } catch (err) {
      setMsg({ tone: "error", text: err.message });
    } finally {
      setProgress(false);
    }
  };

  /* Taking it off also deletes it: the server clears out the photograph it
   * was showing, so there is nothing left to tidy here. */
  const remove = async () => {
    if (!window.confirm("Take this photograph off the site? The built-in December sheet goes back up until you upload another.")) return;
    const done = await run(() => setInsideImage(null), "Removed.");
    if (done) reload();
  };

  return (
    <section className="adm-card">
      <h2>What&rsquo;s inside</h2>
      <p className="adm-help">
        The one photograph on the landing page, under &ldquo;What&rsquo;s Inside ?&rdquo; &mdash; the
        whole envelope laid out and labelled. It is shown at full width, so a tall picture suits the
        page better than a wide one, and a white background blends into the section. Uploading
        replaces what is there; removing puts the built-in December sheet back. JPEG, PNG or WebP;
        it is shrunk before it is sent, and the location a phone stores in a photo is removed.
      </p>

      <div className="adm-row" style={{ alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "0 1 320px", minWidth: 220 }}>
          {current ? (
            <img
              src={mediaUrl(current)}
              alt="What is in the envelope"
              style={{ display: "block", width: "100%", borderRadius: 6, border: "1px solid var(--adm-line, #ddd)" }}
            />
          ) : (
            <div
              style={{
                display: "grid", placeItems: "center", aspectRatio: "3 / 4", borderRadius: 6,
                border: "1px dashed #bbb", background: "#f4f2ee", color: "#777",
                fontSize: 13, textAlign: "center", padding: 16,
              }}
            >
              Nothing uploaded yet. The site is showing its built-in December sheet.
            </div>
          )}
        </div>

        <div style={{ flex: "1 1 240px", display: "grid", gap: 10, alignContent: "start" }}>
          <div>
            <button className="adm-btn adm-btn--primary" disabled={progress || busy}
              onClick={() => fileRef.current?.click()}>
              {progress ? "Uploading…" : current ? "Replace photograph" : "Upload photograph"}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onFile} />
          </div>
          {current && (
            <div>
              <button className="adm-btn adm-btn--danger" disabled={progress || busy} onClick={remove}>
                Remove it
              </button>
            </div>
          )}
          <Msg msg={msg} />
        </div>
      </div>
    </section>
  );
}

/* ── readers ───────────────────────────────────────────────────────────── */

function ReadersTab({ data }) {
  const { editions, edition } = data;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState(null);
  const [exportCycle, setExportCycle] = useState(edition.cycle);
  const list = useAction();
  const act = useAction();
  const exporting = useAction();

  const search = useCallback(async () => {
    const r = await list.run(() => listSubscriptions({ q, status }));
    if (r) setRows(r.subscriptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const changeStatus = async (row, next) => {
    const verb = next === "cancelled" ? "Cancel" : "Reinstate";
    const note = window.prompt(
      `${verb} ${row.full_name} (${row.reference})?\n\n` +
      (next === "cancelled"
        ? "They will be taken off every posting list. Refunds are done in the Razorpay dashboard. Add a note if you like:"
        : "They will be owed at least one envelope again. Add a note if you like:"),
      row.admin_note || ""
    );
    if (note === null) return;
    const done = await act.run(() => setSubscriptionStatus(row.id, next, note), `${row.full_name}: ${next === "cancelled" ? "cancelled" : "reinstated"}.`);
    if (done) search();
  };

  return (
    <>
      <section className="adm-card">
        <h2>Download readers</h2>
        <p className="adm-help">
          An Excel file with two sheets. <strong>To post</strong> (the first) lists everyone that month&rsquo;s
          envelope goes to — including readers on longer plans who joined earlier — with address, phone,
          email, Instagram, birthday and their notes. <strong>Signed up</strong> lists only the new purchases
          made in that month, with the amount paid.
        </p>
        <div className="adm-row">
          <select className="adm-select" style={{ width: "auto", minWidth: 200 }} value={exportCycle}
            onChange={(e) => setExportCycle(e.target.value)} aria-label="Month to download">
            {editions.map((e) => <option key={e.cycle} value={e.cycle}>{e.name}</option>)}
          </select>
          <button className="adm-btn adm-btn--primary" disabled={exporting.busy}
            onClick={() => exporting.run(() => downloadExport(exportCycle), "Downloaded.")}>
            {exporting.busy ? "Preparing…" : "Download Excel"}
          </button>
        </div>
        <div style={{ marginTop: 12 }}><Msg msg={exporting.msg} /></div>
      </section>

      <section className="adm-card">
        <h2>Find a reader</h2>
        <form className="adm-row" style={{ marginBottom: 14 }} onSubmit={(e) => { e.preventDefault(); search(); }}>
          <input className="adm-input" style={{ flex: "1 1 240px", width: "auto" }} placeholder="Name, email, phone, reference or Instagram"
            value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} />
          <select className="adm-select" style={{ width: "auto" }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="">Every status</option>
            <option value="active">Active</option>
            <option value="expired">Finished</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="adm-btn" type="submit" disabled={list.busy}>{list.busy ? "Searching…" : "Search"}</button>
        </form>
        <Msg msg={list.msg || act.msg} />
        {rows && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Reader</th><th>Contact</th><th>Where</th><th>Joined</th><th>Owed</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.full_name}</strong><div className="adm-help" style={{ margin: 0 }}>{r.reference}</div></td>
                    <td style={{ fontSize: 13 }}>{r.email}<br />{r.phone}{r.instagram && <><br />@{r.instagram}</>}</td>
                    <td style={{ fontSize: 13 }}>{r.city}<br />{r.country}</td>
                    <td style={{ fontSize: 13 }}>{monthName(r.cycle)}<br />{r.plan_months} mo</td>
                    <td>{r.deliveries_remaining}</td>
                    <td><span className="adm-pill adm-pill--muted">{r.status}</span></td>
                    <td style={{ textAlign: "right" }}>
                      {r.status === "active" ? (
                        <button className="adm-btn adm-btn--small adm-btn--danger" disabled={act.busy} onClick={() => changeStatus(r, "cancelled")}>Cancel</button>
                      ) : (
                        <button className="adm-btn adm-btn--small" disabled={act.busy} onClick={() => changeStatus(r, "active")}>Reinstate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="adm-help" style={{ marginTop: 10 }}>Nobody matches.</p>}
          </div>
        )}
      </section>
    </>
  );
}

/* ── prices ────────────────────────────────────────────────────────────── */

function PriceRow({ plan, onSaved }) {
  const symbol = plan.currency === "INR" ? "₹" : "$";
  const [amount, setAmount] = useState(String(plan.amount_minor / 100));
  const [active, setActive] = useState(plan.active);
  const { busy, msg, run } = useAction();
  const value = Number(amount);
  const valid = Number.isFinite(value) && value > 0 && Math.round(value * 100) === value * 100;
  const changed = valid && (Math.round(value * 100) !== plan.amount_minor || active !== plan.active);

  const save = async () => {
    const done = await run(() => setPlan(plan.region, plan.months, Math.round(value * 100), active), "Saved.");
    if (done) onSaved();
  };

  return (
    <tr>
      <td><strong>{plan.region === "india" ? "India" : "Abroad"}</strong></td>
      <td>{plan.months} {plan.months === 1 ? "month" : "months"}</td>
      <td>
        <div className="adm-row" style={{ flexWrap: "nowrap", gap: 6 }}>
          {symbol}
          <input className="adm-input" style={{ width: 100 }} inputMode="decimal" value={amount}
            onChange={(e) => setAmount(e.target.value)} aria-label="Price per month" />
        </div>
      </td>
      <td>{valid ? `${symbol}${(value * plan.months).toLocaleString("en-IN")}` : "—"}</td>
      <td>
        <label className="adm-row" style={{ gap: 6, flexWrap: "nowrap" }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> On sale
        </label>
      </td>
      <td style={{ textAlign: "right" }}>
        <button className="adm-btn adm-btn--small adm-btn--primary" disabled={!changed || busy} onClick={save}>Save</button>
        {msg && <div style={{ fontSize: 12, marginTop: 4, color: msg.tone === "error" ? "#8c2523" : "inherit" }}>{msg.text}</div>}
      </td>
    </tr>
  );
}

function PricesTab({ data, reload }) {
  return (
    <section className="adm-card">
      <h2>Prices</h2>
      <p className="adm-help">
        The price is <strong>per month</strong>; a three-month plan charges it three times, once.
        Saving here changes the price everywhere at once — the order form and the Pricing, Terms and
        Refunds pages all read it from here. A change applies to new sign-ups only; nobody already
        paid is affected.{" "}
        <strong>Founding members pay the India 12-month rate per month</strong>, whatever length
        they choose, so changing that price changes theirs too.
      </p>
      <p className="adm-help">
        <strong>&ldquo;On sale&rdquo; is also the off switch.</strong> Turn every India row off and
        the order form stops taking Indian orders; turn the Abroad row off and it stops taking
        orders from abroad.
      </p>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Where</th><th>Length</th><th>Per month</th><th>Total charged</th><th>Status</th><th /></tr></thead>
          <tbody>
            {data.plans.map((p) => (
              <PriceRow key={`${p.region}-${p.months}-${p.updated_at}`} plan={p} onSaved={reload} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ── account ───────────────────────────────────────────────────────────── */

function AccountTab({ data, onOut }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const { busy, msg, setMsg, run } = useAction();

  const submit = async (e) => {
    e.preventDefault();
    if (next.length < 10) return setMsg({ tone: "error", text: "Use at least 10 characters." });
    if (next !== again) return setMsg({ tone: "error", text: "The two new passwords do not match." });
    const done = await run(() => changePassword(current, next), "Password changed. Any other browser signed in as you has been signed out.");
    if (done) { setCurrent(""); setNext(""); setAgain(""); }
  };

  const email = data.email || {};
  return (
    <>
      <section className="adm-card">
        <h2>Change your password</h2>
        <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 380 }}>
          <div>
            <label className="adm-label" htmlFor="adm-cur">Current password</label>
            <input id="adm-cur" className="adm-input" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div>
            <label className="adm-label" htmlFor="adm-new">New password (at least 10 characters)</label>
            <input id="adm-new" className="adm-input" type="password" autoComplete="new-password" required minLength={10} value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div>
            <label className="adm-label" htmlFor="adm-again">New password again</label>
            <input id="adm-again" className="adm-input" type="password" autoComplete="new-password" required value={again} onChange={(e) => setAgain(e.target.value)} />
          </div>
          <Msg msg={msg} />
          <div><button className="adm-btn adm-btn--primary" type="submit" disabled={busy}>Change password</button></div>
        </form>
      </section>
      <section className="adm-card">
        <h3>Email</h3>
        <p className="adm-help" style={{ margin: 0 }}>
          Order emails go out via <strong>{email.transport || "nothing — email is not set up"}</strong>.
          {email.last?.at && (
            <> Last send ({new Date(email.last.at).toLocaleString()}): {email.last.ok ? "delivered to the mail service" : `failed — ${email.last.error}`}.</>
          )}
        </p>
      </section>
      <section className="adm-card">
        <button className="adm-btn adm-btn--danger" onClick={onOut}>Sign out</button>
      </section>
    </>
  );
}

/* ── the site's own files ──────────────────────────────────────────────── */

/* Where the last publish got to. A save in any tab schedules one on the
 * server; this watches it (and polls while one is due), and offers to send
 * everything right now — also how a first publish, or a failed one, is done. */
function PublishBar({ data }) {
  const [st, setSt] = useState(data?.publish);
  const { busy, run, msg } = useAction();

  useEffect(() => { setSt(data?.publish); }, [data]);

  const waiting = Boolean(st && (st.pending || st.state === "publishing"));
  useEffect(() => {
    if (!waiting) return undefined;
    const timer = setInterval(async () => {
      try { setSt(await getPublish()); } catch { /* try again next tick */ }
    }, 3000);
    return () => clearInterval(timer);
  }, [waiting]);

  const send = async () => {
    const next = await run(() => publishNow());
    if (next) setSt(next);
    else getPublish().then(setSt).catch(() => {});
  };

  if (!st) return null;

  if (!st.configured) {
    return (
      <div className="adm-msg adm-msg--error" role="status">
        <strong>The site is not being updated.</strong> Changes are saved here, but the server has no
        GITHUB_TOKEN, so nothing reaches the site. Add it in Render&rsquo;s environment — the steps are in
        backend/.env.example.
      </div>
    );
  }

  const failed = st.state === "error";
  return (
    <div className={`adm-msg adm-msg--${failed ? "error" : "ok"}`} role="status"
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
      <span>
        {waiting
          ? "Sending your changes to the site…"
          : failed
          ? <><strong>The site was not updated.</strong> {st.error}</>
          : st.state === "ok"
          ? <>{st.message}{st.url && <> <a href={st.url} target="_blank" rel="noreferrer">Commit {st.commit}</a>.</>}</>
          : "Changes you save here are sent to the site automatically."}
        {msg && msg.tone === "error" && !failed && <> {msg.text}</>}
      </span>
      <button className="adm-btn adm-btn--small" disabled={busy || waiting} onClick={send}>
        {busy ? "Sending…" : failed ? "Try again" : "Publish now"}
      </button>
    </div>
  );
}

/* ── the panel ─────────────────────────────────────────────────────────── */

const TABS = [
  ["inside", "What's inside"],
  ["prices", "Prices"],
  ["readers", "Readers"],
  ["account", "Account"],
];

function Dashboard({ onOut }) {
  const [tab, setTab] = useState(() => {
    const t = window.location.hash.slice(1);
    return TABS.some(([k]) => k === t) ? t : "inside";
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setData(await getOverview());
      setError("");
    } catch (err) {
      if (err.status !== 401) setError(err.message);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const pick = (t) => {
    setTab(t);
    window.history.replaceState(null, "", `#${t}`);
  };

  const props = { data, reload };
  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-top__bar">
          <a className="adm-top__brand" href="/" target="_blank" rel="noreferrer">The Little Door Post &#8599;</a>
          {data && <span className="adm-top__user">{data.user.username}</span>}
        </div>
        <nav className="adm-tabs" role="tablist">
          {TABS.map(([key, label]) => (
            <button key={key} role="tab" className="adm-tab" aria-selected={tab === key} onClick={() => pick(key)}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="adm-main">
        {data && <PublishBar data={data} />}
        {error && <div className="adm-msg adm-msg--error">{error} <button className="adm-btn adm-btn--small" onClick={reload}>Try again</button></div>}
        {!data && !error && <div className="adm-card"><p className="adm-help" style={{ margin: 0 }}>Loading… the server may take up to a minute to wake.</p></div>}
        {data && tab === "inside" && <InsideTab {...props} />}
        {data && tab === "prices" && <PricesTab {...props} />}
        {data && tab === "readers" && <ReadersTab {...props} />}
        {data && tab === "account" && <AccountTab {...props} onOut={onOut} />}
      </main>
    </div>
  );
}

export default function Admin() {
  const [session, setSessionState] = useState(getSession);

  useEffect(() => {
    /* Kept out of search engines, and out of the referrer of any link clicked
     * from here. */
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const title = document.title;
    document.title = "Admin · The Little Door Post";
    whenSignedOut(() => setSessionState(null));
    return () => {
      meta.remove();
      document.title = title;
    };
  }, []);

  const out = async () => {
    await signOut().catch(() => {});
    setSessionState(null);
  };

  return session ? <Dashboard onOut={out} /> : <Login onIn={setSessionState} />;
}
