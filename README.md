# web-standards

Single source of truth for the security, engineering, CI, and content
conventions shared across Allen's personal and academic sites. Adopt it once
per site; upgrade in one place; drift is caught automatically.

## Layout (v2 — layered)

| Path                                                                                   | Purpose                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/*.yml`                                                              | **Reusable CI** (`workflow_call`), **parameterized** by `runtime`/`build-cmd`/`site-dir`/`codeql-languages` so any stack can call them: build, accessibility, broken-links, Lighthouse, format-check, CodeQL, standards-drift.                                                                        |
| `core/formatting/`                                                                     | Universal formatting configs (`.editorconfig`, `.prettierrc`, `.prettierignore`) shared by **all** profiles.                                                                                                                                                                                          |
| `core/baseline-requirements.yml`                                                       | The CSP/robots/build **floor** every profile must satisfy (assertion-enforced; profiles may tighten, never loosen).                                                                                                                                                                                   |
| `root-files/`                                                                          | Universal root files not tied to a profile (`.pre-commit-config.yaml`).                                                                                                                                                                                                                               |
| `profiles/<name>/`                                                                     | A **site type**: `profile.yml` (build-cmd, site-dir, langs…), its `root-files/` (public) or `headers-requirements.yml` (generated), `caller-workflows/`, README. Ships **`jekyll-public`** (public al-folio) and **`node-private`** (private Node-generated, `noindex`, headers asserted not synced). |
| `bin/`                                                                                 | `onboard.sh --profile <name>` (wire a site up), `sync-standards.sh`, `check-drift.sh`.                                                                                                                                                                                                                |
| `ENGINEERING.baseline.md` · `docs/security-notes.md` · `CHECKLIST.md` · `CHANGELOG.md` | Docs.                                                                                                                                                                                                                                                                                                 |

## Profiles & versioning

A site declares its type in a root `.standards-profile` file. Onboard with
`bash .../bin/onboard.sh --profile <jekyll-public|node-private>`. Consumers
reference reusable workflows at the moving major tag **`@v2`** (`@v1` remains
valid as a rollback). Adding a new site type = add a `profiles/<name>/`
directory; no `core/` change.

- **[docs/BUILDING-A-SITE.md](docs/BUILDING-A-SITE.md)** — pick a profile +
  the full new-site flow (start here).
- **[docs/creating-a-profile.md](docs/creating-a-profile.md)** — add a new
  site type (profile #3+).
- **[CHECKLIST.md](CHECKLIST.md)** — condensed onboarding checklist.

## How it stays in sync (four mechanisms)

1. **Reusable workflows** — CI logic lives here; sites reference it. Zero
   manual sync; edit once, all sites follow on next run.
2. **Git submodule** — sites mount this repo at `standards/` for shared
   read-only assets and scripts. `git submodule update --remote` pulls the
   latest.
3. **Auto-synced root files** — files that must sit at a site's root are
   derived from `root-files/` by a pre-commit hook, never hand-edited.
4. **CI drift check** — `standards-drift` fails a site's build if its root
   files no longer match the authoritative copies. A per-site
   `.standards-allow` declares deliberate exemptions.

## Versioning

Consumers reference reusable workflows at the moving **`v1`** major tag
(e.g. `uses: Allenhetl/web-standards/.github/workflows/format-check.yml@v1`),
never `@main`. Non-breaking fixes ship under `v1`; breaking changes start
`v2` and sites migrate deliberately. Pin to an exact `@v1.2.3` if you want no
auto-updates. See [CHANGELOG.md](CHANGELOG.md) for the release procedure and
[SECURITY.md](SECURITY.md) for the supply-chain policy (SHA-pinned actions,
least-privilege tokens, harden-runner).

## Adopt it in a site

```bash
cd /path/to/your-site
bash /path/to/web-standards/bin/onboard.sh
# then follow the manual steps it prints
```

See [CHECKLIST.md](CHECKLIST.md) for details and how to upgrade or deviate.
