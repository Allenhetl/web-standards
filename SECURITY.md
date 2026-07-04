# Security Policy

`web-standards` defines the security baseline for Allen's personal and
academic sites, so its own supply chain is held to the same bar.

## Reporting a vulnerability

Open a private security advisory via GitHub
(**Security → Advisories → Report a vulnerability**) on this repository, or
email the maintainer. Please do not open a public issue for security
problems. Expect an acknowledgement within a few days.

## Supply-chain policy for this repo

- **Third-party GitHub Actions are pinned to a full commit SHA**, with a
  trailing `# vX.Y.Z` comment. Tags are mutable and have been abused
  (e.g. the March 2025 tj-actions/changed-files compromise moved tags to
  malicious commits); a SHA cannot be moved. GitHub-owned `actions/*` and
  `github/codeql-action` may use `@vN`.
- **Dependabot** (`.github/dependabot.yml`, `github-actions` ecosystem)
  proposes weekly PRs bumping those pins; the version comment is preserved.
- **Least-privilege tokens:** reusable workflows set top-level
  `permissions: contents: read` and elevate per-job only where required.
  Reusable-workflow permissions can only be reduced down the call chain,
  never elevated.
- **`persist-credentials: false`** on checkout so the `GITHUB_TOKEN` is not
  left in `.git/config` for later steps to read.
- **harden-runner** runs in `audit` mode on every job for runtime egress
  visibility.

## Consuming sites

Sites reference reusable workflows at the moving **`v1`** tag, get the same
hardening automatically, and run a `standards-drift` check that fails CI if
their managed root files (including the security `_headers`) drift from this
repo. See [CHANGELOG.md](CHANGELOG.md) for the release/versioning procedure
and [docs/security-notes.md](docs/security-notes.md) for CSP decisions.
