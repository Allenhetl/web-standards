# design-tokens

A shared **semantic token contract** (the visual interface every site
implements) + **per-site themes** (each site's palette/fonts), compiled by a
zero-dependency generator into per-target files. Structure unified, styles
diverse — the same `core`/`profiles` split this repo uses for CI, applied to
visual design.

## Layout

| Path                    | Purpose                                                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contract/contract.mjs` | **THE interface** — the 30 semantic token names + metadata (`category`, `dark: required\|invariant`, `purpose`). Shared by all sites.                                                              |
| `themes/<name>.mjs`     | A site's theme: private `raw` palette/fonts/scales + a `semantic` map (contract token → raw key) + a partial `dark` override. `.mjs`, not YAML — `import()` is the parser (zero-dep, no escaping). |
| `build/generate.mjs`    | Zero-dep Node generator: resolves contract + theme → per-target files; `--check` enforces conformance.                                                                                             |
| `dist/<theme>/`         | **Committed** generated artifacts (sites reference these; zero build-time dependency).                                                                                                             |

## The two tiers

- **Raw** (private per theme): `blue600: "#2f4bd8"`, `paper: "#fdfcfa"`, … +
  a dark sibling for each dark-varying value. Never referenced by site CSS.
- **Semantic** (the contract): `--accent`, `--bg`, `--text-primary`, … — the
  only surface site CSS writes against. A theme maps each to one raw key.

## Commands

```bash
cd design-tokens
node build/generate.mjs --check                 # conformance for all themes (CI gate)
node build/generate.mjs --all                   # regenerate every theme's targets
node build/generate.mjs --theme themes/allen-blue.mjs --target scss --out dist/allen-blue/
```

`--check` fails (non-zero, `::error::`) if a theme misses a contract token,
maps to an absent raw key, omits a `dark:required` dark value, or overrides a
non-contract token. Extra site-private tokens are allowed (warned). This is
the "stricter never looser" contract, mirroring the repo's headers-assert.

## Adding a theme

1. Copy `themes/allen-blue.mjs` → `themes/<name>.mjs`; edit `raw`, `semantic`,
   `dark`. It must implement **every** contract token (run `--check`).
2. Register its targets in `build/generate.mjs` `THEME_TARGETS`.
3. `node build/generate.mjs --all` and commit `dist/`.

## Adding a target format

Add a pure `model → string` emitter to `build/generate.mjs`'s `EMITTERS`
(e.g. an inlinable-CSS emitter for an offline/CSP site: `:root{}` +
`@media (prefers-color-scheme: dark)`, no `@import`). No contract or theme
change needed.

## Consuming (per site)

- **Jekyll (scss target):** `@use "tokens";` the generated `_tokens.scss`
  partial, then reference `var(--accent)` etc. Fonts load via the site's own
  head `<link>` — the generator emits stacks only, never `@import`.
- **Offline/CSP (css target, later):** inline the generated `tokens.css` into
  a `<style>`; system-font stacks only.

Regenerated output is committed — never hand-edit `dist/`; a CI regen-diff
catches drift.
