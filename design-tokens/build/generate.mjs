#!/usr/bin/env node
// generate.mjs — compile the semantic contract + one theme into per-target
// token files. Zero-dependency Node ESM: fs + dynamic import + string
// emitters. Themes/contract are .mjs modules (import() is the parser).
//
// Usage:
//   node build/generate.mjs --theme themes/allen-blue.mjs --target scss --out dist/allen-blue/
//   node build/generate.mjs --all            # every theme × its targets (from THEME_TARGETS)
//   node build/generate.mjs --check          # conformance only, no writes, non-zero on failure
//   node build/generate.mjs --all --check    # check every theme
//
// Exit codes: 0 ok · 1 conformance/usage failure.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, ".."); // design-tokens/

// Which targets each theme emits (extend as sites/profiles are added).
const THEME_TARGETS = {
  "allen-blue": [{ target: "scss", out: "dist/allen-blue" }],
  "phd-mono": [{ target: "css", out: "dist/phd-mono" }],
};

// ---------------------------------------------------------------------------
// arg parsing
function parseArgs(argv) {
  const a = { theme: null, target: null, out: null, all: false, check: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--all") a.all = true;
    else if (v === "--check") a.check = true;
    else if (v === "--theme") a.theme = argv[++i];
    else if (v === "--target") a.target = argv[++i];
    else if (v === "--out") a.out = argv[++i];
  }
  return a;
}

async function importDefault(relPath) {
  const abs = resolve(ROOT, relPath);
  const mod = await import(pathToFileURL(abs).href);
  return mod.default ?? mod.theme ?? mod.CONTRACT ?? mod;
}

// ---------------------------------------------------------------------------
// conformance check — mirrors the repo's "stricter never looser" ethos.
// Returns { errors: [], warnings: [] }.
function checkConformance(contract, theme) {
  const errors = [];
  const warnings = [];
  const contractTokens = contract.map((t) => t.token);
  const contractSet = new Set(contractTokens);
  const darkRequired = contract
    .filter((t) => t.dark === "required")
    .map((t) => t.token);
  const raw = theme.raw ?? {};
  const semantic = theme.semantic ?? {};
  const dark = theme.dark ?? {};

  // (a) every contract token present in semantic
  for (const tok of contractTokens) {
    if (!(tok in semantic))
      errors.push(
        `theme '${theme.name}': missing semantic mapping for '--${tok}'`,
      );
  }
  // (b) every semantic mapping points at a real raw key
  for (const [tok, rawKey] of Object.entries(semantic)) {
    if (!contractSet.has(tok))
      warnings.push(
        `theme '${theme.name}': extra semantic token '--${tok}' (not in contract)`,
      );
    if (!(rawKey in raw))
      errors.push(
        `theme '${theme.name}': semantic '--${tok}' → raw '${rawKey}' which is absent from raw{}`,
      );
  }
  // (c) every dark:required token has a dark ref that resolves
  for (const tok of darkRequired) {
    if (!(tok in dark))
      errors.push(
        `theme '${theme.name}': '--${tok}' is dark:required but absent from dark{}`,
      );
    else if (!(dark[tok] in raw))
      errors.push(
        `theme '${theme.name}': dark '--${tok}' → raw '${dark[tok]}' which is absent from raw{}`,
      );
  }
  // (d) dark{} must not reference a non-contract token
  for (const tok of Object.keys(dark)) {
    if (!contractSet.has(tok))
      errors.push(
        `theme '${theme.name}': dark override for '--${tok}' which is not in the contract`,
      );
  }
  return { errors, warnings };
}

// resolve the light/dark value maps for emission
function resolveModel(contract, theme) {
  const raw = theme.raw;
  const light = {};
  const dark = {};
  for (const { token } of contract) {
    light[token] = raw[theme.semantic[token]];
    if (theme.dark && token in theme.dark) dark[token] = raw[theme.dark[token]];
  }
  return { light, dark };
}

// ---------------------------------------------------------------------------
// SCSS emitter — plain CSS custom properties (Dart-Sass passthrough).
// :root{} for light + html[data-theme="dark"]{} for the tokens that change.
// Category order + labels are derived from the contract (first-appearance
// order) so a new category can never be silently dropped from emission.
const CAT_LABEL = {
  color: "Color",
  type: "Typography",
  motion: "Motion",
  shape: "Shape",
  space: "Spacing",
  focus: "Focus",
  shadow: "Elevation",
};
function categoryOrder(contract) {
  const seen = [];
  for (const t of contract)
    if (!seen.includes(t.category)) seen.push(t.category);
  return seen;
}

