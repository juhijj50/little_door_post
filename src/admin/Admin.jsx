/*  The admin panel, at /admin.
 *
 *  Signed in with a username and password kept (hashed) in the database —
 *  accounts are made with `python -m app.create_admin`, never from here.
 *
 *    Edition   which month is on sale; open, sold out, or move on
 *    Envelope  what is in each edition's envelope, and its photograph
 *    Gallery   upload and delete the photographs on the site
 *    Design    the colour palettes, and the hero / Meet Iris / Receive a letter pictures
 *    Readers   look somebody up, cancel or reinstate; Excel per edition
 *    Prices    the rate card
 *    Account   change the password, sign out
 *
 *  Loaded only when /admin is visited (see main.jsx), so none of this is in
 *  the bundle a reader downloads.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./admin.css";
import { mediaUrl } from "../api.js";
import { PALETTES, baseOf, headingColour } from "../theme.js";
import {
  changePassword,
  deleteMedia,
  downloadExport,
  getOverview,
  getSession,
  listSubscriptions,
  saveContents,
  setEdition,
  setPlan,
  setSiteImage,
  setSubscriptionStatus,
  setTheme,
  signIn,
  signOut,
  undoCount,
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

const shiftCycle = (cycle, by) => {
  const [y, m] = cycle.split("-").map(Number);
  const i = y * 12 + (m - 1) + by;
  return `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`;
};

const STATUS_LABEL = { open: "Open", sold_out: "Sold out" };

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

const Pill = ({ status }) => <span className={`adm-pill adm-pill--${status}`}>{STATUS_LABEL[status] || status}</span>;

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

/* ── edition ───────────────────────────────────────────────────────────── */

