/* Talks to the FastAPI backend in ../backend.
 *
 * In development Vite proxies /api to http://localhost:8000 (see
 * vite.config.js), so VITE_API_URL can stay empty. Set it when the API is
 * deployed to its own host — e.g. VITE_API_URL=https://post-api.example.com */
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

const request = async (path, { method = "GET", body } = {}) => {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Iris could not be reached. Check your connection and try again.");
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

export const getConfig = () => request("/config");

export const createSubscription = (payload) =>
  request("/subscriptions", { method: "POST", body: payload });

export const createOrder = (id) => request(`/subscriptions/${id}/order`, { method: "POST" });

export const verifyPayment = (id, result) =>
  request(`/subscriptions/${id}/verify`, { method: "POST", body: result });

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
