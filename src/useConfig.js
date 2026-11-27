/* The page's one read of /api/config, as a hook.
 *
 * Every part that needs it — the sign-up form, the "what's inside" picture,
 * the policy pages' prices — calls this, and getConfig() makes sure they all
 * share the one request and see the same answer. */
import { useEffect, useState } from "react";
import { getConfig } from "./api.js";
import { prices } from "./content/index.js";

export default function useConfig() {
  const [config, setConfig] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    getConfig()
      .then((c) => live && setConfig(c))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  return { config, failed };
}

/* The month a sign-up starts with. Bookkeeping, not a choice: it is the
 * calendar month the next batch goes out in, worked out by the server. */
export function useEdition() {
  const { config } = useConfig();
  return config?.edition || null;
}

/* The plans for one region, "india" or "international": the published rate
 * card at once, the live one once the API has answered. `pending` is true only
 * when there is nothing to show yet. */
export function usePlans(region) {
  const { config, failed } = useConfig();
  const live = config?.plans?.[region] || [];
  const shown = live.length ? live : prices.plans?.[region] || [];
  return { plans: shown, pending: !shown.length && !config && !failed, failed };
}

/* The rate card — the only place a price comes from: the `plans` table, by way
 * of the published prices.js or, once it answers, /api/config. Each plan is
 * { months, rate, total, rateMinor, currency }: `rate` is per month, `total`
 * what the button charges. `india` is shortest first. */
export function useRateCard() {
  const india = usePlans("india");
  const international = usePlans("international");
  const shape = (p) => ({
    months: p.months,
    rate: p.rateDisplay,
    total: p.totalDisplay,
    rateMinor: p.rateMinor,
    currency: p.currency,
  });
  return {
    india: india.plans.map(shape),
    international: international.plans.map(shape),
    pending: india.pending && international.pending,
    failed: india.failed,
  };
}
