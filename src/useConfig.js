/* The page's one read of /api/config, as a hook.
 *
 * Every section that needs it — the edition banner, the envelope, the gallery,
 * the sign-up form, the policy pages' prices — calls this, and getConfig()
 * makes sure they all share the one request and see the same answer. */
import { useEffect, useState } from "react";
import { getConfig } from "./api.js";

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

/* The rate card, live from the `plans` table — the only place a price comes
 * from. Each plan is { months, rate, total, rateMinor, currency }: `rate` is
 * per month, `total` what the button charges. `india` is shortest first. */
export function useRateCard() {
  const { config, failed } = useConfig();
  const shape = (p) => ({
    months: p.months,
    rate: p.rateDisplay,
    total: p.totalDisplay,
    rateMinor: p.rateMinor,
    currency: p.currency,
  });
  return {
    india: (config?.plans?.india || []).map(shape),
    international: (config?.plans?.international || []).map(shape),
    pending: !config && !failed,
    failed,
  };
}
