# Changelog

All notable changes to web-standards. Consumers reference the moving `v1`
tag; breaking changes will start a `v2`.

## Release procedure

```bash
# after merging changes to main:
git tag -a vX.Y.Z -m "web-standards vX.Y.Z"
git push origin vX.Y.Z
# re-point the moving major tag so all @v1 consumers get it:
git tag -f v1 vX.Y.Z
git push -f origin v1
```

Non-breaking change → bump minor/patch, keep the current major tag pointing
at it. Breaking change (renamed workflow input, removed workflow, restructure)
→ cut the next major (`vN.0.0`), create a moving `vN` tag, and let consumers
migrate `@v(N-1)` → `@vN` deliberately. **Old major tags stay alive** as
rollback paths.

---

## v2.0.0 — 2026-07-04

Layered restructure so the standard supports **multiple site types**, not
just public Jekyll. `@v1` remains valid as a fallback.

### Changed (breaking)

- **Layered layout.** Formatting configs moved to `core/formatting/`;
  profile-specific root files (`_headers`, `robots.txt`) moved under
  `profiles/<name>/root-files/`. `.pre-commit-config.yaml` stays universal
  in `root-files/`.
- **Parameterized reusable workflows.** accessibility / broken-links /
  lighthouse now accept `runtime` (`jekyll`|`node`), `build-cmd`, `site-dir`
  (defaults preserve v1 Jekyll behavior). New `build.yml` reusable workflow.
- **Profile-aware tooling.** A site declares `.standards-profile`;
  `sync-standards.sh` / `check-drift.sh` resolve that profile's root files;
  `onboard.sh --profile <name>` installs the matching caller stubs.

### Added

- `profiles/jekyll-public/` — repackages v1 behavior (public robots+sitemap,
  CDN CSP, JS+Ruby CodeQL, `bundle exec jekyll build` → `_site`).
- `core/baseline-requirements.yml` — the CSP/robots/build floor every profile
  must meet (enforcement lands with `headers-assert` in Phase 2).

### Migration (`@v1` → `@v2`)

Bump the submodule, add `.standards-profile` (e.g. `jekyll-public`), flip
caller stubs `@v1` → `@v2`. `node-private` profile + generated-header
assertion + the private site's onboarding land in Phase 2.

---

## v1.0.0 — 2026-07-04

First tagged release. Consumers should reference reusable workflows at
`@v1` (previously `@main`).

### Added

- Reusable workflows (`workflow_call`): accessibility (axe), broken-links
  (lychee), lighthouse, format-check (prettier, posts a PR comment on
  failure), codeql, standards-drift.
- Authoritative root files (`root-files/`): `_headers`, `robots.txt`,
  `.editorconfig`, `.prettierrc`, `.prettierignore`,
  `.pre-commit-config.yaml`.
- `bin/`: `onboard.sh`, `sync-standards.sh`, `check-drift.sh`.
- Caller-stub templates and a site `dependabot.yml` template.
- `ENGINEERING.baseline.md`, `docs/security-notes.md`, `SECURITY.md`.

### Security hardening

- **All third-party actions SHA-pinned** (with `# vX.Y.Z` comments):
  `ruby/setup-ruby`, `fjogeleit/yaml-update-action` (was `@main`),
  `lycheeverse/lychee-action`, `treosh/lighthouse-ci-action`,
  `thollander/actions-comment-pull-request`, `browser-actions/setup-chrome`,
  `step-security/harden-runner`. GitHub-owned `actions/*` and
  `github/codeql-action` remain at `@vN`.
- **Least privilege:** every reusable workflow declares top-level
  `permissions: contents: read`; jobs raise only what they need (CodeQL:
  `security-events: write`; format-check: `pull-requests: write`).
- **`persist-credentials: false`** on every `actions/checkout`.
- **`step-security/harden-runner`** (`egress-policy: audit`) as the first
  step of every job.
- **CSP:** `connect-src` tightened from `https:` wildcard to an explicit
  allowlist; `img-src`/`media-src`/inline-script risk acceptances
  documented in `docs/security-notes.md`.
- **`dependabot.yml`** (github-actions) to keep pins fresh.
