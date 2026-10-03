/*  The colour palettes, chosen in the admin panel's Design tab.
 *
 *  Two choices from the one list: the buttons (with the highlights that go
 *  with them — selected plans, borders, links, the Meet Iris green) and the
 *  headings (titles and the small capitals above them).
 *
 *  Each palette is a single base colour. brand-tokens.css turns it into a full
 *  ramp of shades with color-mix(), so adding a palette is one line here — and
 *  one name in backend/app/design.py, which checks what the panel saves.
 *
 *  "sage" is the original design, and leaves the hand-tuned colours in
 *  brand-tokens.css untouched.
 */
import { useEffect } from "react";

export const PALETTES = {
  sage: { name: "Sage", base: "#6b7a46" },
  forest: { name: "Forest", base: "#2f5d46" },
  teal: { name: "Teal", base: "#2a6f73" },
  periwinkle: { name: "Periwinkle", base: "#5b6bb0" },
  navy: { name: "Navy", base: "#2c3e66" },
  plum: { name: "Plum", base: "#7a4a72" },
  rose: { name: "Rose", base: "#b05a6a" },
  terracotta: { name: "Terracotta", base: "#b4603f" },
  ochre: { name: "Ochre", base: "#a87a2a" },
  cocoa: { name: "Cocoa", base: "#6e4b3a" },
  charcoal: { name: "Charcoal", base: "#3f3f46" },
};

export const DEFAULT_PALETTE = "sage";

/* The heading colour for a palette: its base deepened, so titles read as
 * titles on cream and on glass alike. */
export const headingColour = (id) =>
  `color-mix(in oklab, ${PALETTES[id]?.base || PALETTES.sage.base} 70%, #14110d)`;

const KEY = "ldp.theme.v1";

export function applyTheme(theme) {
  const root = document.documentElement;
  const buttons = PALETTES[theme?.buttons] ? theme.buttons : DEFAULT_PALETTE;
  const headings = PALETTES[theme?.headings] ? theme.headings : DEFAULT_PALETTE;

  if (buttons === DEFAULT_PALETTE) {
    delete root.dataset.buttons;
    root.style.removeProperty("--btn-base");
  } else {
    root.dataset.buttons = buttons;
    root.style.setProperty("--btn-base", PALETTES[buttons].base);
  }

  if (headings === DEFAULT_PALETTE) {
    delete root.dataset.headings;
    root.style.removeProperty("--heading-color");
    root.style.removeProperty("--heading-soft");
  } else {
    root.dataset.headings = headings;
    root.style.setProperty("--heading-color", headingColour(headings));
    root.style.setProperty("--heading-soft", PALETTES[headings].base);
  }
}

/* Remembered between visits, so a returning reader sees the chosen colours
 * at once rather than the default ones flashing first. */
export const rememberedTheme = () => {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
};

export const rememberTheme = (theme) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(theme));
  } catch {
    /* Private mode. */
  }
};

/* Apply the theme from /api/config once it arrives. */
export function useSiteTheme(config) {
  const theme = config?.theme;
  useEffect(() => {
    if (!theme) return;
    applyTheme(theme);
    rememberTheme(theme);
  }, [theme?.buttons, theme?.headings]); // eslint-disable-line react-hooks/exhaustive-deps
}
