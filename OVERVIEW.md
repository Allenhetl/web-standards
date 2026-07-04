# web-standards — overview

The single source of truth for how Allen's sites are built, secured, and
styled. One repo, consumed by every site via a git submodule + reusable CI,
so a change lands in one place and every site inherits it. This is the
map; each area links to its detailed doc.

## What it gives every site

| Capability                  | What you get                                                                                                                                                                                                    | Where                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Automated CI**            | Reusable workflows a site calls in 3 lines: accessibility (axe), broken-links, Lighthouse, format-check (prettier), CodeQL, build, header-assert, standards-drift. Change once → every site's next run uses it. | `.github/workflows/*.yml`                                                 |
| **Security baseline**       | Full security headers + CSP, AI-crawler-blocking robots, SHA-pinned actions + Dependabot, least-privilege tokens, harden-runner. A per-profile floor every site must meet (enforced).                           | `profiles/*/`, `core/baseline-requirements.yml`, `docs/security-notes.md` |
| **Engineering conventions** | Shared formatting (editorconfig, prettier), pre-commit, drift enforcement.                                                                                                                                      | `core/formatting/`, `root-files/`                                         |
| **Design system**           | A shared 40-token semantic **contract** (color/type/motion/shape/space/focus/shadow) + per-site **themes**; a zero-dep generator emits per-target CSS/SCSS. Structure unified, styles diverse.                  | `design-tokens/`, `design-tokens/README.md`                               |
| **Onboarding**              | `bin/onboard.sh --profile <name>` wires a new site up in one run.                                                                                                                                               | `bin/`, `docs/BUILDING-A-SITE.md`                                         |

## The one idea behind all of it: interface + implementation

Everything here is the same shape — a shared **interface** (what's common)
plus per-site **implementation** (what differs):

- **CI:** reusable workflows (interface) ← thin caller stubs per site.
- **Site types:** `core/` (interface) ← `profiles/` (jekyll-public,
  node-private).
- **Design:** the semantic token contract (interface) ← per-site themes
  (allen-blue, phd-mono).

Add a new site, site-type, or theme by adding an implementation — the
interface and everything downstream stays put.

## Layout

```
web-standards/
├── .github/workflows/   reusable CI (workflow_call) + self-CI (ci.yml)
├── core/                universal: formatting configs, baseline-requirements,
│                        assert-headers.sh
├── root-files/          universal root files (.pre-commit-config.yaml)
├── profiles/            site TYPES: jekyll-public (public al-folio),
│                        node-private (private Node/offline) — each with its
│                        profile.yml, caller-workflows, root-files or
│                        headers-requirements
├── design-tokens/       the design system: contract/ + themes/ + build/ + dist/
├── bin/                 onboard.sh, sync-standards.sh, check-drift.sh
└── docs/                BUILDING-A-SITE, creating-a-profile, security-notes
```

## Versioning

Consumers reference the moving major tag **`@v2`** (rollback: an exact
`@v2.x.y`). Additive changes bump the minor; a breaking change would start
`@v3` and sites migrate deliberately. Old majors stay alive. See
[CHANGELOG.md](CHANGELOG.md).

## Who consumes it today

| Site                       | Profile         | Theme        | Notes                                                                    |
| -------------------------- | --------------- | ------------ | ------------------------------------------------------------------------ |
| `allenhtl.com` (personal)  | `jekyll-public` | `allen-blue` | public al-folio; CI + tokens adopted                                     |
| `phd-advisor-db` (private) | `node-private`  | `phd-mono`   | offline, `noindex`, behind Cloudflare Access; generated headers asserted |

## Start here

- **New site?** → [docs/BUILDING-A-SITE.md](docs/BUILDING-A-SITE.md)
- **New site type?** → [docs/creating-a-profile.md](docs/creating-a-profile.md)
- **Design tokens?** → [design-tokens/README.md](design-tokens/README.md)
- **Security?** → [SECURITY.md](SECURITY.md), [docs/security-notes.md](docs/security-notes.md)
- **Full history?** → [CHANGELOG.md](CHANGELOG.md)
