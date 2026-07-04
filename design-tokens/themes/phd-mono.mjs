// Theme: phd-mono — the private phd-advisor-db site (phd.allenhtl.com).
// A deliberately DIFFERENT visual style from allen-blue (this is the whole
// point of the system: shared contract/interface, diverse styles). The site
// is dark-native (deep blue-black canvas, its own blue accent) and has no
// light/dark toggle — so light and dark values are the same here; the site
// simply always renders its one dark palette.
//
// Values are the site's existing CSS :root vocabulary, re-expressed against
// the shared contract so new components can write --accent/--surface/etc.
// The site's own hand-written CSS (--bg2/--panel/--accent2/--chip/…) is
// untouched by this — this theme only ADDS the contract interface.

export const theme = {
  name: "phd-mono",

  raw: {
    // canvas + panels (deep blue-black)
    bg: "#0e1014",
    panel: "#161922",
    panel2: "#1d212b",
    line: "#2a2f3a",
    // text
    text: "#e8eaf0",
    muted: "#9aa3b2",
    onAccent: "#0b0d12", // dark ink used on the light-blue accent fill
    // accent (its own blue — NOT allen-blue's #2f4bd8)
    accent: "#6ea8fe",
    accentD: "#3a6fd6",
    // accent alpha steps (derived from the accent hue)
    wash: "rgba(110, 168, 254, 0.06)",
    tint: "rgba(110, 168, 254, 0.12)",
    glow: "rgba(110, 168, 254, 0.3)",
    // code surface
    code: "#0b0d11",
    // fonts (system stacks only — offline/CSP, no webfonts)
    fontDisplay:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
    fontBody:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
    fontMono:
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    // motion (a calmer, smaller set — but the contract names must all exist)
    easeStandard: "cubic-bezier(0.2, 0.7, 0.2, 1)",
    easeSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    durFast: "0.12s",
    durQuick: "0.15s",
    durBase: "0.2s",
    durMed: "0.3s",
    durSlow: "0.45s",
    durSlower: "0.6s",
    durSlowest: "0.8s",
    // shape
    radiusSm: "6px",
    radiusMd: "9px",
    radiusLg: "14px",
    // space (shared 4px rhythm — same ladder as allen-blue; spacing is the
    // one axis kept consistent across sites for structural parity)
    space1: "0.25rem",
    space2: "0.5rem",
    space3: "0.75rem",
    space4: "1rem",
    space5: "1.5rem",
    space6: "3rem",
    // focus (composite references emitted vars → adapts automatically)
    focusW: "2px",
    focusOffset: "2px",
    focusColor: "var(--accent)",
    focusRing: "0 0 0 2px var(--bg), 0 0 0 4px var(--accent)",
    // elevation
    shadow1: "0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.28)",
    shadow2: "0 2px 6px rgba(0, 0, 0, 0.45), 0 18px 40px rgba(0, 0, 0, 0.38)",
    shadow3:
      "0 1px 2px rgba(0, 0, 0, 0.4), 0 6px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
  },

  // Contract interface → raw. Must cover all 30 contract tokens.
  semantic: {
    accent: "accent",
    "accent-hover": "accentD",
    "text-on-accent": "onAccent",
    bg: "bg",
    surface: "panel",
    "surface-code": "code",
    "text-primary": "text",
    "text-muted": "muted",
    border: "line",
    "accent-wash": "wash",
    "accent-tint": "tint",
    "accent-glow": "glow",
    "font-display": "fontDisplay",
    "font-body": "fontBody",
    "font-mono": "fontMono",
    "ease-standard": "easeStandard",
    "ease-spring": "easeSpring",
    "dur-fast": "durFast",
    "dur-quick": "durQuick",
    "dur-base": "durBase",
    "dur-med": "durMed",
    "dur-slow": "durSlow",
    "dur-slower": "durSlower",
    "dur-slowest": "durSlowest",
    "radius-sm": "radiusSm",
    "radius-md": "radiusMd",
    "radius-lg": "radiusLg",
    "space-1": "space1",
    "space-2": "space2",
    "space-3": "space3",
    "space-4": "space4",
    "space-5": "space5",
    "space-6": "space6",
    "focus-ring-width": "focusW",
    "focus-ring-offset": "focusOffset",
    "focus-ring-color": "focusColor",
    "focus-ring": "focusRing",
    "shadow-1": "shadow1",
    "shadow-2": "shadow2",
    "shadow-3": "shadow3",
  },

  // Dark-native site: dark values == light values (it always renders dark).
  // The contract requires a dark value for the dark:"required" tokens, so map
  // them to the same raws — the emitted @media (prefers-color-scheme:dark)
  // block is then a harmless no-op-equivalent, and the site looks identical
  // whatever the OS theme is.
  dark: {
    accent: "accent",
    "accent-hover": "accentD",
    "text-on-accent": "onAccent",
    bg: "bg",
    surface: "panel",
    "surface-code": "code",
    "text-primary": "text",
    "text-muted": "muted",
    border: "line",
    "accent-wash": "wash",
    "accent-tint": "tint",
    "accent-glow": "glow",
    "shadow-1": "shadow1",
    "shadow-2": "shadow2",
    "shadow-3": "shadow3",
  },
};

export default theme;