function emitScss(contract, theme, model) {
  const byCat = {};
  for (const t of contract) (byCat[t.category] ??= []).push(t);
  const order = categoryOrder(contract);
  const catLabel = CAT_LABEL;

  let out = "";
  out += `// GENERATED by design-tokens/build/generate.mjs — DO NOT EDIT.\n`;
  out += `// Theme: ${theme.name}. Edit the theme/contract and re-run the generator.\n`;
  out += `// The semantic layer is the shared contract; site CSS writes --token names.\n\n`;
  out += `:root {\n`;
  for (const cat of order) {
    if (!byCat[cat]) continue;
    out += `  /* ${catLabel[cat]} */\n`;
    for (const t of byCat[cat])
      out += `  --${t.token}: ${model.light[t.token]};\n`;
  }
  out += `}\n\n`;

  // dark: only tokens whose value actually changes
  const darkTokens = contract.filter((t) => t.token in model.dark);
  out += `html[data-theme="dark"] {\n`;
  for (const cat of order) {
    const inCat = darkTokens.filter((t) => t.category === cat);
    if (!inCat.length) continue;
    out += `  /* ${catLabel[cat]} */\n`;
    for (const t of inCat) out += `  --${t.token}: ${model.dark[t.token]};\n`;
  }
  out += `}\n`;
  return out;
}

// ---------------------------------------------------------------------------
// Inlinable-CSS emitter — self-contained, CSP-inline-safe. No @import, no
// external refs (system font stacks only survive). Dark is a
// @media (prefers-color-scheme: dark) block (the zero-JS strategy for an
// offline site with no theme toggle). Namespaced to avoid clashing with a
// host site's own :root vars: emitted under a `[data-ds]` opt-in? No — kept on
// :root so `var(--accent)` works site-wide, but ONLY the contract tokens are
// written, so a host's extra vars are untouched.
function emitCss(contract, theme, model) {
  const byCat = {};
  for (const t of contract) (byCat[t.category] ??= []).push(t);
  const order = categoryOrder(contract);

  let out = "";
  out += `/* GENERATED by design-tokens/build/generate.mjs — DO NOT EDIT. */\n`;
  out += `/* Theme: ${theme.name}. Semantic contract tokens; inline-safe (no @import). */\n`;
  out += `:root{\n`;
  for (const cat of order) {
    if (!byCat[cat]) continue;
    for (const t of byCat[cat])
      out += `--${t.token}:${model.light[t.token]};\n`;
  }
  out += `}\n`;

  const darkTokens = contract.filter((t) => t.token in model.dark);
  if (darkTokens.length) {
    out += `@media (prefers-color-scheme: dark){:root{\n`;
    for (const t of darkTokens) out += `--${t.token}:${model.dark[t.token]};\n`;
    out += `}}\n`;
  }
  return out;
}

const EMITTERS = {
  scss: { fn: emitScss, filename: "_tokens.scss" },
  css: { fn: emitCss, filename: "tokens.css" },
};

// ---------------------------------------------------------------------------
async function buildOne(contract, theme, target, outDir, { check }) {
  const { errors, warnings } = checkConformance(contract, theme);
  for (const w of warnings) console.log(`::warning::${w}`);
  if (errors.length) {
    for (const e of errors) console.log(`::error::${e}`);
    return { ok: false };
  }
  if (check) {
    console.log(
      `ok: theme '${theme.name}' conforms to the contract (${contract.length} tokens)`,
    );
    return { ok: true };
  }
  const emitter = EMITTERS[target];
  if (!emitter) {
    console.log(
      `::error::unknown target '${target}' (known: ${Object.keys(EMITTERS).join(", ")})`,
    );
    return { ok: false };
  }
  const model = resolveModel(contract, theme);
  const text = emitter.fn(contract, theme, model);
  mkdirSync(resolve(ROOT, outDir), { recursive: true });
  const dest = resolve(ROOT, outDir, emitter.filename);
  writeFileSync(dest, text);
  console.log(
    `wrote ${join(outDir, emitter.filename)} (${theme.name} → ${target})`,
  );
  return { ok: true };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const contract = await importDefault("contract/contract.mjs");
  if (!Array.isArray(contract)) {
    console.log(
      "::error::contract/contract.mjs must export CONTRACT (an array)",
    );
    process.exit(1);
  }

  let allOk = true;

  // --check with no explicit --theme implies checking every known theme.
  if (args.check && !args.theme) args.all = true;

  if (args.all) {
    for (const [name, targets] of Object.entries(THEME_TARGETS)) {
      const theme = await importDefault(`themes/${name}.mjs`);
      if (args.check) {
        const r = await buildOne(contract, theme, null, null, { check: true });
        allOk &&= r.ok;
      } else {
        for (const { target, out } of targets) {
          const r = await buildOne(contract, theme, target, out, {
            check: false,
          });
          allOk &&= r.ok;
        }
      }
    }
  } else {
    if (!args.theme) {
      console.log(
        "usage: generate.mjs --theme <path> --target <t> --out <dir> | --all | --check",
      );
      process.exit(1);
    }
    const theme = await importDefault(args.theme);
    if (args.check) {
      const r = await buildOne(contract, theme, null, null, { check: true });
      allOk = r.ok;
    } else {
      if (!args.target || !args.out) {
        console.log("::error::--target and --out are required unless --check");
        process.exit(1);
      }
      const r = await buildOne(contract, theme, args.target, args.out, {
        check: false,
      });
      allOk = r.ok;
    }
  }

  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.log(`::error::generator crashed: ${e.stack || e.message}`);
  process.exit(1);
});
