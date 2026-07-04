# Engineering Baseline

The conventions every Allenhetl site is built and maintained by. This is the
language-neutral baseline shared via the `web-standards` submodule. Each
site's own `ENGINEERING.md` should link here and add only its site-specific
specifics (host, domain, theme).

---

## 1. Security & crawling

- **`_headers`** (Cloudflare Pages): full security header set — CSP, HSTS,
  X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy, Cross-Origin-Opener-Policy — plus cache rules. When
  adding a new third-party embed, extend the matching CSP directive or it is
  blocked. See [docs/security-notes.md](docs/security-notes.md) for a
  directive-by-directive explanation.
- **`robots.txt`**: search engines allowed; AI training / dataset crawlers
  (GPTBot, ClaudeBot, CCBot, Google-Extended, PerplexityBot, …) disallowed.
- **CodeQL** runs on push/PR and weekly, scanning for code-level
  vulnerabilities.
- These files are **authoritative in web-standards** — never hand-edit the
  copies in a site root; edit the standard and re-sync.

## 2. Motion & accessibility rules

- Every animation sits behind
  `@media (prefers-reduced-motion: no-preference)` or is disabled under
  `reduce`.
- Desktop-only flourishes (custom cursor, hover spotlights, etc.) are gated
  with `min-width: 768px` and/or `(pointer: fine)` so touch devices never
  run them.
- All interactive elements keep a visible focus state.
- JS is progressive enhancement: the page must work with scripts off. Custom
  scripts are small, `defer`-loaded, and self-guarding.
- CI runs an **axe** accessibility scan and a **Lighthouse** audit
  (a11y/perf/best-practices/SEO thresholds enforced).

## 3. Code style

- **Prettier** formats everything (`.prettierrc`, printWidth 150). Run
  `npx prettier . --write` before committing; CI enforces it.
- **`.editorconfig`** pins UTF-8 + LF line endings (no CRLF churn).
- **pre-commit** runs trailing-whitespace, end-of-file, YAML, large-file
  checks, and the web-standards auto-sync hook.

## 4. Performance conventions

- Prefer responsive images (webp, `loading="lazy"`); only above-the-fold
  hero media is `eager`.
- Keep source images web-sized; very large originals slow builds and mobile
  loads.
- Strip unused CSS at build (PurgeCSS or equivalent); JS-injected / dormant
  classes must be safelisted.

## 5. CI / deploy

- Reusable workflows live in `web-standards/.github/workflows/`; each site
  calls them via thin stubs. Change the standard once → every site's next
  run picks it up.
- The **standards-drift** workflow fails the build if a site's root files no
  longer match the authoritative copies.

## 6. Before you commit — checklist

1. `npx prettier . --write`
2. Clean local build and verify the change.
3. Let pre-commit run (it auto-syncs standard root files).
4. Commit with a clear message; push to trigger CI + deploy.
