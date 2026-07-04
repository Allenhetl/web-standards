// Theme: allen-blue — the personal al-folio site (allenhtl.com).
// Values are the EXACT current rendered values so migration is a pure rename:
//   light  → from the site's own main.scss :root (wins in light mode)
//   dark   → accent/shadows from main.scss's dark block; bg/text/border/
//            surface/code from al-folio's _sass/_themes.scss dark block
//            (which is what actually renders in dark today).
// Raw keys are private to this theme; only `semantic` is the shared interface.

export const theme = {
  name: "allen-blue",

  // Optional: webfont <link> is owned by the site's head.liquid (_config.yml),
  // NOT emitted by the generator — see spec. Declared here for documentation.
  fonts: {
    note: "Bricolage Grotesque / Hanken Grotesk / JetBrains Mono load via head <link>; the SCSS target emits stacks only, no @import.",
  },

  // --- RAW: palette + fonts + scale primitives (light + *_dark siblings) ---
  raw: {
    // brand blue
    blue600: "#2f4bd8",
    blue700: "#1f37b0",
    blue300: "#8da4ff", // dark accent
    blue200: "#aab8ff", // dark hover
    // neutrals
    paper: "#fdfcfa",
    white: "#ffffff",
    ink: "#18191d",
    inkMuted: "#5c5e68",
    hairline: "#e9e7e1",
    // dark neutrals (from _themes.scss)
    grey1c: "#1c1c1d", // dark bg  ($grey-color-dark)
    grey900: "#212529", // dark surface ($grey-900)
    greyLight: "#e8e8e8", // dark text ($grey-color-light)
    grey828: "#828282", // dark text-muted ($grey-color)
    divider424: "#424246", // dark divider
    // code surface (al-folio $code-bg-color; purple tint — NOT accent-blue)
    codeLight: "rgba(181, 9, 172, 0.05)",
    codeDark: "#2c3237",
    // accent alpha steps
    wash: "rgba(47, 75, 216, 0.05)",
    washDark: "rgba(141, 164, 255, 0.06)",
    tint: "rgba(47, 75, 216, 0.09)",
    tintDark: "rgba(141, 164, 255, 0.1)",
    glow: "rgba(47, 75, 216, 0.4)",
    glowDark: "rgba(141, 164, 255, 0.45)",
    // fonts
    fontDisplay:
      '"Bricolage Grotesque", "Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    fontBody:
      '"Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    fontMono:
      '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    // motion
    easeStandard: "cubic-bezier(0.2, 0.7, 0.2, 1)",
    easeSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    durFast: "0.18s",
    durQuick: "0.22s",
    durBase: "0.3s",
    durMed: "0.4s",
    durSlow: "0.55s",
    durSlower: "0.7s",
    durSlowest: "0.85s",
    // shape
    radiusSm: "4px",
    radiusMd: "6px",
    radiusLg: "14px",
    // space (rem-based 4px rhythm; respects user font-size)
    space1: "0.25rem",
    space2: "0.5rem",
    space3: "0.75rem",
    space4: "1rem",
    space5: "1.5rem",
    space6: "3rem",
    // focus (composite references other emitted vars → adapts to theme + mode)
    focusW: "2px",
    focusOffset: "2px",
    focusColor: "var(--accent)",
    focusRing: "0 0 0 2px var(--bg), 0 0 0 4px var(--accent)",
    // elevation (light + dark)
    shadow1:
      "0 1px 2px rgba(20, 22, 45, 0.06), 0 10px 24px -16px rgba(20, 22, 45, 0.3)",
    shadow1Dark:
      "0 1px 2px rgba(0, 0, 0, 0.5), 0 10px 24px -16px rgba(0, 0, 0, 0.7)",
    shadow2:
      "0 2px 4px rgba(20, 22, 45, 0.07), 0 22px 40px -20px rgba(20, 22, 45, 0.42)",
    shadow2Dark:
      "0 2px 4px rgba(0, 0, 0, 0.5), 0 22px 40px -20px rgba(0, 0, 0, 0.7)",
    shadow3:
      "0 1px 1px rgba(20, 22, 45, 0.05), 0 2px 4px rgba(20, 22, 45, 0.05), 0 8px 16px -10px rgba(20, 22, 45, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
    shadow3Dark:
      "0 1px 1px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.4), 0 8px 16px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
  },

  // --- SEMANTIC: contract token → raw key. MUST cover all 29 contract tokens.
  semantic: {
    accent: "blue600",
    "accent-hover": "blue700",
    "text-on-accent": "white",
    bg: "paper",
    surface: "white",
    "surface-code": "codeLight",
    "text-primary": "ink",
    "text-muted": "inkMuted",
    border: "hairline",
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

  // --- DARK: partial override, contract token → dark raw key. Tokens absent
  // here inherit their light value (correct for fonts/motion/shape). Must
  // cover every contract token marked dark:"required".
  dark: {
    accent: "blue300",
    "accent-hover": "blue200",
    "text-on-accent": "white",
    bg: "grey1c",
    surface: "grey900",
    "surface-code": "codeDark",
    "text-primary": "greyLight",
    "text-muted": "grey828",
    border: "divider424",
    "accent-wash": "washDark",
    "accent-tint": "tintDark",
    "accent-glow": "glowDark",
    "shadow-1": "shadow1Dark",
    "shadow-2": "shadow2Dark",
    "shadow-3": "shadow3Dark",
  },
};

export default theme;
