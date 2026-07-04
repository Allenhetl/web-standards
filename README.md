# web-standards

Single source of truth for the security, engineering, CI, and content
conventions shared across Allen's personal and academic sites. Adopt it once
per site; upgrade in one place; drift is caught automatically.

## What's in here

| Path | Purpose |
| ---- | ------- |
| `.github/workflows/*.yml` | **Reusable CI** (`workflow_call`): accessibility, broken-links, Lighthouse, format-check, CodeQL, standards-drift. Sites call these; change once, every site follows. |
| `root-files/` | **Authoritative copies** of files that must live at a site's repo root: `_headers`, `robots.txt`, `.editorconfig`, `.prettierrc`, `.prettierignore`, `.pre-commit-config.yaml`. |
| `templates/workflows/` | Thin **caller stubs** a site drops into `.github/workflows/` to invoke the reusable workflows. |
| `bin/` | `onboard.sh` (wire a site up), `sync-standards.sh` (copy root files in), `check-drift.sh` (CI enforcement). |
| `ENGINEERING.baseline.md` | Language-neutral engineering baseline each site links to. |
| `docs/security-notes.md` | CSP explained directive-by-directive. |
| `CHECKLIST.md` | Onboarding steps (automated + manual). |

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