function EditionTab({ data, reload }) {
  const { edition, stats, editions } = data;
  const { busy, msg, run } = useAction();
  const [pickCycle, setPickCycle] = useState(edition.next.cycle);
  const [pickStatus, setPickStatus] = useState("open");
  const exporting = useAction();

  const apply = async (cycle, status) => {
    const forward = cycle > edition.cycle;
    if (forward && !window.confirm(
      `Put ${monthName(cycle)} on sale?\n\n` +
      `This counts the ${edition.name} envelopes against every reader: one-month readers ` +
      `finish, longer plans go down by one. The ${edition.name} posting list stays ` +
      `available to download.\n\nDone it by mistake? "Undo" in the table below takes it back.`
    )) return;
    if (cycle < edition.cycle && !window.confirm(
      `${monthName(cycle)} is earlier than ${edition.name}. Go back to it anyway?`
    )) return;
    const done = await run(() => setEdition(cycle, status), (r) => {
      const counted = Object.values(r.counted || {}).reduce((a, b) => a + b, 0);
      return `${monthName(cycle)} is now ${STATUS_LABEL[status].toLowerCase()}.` +
        (forward ? ` ${counted} reader${counted === 1 ? "" : "s"} counted for ${edition.name}.` : "");
    });
    if (done) reload();
  };

  /* A mistaken "Open next month", taken back. */
  const undo = async (e) => {
    if (!window.confirm(
      `Undo counting ${e.name}?\n\n` +
      `${e.posted_to} reader${e.posted_to === 1 ? "" : "s"} get the ${e.name} envelope back, ` +
      `and ${e.name} goes back on the site as it was (${STATUS_LABEL[e.status].toLowerCase()}), ` +
      `replacing ${edition.name}.\n\nUse this only if you moved on by mistake.`
    )) return;
    const done = await run(() => undoCount(e.cycle), (r) =>
      `${e.name} is back on the site. ${r.given_back} reader${r.given_back === 1 ? "" : "s"} given the envelope back.`);
    if (done) reload();
  };

  return (
    <>
      <section className="adm-card">
        <div className="adm-row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className="adm-help" style={{ margin: 0 }}>On the site right now</p>
            <h2 style={{ margin: "4px 0 8px" }}>{edition.name} edition</h2>
            <Pill status={edition.status} />
          </div>
          <button className="adm-btn" disabled={exporting.busy}
            onClick={() => exporting.run(() => downloadExport(edition.cycle), "Downloaded.")}>
            {exporting.busy ? "Preparing…" : `Download ${edition.name} (Excel)`}
          </button>
        </div>
        <Msg msg={exporting.msg} />

        <p className="adm-help" style={{ marginTop: 16 }}>
          {edition.open
            ? `Readers can subscribe now, and they get the ${edition.name} envelope first.`
            : `The site says ${edition.name} is sold out and ${edition.next.name} opens soon. Nobody can subscribe.`}
        </p>
        <div className="adm-row">
          {edition.open ? (
            <button className="adm-btn adm-btn--danger" disabled={busy} onClick={() => apply(edition.cycle, "sold_out")}>
              Mark {edition.name} sold out
            </button>
          ) : (
            <>
              <button className="adm-btn adm-btn--primary" disabled={busy} onClick={() => apply(edition.next.cycle, "open")}>
                Open {edition.next.name} &rarr;
              </button>
              <button className="adm-btn" disabled={busy} onClick={() => apply(edition.cycle, "open")}>
                Re-open {edition.name}
              </button>
            </>
          )}
        </div>
        <div style={{ marginTop: 12 }}><Msg msg={msg} /></div>

        <details style={{ marginTop: 18 }}>
          <summary className="adm-help" style={{ cursor: "pointer", margin: 0 }}>Choose a different month</summary>
          <div className="adm-row" style={{ marginTop: 12, alignItems: "flex-end" }}>
            <div>
              <label className="adm-label" htmlFor="adm-month">Edition</label>
              <input id="adm-month" type="month" className="adm-input" value={pickCycle}
                onChange={(e) => setPickCycle(e.target.value)} />
            </div>
            <div>
              <label className="adm-label" htmlFor="adm-status">Status</label>
              <select id="adm-status" className="adm-select" value={pickStatus} onChange={(e) => setPickStatus(e.target.value)}>
                <option value="open">Open</option>
                <option value="sold_out">Sold out</option>
              </select>
            </div>
            <button className="adm-btn adm-btn--primary" disabled={busy || !/^\d{4}-\d{2}$/.test(pickCycle)}
              onClick={() => apply(pickCycle, pickStatus)}>
              Save
            </button>
          </div>
        </details>
      </section>

      <section className="adm-grid">
        <div className="adm-stat"><div className="adm-stat__n">{stats.signups_this_edition}</div><div className="adm-stat__label">Paid sign-ups for {edition.name}</div></div>
        <div className="adm-stat"><div className="adm-stat__n">{stats.to_post_this_edition}</div><div className="adm-stat__label">Envelopes to post for {edition.name}</div></div>
        <div className="adm-stat"><div className="adm-stat__n">{stats.active}</div><div className="adm-stat__label">Readers still owed envelopes</div></div>
        <div className="adm-stat"><div className="adm-stat__n">{stats.unpaid_attempts}</div><div className="adm-stat__label">Sign-ups started, not yet paid</div></div>
      </section>

      <section className="adm-card">
        <h3>Every edition</h3>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Edition</th><th>Status</th><th>Paid sign-ups</th><th>Envelopes</th><th>Taken</th><th /></tr>
            </thead>
            <tbody>
              {editions.map((e) => (
                <tr key={e.cycle}>
                  <td><strong>{e.name}</strong>{e.is_current && <span className="adm-pill adm-pill--muted" style={{ marginLeft: 8 }}>on the site</span>}</td>
                  <td>{e.is_current ? <Pill status={e.status} /> : <span className="adm-help" style={{ margin: 0 }}>{e.counted ? "Posted" : "—"}</span>}</td>
                  <td>{e.signups}</td>
                  {/* On sale: everyone it goes to, longer plans included.
                    * Past: how many were sent. Not open yet: nothing until it is. */}
                  <td>
                    {e.is_current
                      ? `${stats.to_post_this_edition} to post`
                      : e.posted_to
                      ? `${e.posted_to} posted`
                      : "—"}
                  </td>
                  <td>{e.revenue.join(" + ") || "—"}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {e.can_undo && (
                      <button className="adm-btn adm-btn--small adm-btn--danger" disabled={busy} onClick={() => undo(e)}
                        style={{ marginRight: 6 }} title={`Undo moving on from ${e.name}`}>
                        Undo
                      </button>
                    )}
                    <button className="adm-btn adm-btn--small" onClick={() => exporting.run(() => downloadExport(e.cycle), "Downloaded.")}>
                      Excel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ── envelope ──────────────────────────────────────────────────────────── */

function EnvelopeTab({ data, reload }) {
  const { edition, editions } = data;
  /* The editions you can write for: every one on record, plus next month,
   * so the list can be ready before it goes on sale. */
  const choices = [...editions];
  if (!choices.some((e) => e.cycle === edition.next.cycle)) {
    choices.unshift({ cycle: edition.next.cycle, name: edition.next.name, items: edition.items, envelope_media_id: null, envelope_image: null });
  }
  const [cycle, setCycle] = useState(edition.cycle);
  const chosen = choices.find((e) => e.cycle === cycle) || edition;

  const [items, setItems] = useState(chosen.items);
  const [imageId, setImageId] = useState(chosen.envelope_media_id);
  const [imageUrl, setImageUrl] = useState(chosen.envelope_image);
  const { busy, msg, setMsg, run } = useAction();
  const upload = useAction();
  const fileRef = useRef(null);

  useEffect(() => {
    setItems(chosen.items);
    setImageId(chosen.envelope_media_id);
    setImageUrl(chosen.envelope_image);
    setMsg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle]);

  const update = (i, field, value) => setItems((list) => list.map((it, j) => (j === i ? { ...it, [field]: value } : it)));
  const move = (i, by) => setItems((list) => {
    const next = [...list];
    const [it] = next.splice(i, 1);
    next.splice(i + by, 0, it);
    return next;
  });
  const remove = (i) => setItems((list) => list.filter((_, j) => j !== i));
  const add = () => setItems((list) => [...list, { title: "", detail: "" }]);

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const row = await upload.run(() => uploadImage(file, { kind: "envelope" }), "Photo ready — press Save to put it on the site.");
    if (row) {
      setImageId(row.id);
      setImageUrl(row.url);
    }
  };

  const save = async () => {
    const clean = items.map((it) => ({ title: it.title.trim(), detail: (it.detail || "").trim() }));
    if (clean.some((it) => !it.title)) {
      setMsg({ tone: "error", text: "Every piece needs a name." });
      return;
    }
    const done = await run(() => saveContents(cycle, clean, imageId), `Saved. The ${monthName(cycle)} envelope is up to date.`);
    if (done) reload();
  };

  return (
    <section className="adm-card">
      <div className="adm-row" style={{ justifyContent: "space-between" }}>
        <h2>What&rsquo;s in the envelope</h2>
        <div style={{ minWidth: 200 }}>
          <select className="adm-select" value={cycle} onChange={(e) => setCycle(e.target.value)} aria-label="Edition">
            {choices.map((e) => (
              <option key={e.cycle} value={e.cycle}>
                {e.name}{e.cycle === edition.cycle ? " (on the site)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="adm-help">
        Shown on the site five to a row on a desktop, in this order. Name every piece plainly —
        the payment provider needs to see exactly what is being sold, so no &ldquo;mystery&rdquo; or
        &ldquo;surprise&rdquo; items.
        {cycle !== edition.cycle && ` These are for ${monthName(cycle)}; the site shows them once that edition is on sale.`}
      </p>

      <div className="adm-envelope">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((it, i) => (
            <div className="adm-item" key={i}>
              <span className="adm-item__n">{i + 1}</span>
              <div className="adm-item__fields">
                <input className="adm-input" placeholder="Name of the piece — e.g. A letter from Iris" maxLength={80}
                  value={it.title} onChange={(e) => update(i, "title", e.target.value)} aria-label={`Piece ${i + 1} name`} />
                <textarea className="adm-textarea" placeholder="One line about it (optional)" maxLength={300} rows={2}
                  value={it.detail || ""} onChange={(e) => update(i, "detail", e.target.value)} aria-label={`Piece ${i + 1} description`} />
              </div>
              <div className="adm-item__tools">
                <button className="adm-btn adm-btn--small adm-btn--ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">&uarr;</button>
                <button className="adm-btn adm-btn--small adm-btn--ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down">&darr;</button>
                <button className="adm-btn adm-btn--small adm-btn--ghost" disabled={items.length === 1} onClick={() => remove(i)} aria-label="Remove">&times;</button>
              </div>
            </div>
          ))}
          <div>
            <button className="adm-btn" onClick={add} disabled={items.length >= 20}>+ Add a piece</button>
          </div>
        </div>

        <div>
          <span className="adm-label">Photo of this envelope</span>
          <div className="adm-photo-box">
            {imageUrl ? <img src={mediaUrl(imageUrl)} alt="" /> : <span className="adm-help" style={{ margin: 0, padding: 12, textAlign: "center" }}>No photo — the site shows the standard envelope.</span>}
          </div>
          <div className="adm-row">
            <button className="adm-btn adm-btn--small" disabled={upload.busy} onClick={() => fileRef.current?.click()}>
              {upload.busy ? "Uploading…" : imageUrl ? "Replace photo" : "Upload photo"}
            </button>
            {imageUrl && (
              <button className="adm-btn adm-btn--small adm-btn--danger" onClick={() => { setImageId(null); setImageUrl(null); }}>
                Remove
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onPhoto} />
          <div style={{ marginTop: 10 }}><Msg msg={upload.msg} /></div>
        </div>
      </div>

      <div className="adm-row" style={{ marginTop: 18 }}>
        <button className="adm-btn adm-btn--primary" disabled={busy || upload.busy} onClick={save}>
          {busy ? "Saving…" : `Save the ${monthName(cycle)} envelope`}
        </button>
      </div>
      <div style={{ marginTop: 12 }}><Msg msg={msg} /></div>
    </section>
  );
}

/* ── gallery ───────────────────────────────────────────────────────────── */

function GalleryTab({ data, reload }) {
  const { gallery } = data;
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(null);
  const { busy, msg, run, setMsg } = useAction();
  const fileRef = useRef(null);

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length) return;
    let done = 0;
    const failed = [];
    setMsg(null);
    for (const file of files) {
      setProgress(`Uploading ${done + 1} of ${files.length}…`);
      try {
        await uploadImage(file, { kind: "gallery", caption: caption.trim() });
        done += 1;
      } catch (err) {
        failed.push(`${file.name}: ${err.message}`);
      }
    }
    setProgress(null);
    setCaption("");
    setMsg(failed.length
      ? { tone: "error", text: `${done} uploaded. Not uploaded — ${failed.join("; ")}` }
      : { tone: "ok", text: `${done} photo${done === 1 ? "" : "s"} added. They are on the site now.` });
    reload();
  };

  const remove = async (photo) => {
    if (!window.confirm("Delete this photo from the site? This cannot be undone.")) return;
    const ok = await run(() => deleteMedia(photo.id), "Deleted.");
    if (ok) reload();
  };

  return (
    <section className="adm-card">
      <h2>Gallery</h2>
      <p className="adm-help">
        Newest first. Photos are shrunk before they are uploaded, and the location a phone stores in
        a photo is removed. JPEG, PNG or WebP. {gallery.length} on the site.
      </p>
      <div className="adm-row" style={{ alignItems: "flex-end", marginBottom: 16 }}>
        <div style={{ flex: "1 1 260px" }}>
          <label className="adm-label" htmlFor="adm-caption">Caption (optional — also read aloud to blind visitors)</label>
          <input id="adm-caption" className="adm-input" maxLength={200} value={caption}
            onChange={(e) => setCaption(e.target.value)} placeholder="What is in the photo" />
        </div>
        <button className="adm-btn adm-btn--primary" disabled={Boolean(progress)} onClick={() => fileRef.current?.click()}>
          {progress || "Upload photos"}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={onFiles} />
      </div>
      <Msg msg={msg} />
      <div className="adm-gallery" style={{ marginTop: 14 }}>
        {gallery.map((p) => (
          <figure key={p.id}>
            <img src={mediaUrl(p.url)} alt={p.caption} loading="lazy" />
            <figcaption>{p.caption || <em>No caption</em>}</figcaption>
            <button className="adm-btn adm-btn--small adm-btn--danger" disabled={busy} onClick={() => remove(p)}>Delete</button>
          </figure>
        ))}
      </div>
      {!gallery.length && <p className="adm-help">No photos yet — the gallery section is hidden on the site until there is one.</p>}
    </section>
  );
}

/* ── design: colours and pictures ──────────────────────────────────────── */

const SLOTS = [
  {
    slot: "hero",
    title: "Top of the page",
    help: "The wide picture across the top of the home page. Use a landscape image, at least 1800px wide.",
    fallback: { src: "/assets/forest.webp", label: "The watercolour forest" },
    // The band is about six times wider than it is tall on a desktop.
    aspect: "6 / 1",
  },
  {
    slot: "meet",
    title: "Behind “Meet Iris”",
    help: "Shown as it is, across the whole section. The words sit on a pane of glass, so any picture works.",
    fallback: { colour: "var(--color-accent-800)", label: "Plain colour (the buttons’ palette)" },
    aspect: "16 / 10",
  },
  {
    slot: "subscribe",
    title: "Behind “Receive a letter”",
    help: "Shown as it is, around the sign-up form. The form sits on its own glass card, so any picture works.",
    fallback: { src: "/assets/gallery-green-seals.webp", label: "Green envelopes with wax seals" },
    aspect: "16 / 10",
  },
];

const CENTRED = { x: 50, y: 50, zoom: 100 };

/* The picture as the site will show it in its frame. Dragging it moves the
 * picture, the same as the sliders. */
function FramePreview({ src, aspect, frame, onDrag, fallbackColour, label }) {
  const box = useRef(null);
  const drag = useRef(null);

  const down = (e) => {
    if (!onDrag) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, start: frame };
  };
  const move = (e) => {
    if (!drag.current || !box.current) return;
    const { width, height } = box.current.getBoundingClientRect();
    // Dragging right shows more of the left of the picture: the point kept
    // in view moves the other way, slower when zoomed in.
    const z = drag.current.start.zoom / 100;
    const nx = drag.current.start.x - ((e.clientX - drag.current.x) / width) * 100 / z;
    const ny = drag.current.start.y - ((e.clientY - drag.current.y) / height) * 100 / z;
    onDrag({
      ...drag.current.start,
      x: Math.round(Math.min(100, Math.max(0, nx))),
      y: Math.round(Math.min(100, Math.max(0, ny))),
    });
  };
  const up = () => {
    drag.current = null;
  };

  return (
    <div
      ref={box}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      style={{
        position: "relative",
        aspectRatio: aspect,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--color-neutral-300)",
        background: fallbackColour || "var(--color-neutral-200)",
        cursor: onDrag ? "grab" : "default",
        touchAction: onDrag ? "none" : "auto",
        display: "grid",
        placeItems: "center",
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${frame.x}% ${frame.y}%`,
            transformOrigin: `${frame.x}% ${frame.y}%`,
            transform: `scale(${frame.zoom / 100})`,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      ) : (
        <span style={{ color: "#fff", fontSize: 14 }}>{label}</span>
      )}
    </div>
  );
}

const Slider = ({ label, value, min, max, onChange, suffix = "%" }) => (
  <label style={{ display: "grid", gridTemplateColumns: "110px 1fr 48px", alignItems: "center", gap: 10, fontSize: 13 }}>
    <span className="adm-label" style={{ margin: 0 }}>{label}</span>
    <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
      style={{ accentColor: "var(--color-accent-600)" }} />
    <span style={{ fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{value}{suffix}</span>
  </label>
);

function SiteImageCard({ def, current, tone, savedFrame, reload }) {
  const { busy, msg, run } = useAction();
  const fileRef = useRef(null);
  const [frame, setFrame] = useState(savedFrame || CENTRED);
  useEffect(() => setFrame(savedFrame || CENTRED), [savedFrame?.x, savedFrame?.y, savedFrame?.zoom, current]); // eslint-disable-line react-hooks/exhaustive-deps
  const saved = savedFrame || CENTRED;
  const moved = frame.x !== saved.x || frame.y !== saved.y || frame.zoom !== saved.zoom;

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const done = await run(async () => {
      const row = await uploadImage(file, { kind: "site" });
      return setSiteImage(def.slot, row.id);
    }, "Saved — it is on the site now. Drag it or use the sliders to frame it.");
    if (done) reload();
  };

  const reset = async () => {
    if (!window.confirm(`Go back to the original for "${def.title}"? Your picture will be deleted.`)) return;
    const done = await run(() => setSiteImage(def.slot, null), "Back to the original.");
    if (done) reload();
  };

  const saveFrame = async () => {
    const done = await run(
      () => setSiteImage(def.slot, undefined, undefined, { pos_x: frame.x, pos_y: frame.y, zoom: frame.zoom }),
      "Framing saved — the site shows it like this now."
    );
    if (done) reload();
  };

  const setTone = async (next) => {
    const done = await run(() => setSiteImage(def.slot, undefined, next),
      `Words are now ${next === "dark" ? "black" : "white"} on the site.`);
    if (done) reload();
  };

  const src = current ? mediaUrl(current) : def.fallback.src;
  return (
    <section className="adm-card">
      <h3>{def.title}</h3>
      <p className="adm-help">{def.help}</p>
      <FramePreview
        src={src}
        aspect={def.aspect}
        frame={current ? frame : CENTRED}
        onDrag={current ? setFrame : null}
        fallbackColour={def.fallback.colour}
        label={def.fallback.label}
      />
      <p className="adm-help" style={{ margin: "8px 0 12px" }}>
        {current
          ? "Your picture, as the site frames it on a desktop. Drag it to move it."
          : `The original: ${def.fallback.label.toLowerCase()}.`}
      </p>

      {current && (
        <div style={{ display: "grid", gap: 8, marginBottom: 14, maxWidth: 520 }}>
          <Slider label="Left ↔ right" value={frame.x} min={0} max={100} onChange={(x) => setFrame({ ...frame, x })} />
          <Slider label="Up ↕ down" value={frame.y} min={0} max={100} onChange={(y) => setFrame({ ...frame, y })} />
          <Slider label="Zoom" value={frame.zoom} min={100} max={300} onChange={(zoom) => setFrame({ ...frame, zoom })} />
          <div className="adm-row">
            <button className="adm-btn adm-btn--primary adm-btn--small" disabled={busy || !moved} onClick={saveFrame}>
              Save framing
            </button>
            <button className="adm-btn adm-btn--small" disabled={busy} onClick={() => setFrame(CENTRED)}>
              Centre it
            </button>
            {moved && (
              <button className="adm-btn adm-btn--small adm-btn--ghost" disabled={busy} onClick={() => setFrame(saved)}>
                Undo changes
              </button>
            )}
          </div>
        </div>
      )}

      <div className="adm-row">
        <button className="adm-btn" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? "Working…" : current ? "Replace picture" : "Upload a picture"}
        </button>
        {current && (
          <button className="adm-btn adm-btn--danger" disabled={busy} onClick={reset}>
            Use the original
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onFile} />

      {def.slot === "meet" && (
        <div style={{ marginTop: 16 }}>
          <span className="adm-label">Colour of the words</span>
          <div className="adm-row" role="radiogroup" aria-label="Colour of the words">
            {[["light", "White"], ["dark", "Black"]].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={tone === value}
                className={`adm-btn${tone === value ? " adm-btn--primary" : ""}`}
                disabled={busy}
                onClick={() => tone !== value && setTone(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="adm-help" style={{ margin: "6px 0 0" }}>
            White words sit on smoked glass, black words on frosted glass. Black needs a picture
            behind it &mdash; on the plain colour the words are always white.
          </p>
        </div>
      )}
      <div style={{ marginTop: 12 }}><Msg msg={msg} /></div>
    </section>
  );
}

/* ── the colour picker ─────────────────────────────────────────────────── */

/* Colours as hue (0–360), saturation and value (0–1) for the picker, and as
 * #rrggbb for everything else. */
const hexToHsv = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max };
};

const hsvToHex = ({ h, s, v }) => {
  const f = (k) => {
    const x = (k + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(x, 4 - x, 1));
  };
  return "#" + [f(5), f(3), f(1)].map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
};

/* How light a colour is, 0 (black) to 1 (white) — to warn when white button
 * text would not read on it. */
const lightness = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};

const HEX_RE = /^#[0-9a-f]{6}$/i;

function ColourPicker({ value, onChange }) {
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [text, setText] = useState(value);
  const box = useRef(null);
  const dragging = useRef(false);

  /* Follow a value set from outside (a saved colour, Undo). */
  useEffect(() => {
    if (hsvToHex(hsv) !== value.toLowerCase()) setHsv(hexToHsv(value));
    setText(value);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (next) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setText(hex);
    onChange(hex);
  };

  const fromPointer = (e) => {
    const r = box.current.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    commit({ ...hsv, s, v });
  };

  const typed = (raw) => {
    const t = raw.startsWith("#") ? raw : `#${raw}`;
    setText(t);
    if (HEX_RE.test(t)) {
      setHsv(hexToHsv(t));
      onChange(t.toLowerCase());
    }
  };

  return (
    <div style={{ display: "grid", gap: 12, width: "min(100%, 300px)" }}>
      {/* Saturation across, brightness down, in the chosen hue. */}
      <div
        ref={box}
        role="slider"
        aria-label="Shade"
        aria-valuetext={hsvToHex(hsv)}
        tabIndex={0}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        onKeyDown={(e) => {
          const step = 0.02;
          const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
          if (!moves[e.key]) return;
          e.preventDefault();
          const [ds, dv] = moves[e.key];
          commit({ ...hsv, s: Math.min(1, Math.max(0, hsv.s + ds)), v: Math.min(1, Math.max(0, hsv.v + dv)) });
        }}
        style={{
          position: "relative",
          height: 180,
          borderRadius: 12,
          cursor: "crosshair",
          touchAction: "none",
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))`,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            width: 16,
            height: 16,
            marginLeft: -8,
            marginTop: -8,
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px rgba(0,0,0,.35), 0 2px 6px rgba(0,0,0,.3)",
            background: hsvToHex(hsv),
            pointerEvents: "none",
          }}
        />
      </div>

      {/* The hue, round the colour wheel. */}
      <input
        type="range"
        min={0}
        max={359}
        value={Math.round(hsv.h)}
        aria-label="Hue"
        onChange={(e) => commit({ ...hsv, h: Number(e.target.value) })}
        className="adm-hue"
      />

      <div className="adm-row" style={{ flexWrap: "nowrap" }}>
        <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, background: hsvToHex(hsv), boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)" }} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <span className="adm-label" style={{ margin: 0 }}>Hex</span>
          <input
            className="adm-input"
            value={text}
            maxLength={7}
            spellCheck={false}
            onChange={(e) => typed(e.target.value.trim())}
            style={{ fontFamily: "ui-monospace, monospace", textTransform: "uppercase" }}
            aria-label="Hex colour"
          />
        </label>
      </div>

      {/* The named palettes, as saved colours to start from. */}
      <div>
        <span className="adm-label">Saved colours</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(PALETTES).map(([id, p]) => (
            <button
              key={id}
              type="button"
              title={p.name}
              aria-label={p.name}
              onClick={() => commit(hexToHsv(p.base))}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                padding: 0,
                cursor: "pointer",
                background: p.base,
                border: value.toLowerCase() === p.base ? "2px solid var(--color-text)" : "2px solid #fff",
                boxShadow: "0 0 0 1px rgba(0,0,0,.15)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* A stored choice (palette name or hex) as a hex for the picker, and back:
 * a colour that is exactly a palette is saved under the palette's name, so
 * Sage stays the original hand-tuned design. */
const toHex = (choice) => baseOf(choice) || PALETTES.sage.base;
const toChoice = (hex) =>
  Object.entries(PALETTES).find(([, p]) => p.base === hex.toLowerCase())?.[0] || hex.toLowerCase();

/* The four colours, in the order they are offered. `follows` are the two that
 * match the buttons until a colour is chosen for them. */
const COLOUR_PARTS = [
  { key: "buttons", label: "Buttons", help: "Every button, and the plain background behind Meet Iris." },
  { key: "headings", label: "Headings", help: "Titles, and the small capitals above them." },
  { key: "form", label: "Form", follows: true, help: "In the sign-up form: the chosen options, the savings, the round tick boxes and the steps." },
  { key: "numbers", label: "Numbers", follows: true, help: "The numbered circles in “What’s in the envelope”." },
];

function ColoursCard({ theme, reload }) {
  /* Each colour as a hex for the picker; null for "same as the buttons". */
  const start = () => ({
    buttons: toHex(theme.buttons),
    headings: toHex(theme.headings),
    form: theme.form ? toHex(theme.form) : null,
    numbers: theme.numbers ? toHex(theme.numbers) : null,
  });
  const [colours, setColours] = useState(start);
  const [editing, setEditing] = useState("buttons");
  const { busy, msg, run } = useAction();

  const set = (key) => (hex) => setColours((c) => ({ ...c, [key]: hex }));
  const shown = (key) => colours[key] || colours.buttons; // what the site will use
  const asChoice = (key) => (colours[key] ? toChoice(colours[key]) : COLOUR_PARTS.find((p) => p.key === key).follows ? "" : "sage");
  const saved = (key) => theme[key] || "";
  const changed = COLOUR_PARTS.some(({ key }) => asChoice(key) !== saved(key));
  const part = COLOUR_PARTS.find((p) => p.key === editing);
  const tooLight = lightness(colours.buttons) > 0.42;

  const save = async () => {
    const body = Object.fromEntries(COLOUR_PARTS.map(({ key }) => [key, asChoice(key)]));
    const done = await run(() => setTheme(body), "Saved — the site uses these colours now.");
    if (done) reload();
  };

  const btn = colours.buttons;
  const form = shown("form");
  const num = shown("numbers");
  return (
    <section className="adm-card">
      <h3>Colours</h3>
      <p className="adm-help">
        Pick any colour — drag in the box, slide the hue, or type a hex code. The saved colours are
        ready-made palettes; Sage is the original look.
      </p>

      <div className="adm-row" role="tablist" aria-label="Which colour" style={{ marginBottom: 6 }}>
        {COLOUR_PARTS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={editing === key}
            className={`adm-btn${editing === key ? " adm-btn--primary" : ""}`}
            onClick={() => setEditing(key)}
          >
            <span style={{ width: 14, height: 14, borderRadius: "50%", background: shown(key), boxShadow: "0 0 0 2px rgba(255,255,255,.8)" }} />
            {label}
          </button>
        ))}
      </div>
      <p className="adm-help" style={{ margin: "0 0 14px" }}>{part.help}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <div style={{ display: "grid", gap: 10 }}>
          {part.follows && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!colours[editing]}
                onChange={(e) => set(editing)(e.target.checked ? null : colours.buttons)}
                style={{ width: 18, height: 18 }}
              />
              Same as the buttons
            </label>
          )}
          <div style={{ opacity: part.follows && !colours[editing] ? 0.45 : 1, pointerEvents: part.follows && !colours[editing] ? "none" : "auto" }}>
            <ColourPicker key={editing} value={shown(editing)} onChange={set(editing)} />
          </div>
        </div>

        {/* A small piece of the site in the chosen colours. */}
        <div
          style={{
            flex: "1 1 280px",
            display: "grid",
            gap: 14,
            padding: "22px 24px",
            borderRadius: 18,
            background: "#fffdf7",
            border: "1px solid var(--color-neutral-300)",
          }}
        >
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600, color: colours.headings }}>
              Preview
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 30, lineHeight: 1.1, marginTop: 6, color: headingColour(colours.headings) }}>
              What&rsquo;s in the envelope
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: "50%",
                background: `color-mix(in oklab, ${num} 22%, #fffdf7)`, color: `color-mix(in oklab, ${num} 62%, #14110d)`,
                fontFamily: "var(--font-heading)", fontWeight: 600,
              }}
            >
              1
            </span>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17, color: headingColour(colours.headings) }}>
              A letter from Iris
            </span>
          </div>

          <div
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10,
              border: `1px solid color-mix(in oklab, ${form} 84%, #fffdf7)`, background: `color-mix(in oklab, ${form} 10%, #fffdf7)`,
            }}
          >
            <span style={{ width: 16, height: 16, borderRadius: "50%", background: form, boxShadow: "inset 0 0 0 3px #fffdf7, 0 0 0 1.5px " + form }} />
            <span style={{ flex: 1, fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17 }}>3 months</span>
            <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 999, background: `color-mix(in oklab, ${form} 22%, #fffdf7)`, color: `color-mix(in oklab, ${form} 62%, #14110d)` }}>
              You save ₹147
            </span>
          </div>

          <span
            style={{
              justifySelf: "start",
              display: "inline-flex",
              padding: "11px 22px",
              borderRadius: 999,
              color: "#fff",
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              background: `linear-gradient(180deg, color-mix(in oklab, ${btn} 84%, #fffdf7), ${btn} 55%, color-mix(in oklab, ${btn} 80%, #14110d))`,
              boxShadow: `0 6px 18px color-mix(in srgb, ${btn} 32%, transparent)`,
            }}
          >
            Receive a letter
          </span>
          {tooLight && (
            <p className="adm-help" style={{ margin: 0, color: "#8c2523" }}>
              This button colour is very light — the white writing on it may be hard to read. A
              deeper shade works better.
            </p>
          )}
        </div>
      </div>

      <div className="adm-row" style={{ marginTop: 16 }}>
        <button className="adm-btn adm-btn--primary" disabled={busy || !changed} onClick={save}>
          {busy ? "Saving…" : "Save colours"}
        </button>
        {changed && (
          <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={() => setColours(start())}>
            Undo changes
          </button>
        )}
      </div>
      <div style={{ marginTop: 12 }}><Msg msg={msg} /></div>
    </section>
  );
}

