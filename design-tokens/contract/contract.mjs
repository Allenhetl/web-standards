// THE semantic contract — the shared visual interface every theme must
// implement. Site CSS writes against these names; themes map them to their
// own raw palette. See docs/DESIGN-TOKENS.md.
//
//   token     the CSS custom property name (without the leading --)
//   category  color | type | motion | shape | shadow  (emission grouping)
//   dark      "required"  → a conformant theme MUST supply a dark value
//             "invariant" → identical in light and dark (fonts, motion, shape)
//   purpose   one-line meaning (documentation + generated comments)
//
// v1 — 29 tokens, derived from the personal site's real token inventory.
// Deferred (documented in the spec, NOT in v1): a --space-* scale,
// --bp-grid-color (site-local), a --focus-ring composite.

export const CONTRACT = [
  // --- color ---------------------------------------------------------
  {
    token: "accent",
    category: "color",
    dark: "required",
    purpose: "Brand/emphasis: links, active nav, focus rings, badges.",
  },
  {
    token: "accent-hover",
    category: "color",
    dark: "required",
    purpose: "Hover/active state of the accent.",
  },
  {
    token: "text-on-accent",
    category: "color",
    dark: "required",
    purpose: "Readable foreground on top of accent fills.",
  },
  {
    token: "bg",
    category: "color",
    dark: "required",
    purpose: "Page canvas / base background.",
  },
  {
    token: "surface",
    category: "color",
    dark: "required",
    purpose: "Raised card/panel fill above --bg.",
  },
  {
    token: "surface-code",
    category: "color",
    dark: "required",
    purpose: "Code/pre/.highlight block fill (kept distinct from --surface).",
  },
  {
    token: "text-primary",
    category: "color",
    dark: "required",
    purpose: "Default body + heading ink; highest-contrast text.",
  },
  {
    token: "text-muted",
    category: "color",
    dark: "required",
    purpose: "Secondary/de-emphasized text: meta, captions.",
  },
  {
    token: "border",
    category: "color",
    dark: "required",
    purpose: "Hairline borders, dividers, rules.",
  },
  {
    token: "accent-wash",
    category: "color",
    dark: "required",
    purpose: "Faintest accent alpha (step 1/3): subtle washes.",
  },
  {
    token: "accent-tint",
    category: "color",
    dark: "required",
    purpose: "Light accent alpha (step 2/3): chips, highlighted spans.",
  },
  {
    token: "accent-glow",
    category: "color",
    dark: "required",
    purpose: "Strong accent alpha (step 3/3): hover/focus glow.",
  },

  // --- typography (invariant across modes) ---------------------------
  {
    token: "font-display",
    category: "type",
    dark: "invariant",
    purpose: "Display/heading typeface stack.",
  },
  {
    token: "font-body",
    category: "type",
    dark: "invariant",
    purpose: "Reading/body typeface stack.",
  },
  {
    token: "font-mono",
    category: "type",
    dark: "invariant",
    purpose: "Monospace typeface stack (code + technical labels).",
  },

  // --- motion (invariant) --------------------------------------------
  {
    token: "ease-standard",
    category: "motion",
    dark: "invariant",
    purpose: "House glide easing for most transitions.",
  },
  {
    token: "ease-spring",
    category: "motion",
    dark: "invariant",
    purpose: "Rare spring/overshoot easing.",
  },
  {
    token: "dur-fast",
    category: "motion",
    dark: "invariant",
    purpose: "Motion scale: micro state flips.",
  },
  {
    token: "dur-quick",
    category: "motion",
    dark: "invariant",
    purpose: "Motion scale: hover/lift.",
  },
  {
    token: "dur-base",
    category: "motion",
    dark: "invariant",
    purpose: "Motion scale: default UI transition.",
  },
  {
    token: "dur-med",
    category: "motion",
    dark: "invariant",
    purpose: "Motion scale: medium moves.",
  },
  {
    token: "dur-slow",
    category: "motion",
    dark: "invariant",
    purpose: "Motion scale: image zoom / larger moves.",
  },
  {
    token: "dur-slower",
    category: "motion",
    dark: "invariant",
    purpose: "Motion scale: wipes / entrance reveals.",
  },
  {
    token: "dur-slowest",
    category: "motion",
    dark: "invariant",
    purpose: "Motion scale: orchestrated hero entrance.",
  },

  // --- shape (invariant) ---------------------------------------------
  {
    token: "radius-sm",
    category: "shape",
    dark: "invariant",
    purpose: "Shape scale: chips, inline highlights, small controls.",
  },
  {
    token: "radius-md",
    category: "shape",
    dark: "invariant",
    purpose: "Shape scale: buttons, pills, inputs, medium cards.",
  },
  {
    token: "radius-lg",
    category: "shape",
    dark: "invariant",
    purpose: "Shape scale: large feature cards, hero panels.",
  },

  // --- shadow (dark variants differ) ---------------------------------
  {
    token: "shadow-1",
    category: "shadow",
    dark: "required",
    purpose: "Elevation: resting card (ambient + contact).",
  },
  {
    token: "shadow-2",
    category: "shadow",
    dark: "required",
    purpose: "Elevation: raised/hovered card.",
  },
  {
    token: "shadow-3",
    category: "shadow",
    dark: "required",
    purpose: "Elevation: lit floating surface with inset top-highlight.",
  },
];

// Convenience views used by the generator + checker.
export const CONTRACT_TOKENS = CONTRACT.map((t) => t.token);
export const DARK_REQUIRED = CONTRACT.filter((t) => t.dark === "required").map(
  (t) => t.token,
);
export const CATEGORY_ORDER = ["color", "type", "motion", "shape", "shadow"];
