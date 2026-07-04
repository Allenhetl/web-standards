# Building a new site

The one-page flow for standing up a new site on web-standards. Pick a
profile, run one command, do a short checklist. No re-deriving anything.

## 1. Pick a profile

A **profile** captures everything that differs by site _type_ (build tool,
public/private, how security headers are managed). Two ship today:

| If your site is…                                                                                   | Profile             | Build                                | robots                  | Security headers                                               | CodeQL                                         |
| -------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------ | ----------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| A **public** academic / showcase site (al-folio / Jekyll) — meant to be indexed                    | **`jekyll-public`** | `bundle exec jekyll build` → `_site` | public + sitemap        | static `_headers` (synced, drift-checked, CDN-friendly CSP)    | JS + Ruby                                      |
| A **private**, offline, `noindex` site built by a Node generator (data → HTML), served behind auth | **`node-private`**  | `npm run build` → `site`             | `Disallow: /` + noindex | **generated** by your build; CI **asserts** it meets the floor | none (private repos need GH Advanced Security) |

**Neither fits?** (e.g. a public Hugo site, or a private Jekyll site.) Don't
force-fit — add a new profile: see
[creating-a-profile.md](creating-a-profile.md). It's a small config dir, not
new logic.

Real examples: `Allenhetl.github.io` uses `jekyll-public`; `phd-advisor-db`
uses `node-private`.

## 2. Onboard (one command)

From the root of the site's git repo:

```bash
bash /path/to/web-standards/bin/onboard.sh --profile <jekyll-public|node-private>
```

This is idempotent and **commits nothing** — it stages changes for you to
review. It:

- adds `web-standards` as the `standards/` submodule,
- writes `.standards-profile` (so `sync`/`drift` resolve your profile),
- installs that profile's caller-workflow stubs into `.github/workflows/`
  (they reference the moving `@v2` tag),
- installs `.github/dependabot.yml`,
- syncs the shared root files (formatting configs, `.pre-commit-config.yaml`;
  plus `_headers`/`robots.txt` for `jekyll-public` — **skipped** for
  `node-private`, which generates them),
- installs the pre-commit auto-sync hook (if `pre-commit` is available).

## 3. Human checklist (before committing)

Common to both profiles:

- [ ] Review staged changes: `git status && git diff --staged`.
- [ ] Run the site's build locally and confirm it still builds.
- [ ] Run `bash standards/bin/check-drift.sh` — expect "No drift".
- [ ] Run `npx prettier --check .`; format authored files. **Ignore
      generated output** — add build artifacts (e.g. `site/**`, generated
      `data/**`) to `.prettierignore`'s site-specific section (below the
      marker) so they aren't linted.
- [ ] Commit, push a branch, open a PR, and confirm **CI is green** before
      merging. Never merge red or disable a check to get past it.

`jekyll-public` extras:

- [ ] Ensure `standards/` is in `_config.yml`'s `exclude:` list (or the
      submodule's `robots.txt` collides with the site's).
- [ ] Confirm the CSP in `_headers` covers this site's embeds; if you add a
      third-party script/style/frame, extend the matching directive in
      `web-standards/profiles/jekyll-public/root-files/_headers` (see
      [security-notes.md](security-notes.md)).
- [ ] Fill `_config.yml` `url`/`baseurl` (personal site: `baseurl` empty;
      project site: `baseurl: /repo/`).

`node-private` extras:

- [ ] Your build must emit `site/_headers` meeting the floor +
      `profiles/node-private/headers-requirements.yml` (`default-src 'none'`,
      `connect-src 'none'`, `X-Robots-Tag: noindex`, …). The
      `headers-assert` CI enforces this — run it locally first:
      `bash standards/core/assert-headers.sh site/_headers standards/core/baseline-requirements.yml standards/profiles/node-private/headers-requirements.yml`
- [ ] If the repo is private, keep it private and set up Cloudflare Access
      (edge auth is the real gate; the standard covers headers, not hosting).
- [ ] A headless-browser validate step, if you have one, stays a **local**
      gate unless you install the browser + its driver in CI (the default
      caller keeps `validate-cmd` empty).

## 4. Upgrading a site later

```bash
git submodule update --remote standards   # move to the latest @v2 tip
git commit -am "Bump web-standards"        # pre-commit re-syncs shared files
git push                                   # CI (drift/assert) confirms conformance
```

Sites pin to the moving **`@v2`** tag by default (rollback: an exact
`@v2.1.0`). A breaking change to the standard ships as `@v3`; you migrate
deliberately. See [../CHANGELOG.md](../CHANGELOG.md).

## 5. Deliberately deviating

Need a site to differ from its profile on one file? List that filename in the
site's root `.standards-allow` (one per line). `sync`/`drift` skip it. Keep
the list short and say why.
