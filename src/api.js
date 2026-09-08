/* Talks to the FastAPI backend in ../backend.
 *
 * In development Vite proxies /api to http://localhost:8000 (see
 * vite.config.js), so VITE_API_URL can stay empty. Set it when the API is
 * deployed to its own host — e.g. VITE_API_URL=https://post-api.onrender.com
 *
 * Two things here exist because the API sleeps. Render's free tier spins a
 * service down after 15 minutes idle and takes the better part of a minute to
 * wake, answering 502 while it does:
 *
 *   - retries, so a 502 mid-wake is a pause rather than a failure;
 *   - a single-flight cache for /config, so the warm-up ping fired at app load
 *     and the sign-up form's own read are one request, not two, and always
 *     agree on what came back.
 */
const ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const BASE = `${ORIGIN}/api`;

export class ApiError extends Error {
  constructor(message, { status = 0, fields = {}, payload = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
    this.payload = payload;
  }
}

/* Worth another go: no response at all (status 0), a gateway still waking, or
 * a server that asked us to slow down. A 4xx means the request itself was
 * wrong — repeating it verbatim would only get the same answer. */
const RETRYABLE = new Set([0, 408, 429, 500, 502, 503, 504]);

/* Roughly 45s of patience in total, front-loaded so a service that is merely
 * slow is caught early and one that is properly asleep is still waited out. */
const BACKOFF_MS = [1000, 2000, 4000, 8000, 15000, 15000];

/* Per attempt, not per call. A connection that hangs gets abandoned and
 * retried rather than blocking the page for as long as the browser allows. */
const ATTEMPT_TIMEOUT_MS = 20000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const attempt = async (path, { method = "GET", body } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    /* Network error, DNS failure, or our own abort — indistinguishable here,
     * and all three mean "no answer", which is worth retrying. */
    throw new ApiError("Iris could not be reached. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || "Something went wrong. Try again in a moment.", {
      status: res.status,
      fields: data.fields || {},
      payload: data,
    });
  }
  return data;
};

/* Retries are opt-in and deliberately not the default: repeating a POST that
 * did reach the server, and whose reply merely went missing, can act twice.
 * Only calls that are safe to repeat pass `retry`. */
const request = async (path, { retry = false, ...options } = {}) => {
  if (!retry) return attempt(path, options);

  for (let i = 0; ; i += 1) {
    try {
      return await attempt(path, options);
    } catch (err) {
      const last = i >= BACKOFF_MS.length;
      if (last || !RETRYABLE.has(err.status)) throw err;
      await sleep(BACKOFF_MS[i]);
    }
  }
};

/* One shared read of /config.
 *
 * Whoever asks first starts the request; everyone asking while it is in flight
 * gets that same promise, so the page makes one call and every caller sees the
 * same answer. A success is kept for the life of the page — price and sign-up
 * window do not change under the reader's feet. A failure is dropped, so the
 * next caller starts a fresh attempt rather than inheriting the error. */
let configPromise = null;

export const getConfig = () => {
  if (!configPromise) {
    configPromise = request("/config", { retry: true }).catch((err) => {
      configPromise = null;
      throw err;
    });
  }
  return configPromise;
};

/* Fired once at app load, from any page. On a sleeping free-tier service this
 * is the request that wakes it, so it is happening while the reader is still
 * scrolling — by the time they reach the form, the API is up. Failure is not
 * interesting: nothing is shown yet, and getConfig() will try again. */
export const warmUp = () => {
  getConfig().catch(() => {});
};

/* "Tell me when sign-ups open." Not retried: asking twice is harmless on the
 * server, but a silent second attempt is not worth the request. */
export const requestReminder = (payload) =>
  request("/reminders", { method: "POST", body: payload });

export const createSubscription = (payload) =>
  request("/subscriptions", { method: "POST", body: payload });

export const createOrder = (id) => request(`/subscriptions/${id}/order`, { method: "POST" });

/* Retried, unlike the other writes. This runs after Razorpay has taken the
 * money, so giving up on a dropped reply would leave a reader charged and
 * their row unpaid. The endpoint sets the same row to the same state whatever
 * happens, so repeating it is safe. */
export const verifyPayment = (id, result) =>
  request(`/subscriptions/${id}/verify`, { method: "POST", body: result, retry: true });

/* Razorpay Checkout is loaded on demand — only when there are keys to use it
 * with, so the script never loads while payments are switched off. */
let checkoutPromise = null;

export const loadRazorpayCheckout = () => {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (checkoutPromise) return checkoutPromise;

  checkoutPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => {
      checkoutPromise = null;
      reject(new ApiError("The payment window could not be loaded. Check your connection."));
    };
    document.head.appendChild(script);
  });
  return checkoutPromise;
};
