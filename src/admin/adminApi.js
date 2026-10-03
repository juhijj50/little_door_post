/* The admin panel's side of the API.
 *
 * The session token lives in sessionStorage: it survives a reload, and is gone
 * when the tab closes. It is sent as `Authorization: Bearer …` — never in a URL,
 * where it would end up in browser history and server logs.
 *
 * A 401 from any call means the session has ended (expired, signed out
 * elsewhere, or the password changed), and the panel goes back to sign-in.
 */
import { ApiError, BASE } from "../api.js";

const KEY = "ldp.admin.session.v1";

export const getSession = () => {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(KEY) || "null");
    if (!saved?.token || new Date(saved.expires_at) <= new Date()) return null;
    return saved;
  } catch {
    return null;
  }
};

const setSession = (session) => {
  try {
    if (session) window.sessionStorage.setItem(KEY, JSON.stringify(session));
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* Private mode. The panel still works; it just will not survive a reload. */
  }
};

/* The API sleeps on Render's free tier and answers 502 while it wakes. */
const WAKING = new Set([0, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let onSignedOut = () => {};
export const whenSignedOut = (fn) => {
  onSignedOut = fn;
};

async function call(path, { method = "GET", json, body, headers = {}, as = "json", retry = method === "GET" } = {}) {
  const session = getSession();
  const init = {
    method,
    headers: {
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : body,
  };

  for (let attempt = 0; ; attempt += 1) {
    let res;
    try {
      res = await fetch(BASE + path, init);
    } catch {
      res = null;
    }
    const status = res ? res.status : 0;
    if (retry && WAKING.has(status) && attempt < 6) {
      await sleep([1500, 3000, 5000, 8000, 12000, 15000][attempt]);
      continue;
    }
    if (!res) throw new ApiError("The server could not be reached. Check your connection.");

    if (res.status === 401 && path !== "/admin/login") {
      setSession(null);
      onSignedOut();
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(data.error || `Something went wrong (${res.status}).`, {
        status: res.status,
        fields: data.fields || {},
        payload: data,
      });
    }
    return as === "blob" ? res : res.json();
  }
}

export const signIn = async (username, password) => {
  const session = await call("/admin/login", {
    method: "POST",
    json: { username, password },
    retry: true,
  });
  setSession(session);
  return session;
};

export const signOut = async () => {
  try {
    await call("/admin/logout", { method: "POST" });
  } finally {
    setSession(null);
  }
};

export const changePassword = (current_password, new_password) =>
  call("/admin/password", { method: "POST", json: { current_password, new_password } });

export const getOverview = () => call("/admin/overview");

export const setEdition = (cycle, status) =>
  call("/admin/edition", { method: "PUT", json: { cycle, status } });

export const undoCount = (cycle) => call(`/admin/editions/${cycle}/undo`, { method: "POST" });

export const saveContents = (cycle, items, envelope_media_id) =>
  call(`/admin/editions/${cycle}`, { method: "PUT", json: { items, envelope_media_id } });

export const listSubscriptions = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  return call(`/admin/subscriptions?${query}`);
};

export const setSubscriptionStatus = (id, status, note) =>
  call(`/admin/subscriptions/${id}/status`, { method: "POST", json: { status, note: note || null } });

export const setPlan = (region, months, amount_minor, active) =>
  call(`/admin/plans/${region}/${months}`, { method: "PUT", json: { amount_minor, active } });

/* The hero picture, or a section background: slot is hero | meet | subscribe.
 * A null id puts the site's built-in one back; leave it undefined to change
 * only the text colour ("light" or "dark"). Only what is passed is sent. */
export const setSiteImage = (slot, media_id, text_tone, frame) =>
  call(`/admin/site-images/${slot}`, {
    method: "PUT",
    json: {
      ...(media_id !== undefined ? { media_id } : {}),
      ...(text_tone !== undefined ? { text_tone } : {}),
      /* { pos_x, pos_y, zoom }: where the picture sits in its frame. */
      ...(frame || {}),
    },
  });

/* The colour palettes of the buttons and the headings, by name. */
export const setTheme = (theme) => call("/admin/theme", { method: "PUT", json: theme });

export const deleteMedia = (id) => call(`/admin/media/${id}`, { method: "DELETE" });

/* ── photographs ─────────────────────────────────────────────────────────── */

/* A phone photo is 3–8 MB and 4000px wide; the site never shows one wider
 * than about 1600. Redrawn on a canvas at that size it is a few hundred
 * kilobytes — and the redraw also drops the photo's metadata, including the
 * GPS position a phone writes into every picture it takes. */
const MAX_SIDE = 1800;
/* The hero and the section backgrounds fill the whole width of a large
 * screen, so they are kept larger. */
const MAX_SIDE_WIDE = 2400;

export async function shrinkImage(file, maxSide = MAX_SIDE) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new ApiError(`${file.name} is not an image this browser can open.`));
      el.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

    const encode = (type, quality) =>
      new Promise((resolve) => canvas.toBlob(resolve, type, quality));
    /* WebP where the browser can write it; Safari quietly hands back a PNG
     * instead, which is far bigger than a JPEG of a photograph. */
    let blob = await encode("image/webp", 0.84);
    if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg", 0.86);
    if (!blob) throw new ApiError(`${file.name} could not be prepared for upload.`);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const uploadImage = async (file, { kind = "gallery", caption = "" } = {}) => {
  const blob = await shrinkImage(file, kind === "site" ? MAX_SIDE_WIDE : MAX_SIDE);
  const query = new URLSearchParams({ kind, ...(caption ? { caption } : {}) });
  return call(`/admin/media?${query}`, {
    method: "POST",
    body: blob,
    headers: { "Content-Type": blob.type },
  });
};

/* ── the export ──────────────────────────────────────────────────────────── */

export const downloadExport = async (cycle) => {
  const res = await call(`/admin/editions/${cycle}/export`, { as: "blob" });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `little-door-post-${cycle}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