function DesignTab({ data, reload }) {
  const current = data.site_images || {};
  return (
    <>
      <section className="adm-card">
        <h2>Design</h2>
        <p className="adm-help" style={{ margin: 0 }}>
          The colours of the site, and its big pictures. Everything saves straight to the site.
          Pictures are shrunk before upload, and the location a phone stores in a photo is removed.
        </p>
      </section>
      <ColoursCard
        key={JSON.stringify(data.theme)}
        theme={data.theme || { buttons: "sage", headings: "sage", form: null, numbers: null }}
        reload={reload}
      />
      {SLOTS.map((def) => (
        <SiteImageCard
          key={def.slot}
          def={def}
          current={current[def.slot]}
          tone={current.meetText || "light"}
          savedFrame={current.frames?.[def.slot]}
          reload={reload}
        />
      ))}
    </>
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
          An Excel file with two sheets. <strong>To post</strong> (the first) lists everyone that edition&rsquo;s
          envelope goes to — including readers on longer plans who joined in an earlier month — with address, phone,
          email, Instagram, birthday and their notes. It fills in once the edition is on sale: that is when the readers
          with envelopes left are known. <strong>Signed up</strong> lists only the new purchases made for that
          edition, with the amount paid.
        </p>
        <div className="adm-row">
          <select className="adm-select" style={{ width: "auto", minWidth: 200 }} value={exportCycle}
            onChange={(e) => setExportCycle(e.target.value)} aria-label="Edition to download">
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
        Saving here changes the price everywhere at once — the order form, the Pricing, Terms and
        Refunds pages, and the section for readers abroad all read it from here. A change applies
        to new sign-ups only; nobody already paid is affected.{" "}
        <strong>Founding members pay the India 12-month rate per month</strong>, whatever length
        they choose, so changing that price changes theirs too.
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

/* ── the panel ─────────────────────────────────────────────────────────── */

const TABS = [
  ["edition", "Edition"],
  ["envelope", "Envelope"],
  ["gallery", "Gallery"],
  ["site", "Design"],
  ["readers", "Readers"],
  ["prices", "Prices"],
  ["account", "Account"],
];

function Dashboard({ onOut }) {
  const [tab, setTab] = useState(() => {
    const t = window.location.hash.slice(1);
    return TABS.some(([k]) => k === t) ? t : "edition";
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
        {error && <div className="adm-msg adm-msg--error">{error} <button className="adm-btn adm-btn--small" onClick={reload}>Try again</button></div>}
        {!data && !error && <div className="adm-card"><p className="adm-help" style={{ margin: 0 }}>Loading… the server may take up to a minute to wake.</p></div>}
        {data && tab === "edition" && <EditionTab {...props} />}
        {data && tab === "envelope" && <EnvelopeTab key={data.edition.cycle} {...props} />}
        {data && tab === "gallery" && <GalleryTab {...props} />}
        {data && tab === "site" && <DesignTab {...props} />}
        {data && tab === "readers" && <ReadersTab {...props} />}
        {data && tab === "prices" && <PricesTab {...props} />}
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
