# Onboarding checklist

Bring a site into compliance with web-standards. Most of this is automated by
`bin/onboard.sh`; the manual items are called out.

## Automated (run once)

```bash
cd /path/to/your-site           # site repo root
bash /path/to/web-standards/bin/onboard.sh
```

This will:

- [ ] Add `web-standards` as the `standards/` submodule
- [ ] Copy caller-stub workflows into `.github/workflows/`
- [ ] Sync root files (`_headers`, `robots.txt`, `.editorconfig`,
      `.prettierrc`, `.prettierignore`, `.pre-commit-config.yaml`)
- [ ] Install the pre-commit auto-sync hook

## Manual (review before committing)

- [ ] **Branch ref:** caller stubs reference `@main`. If web-standards uses a
      different default branch, update the stubs.
- [ ] **Non-Jekyll site?** Add exemptions to `.standards-allow` (one filename
      per line). Common: `robots.txt` (uses Liquid), or `.prettierrc` if the
      site has no Liquid.
- [ ] **CSP:** open `docs/security-notes.md`; confirm `_headers` covers every
      third-party script/style/frame/image this site embeds. Extend the
      matching directive in web-standards if not.
- [ ] **Site config:** fill Jekyll `_config.yml` `url`/`baseurl`
      (personal site: `baseurl` empty; project site: `baseurl: /repo/`).
- [ ] **Deploy workflow:** web-standards does *not* ship a deploy workflow
      (it's host-specific). Keep the site's own deploy workflow.
- [ ] **CodeQL languages:** if the stack isn't JS + Ruby, override
      `languages` in the CodeQL caller stub.
- [ ] Commit: `git commit -m "Adopt web-standards"` and push.

## Upgrading a site to the latest standard

```bash
cd /path/to/your-site
git submodule update --remote standards
git commit -am "Bump web-standards"   # pre-commit re-syncs root files
git push                              # drift check confirms conformance
```

## Deliberately deviating

Add the filename to the site's `.standards-allow`. The sync script skips it
and the drift check permits it. Keep this list short and comment why.
