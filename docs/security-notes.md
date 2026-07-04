# Security notes — the CSP, directive by directive

The Content-Security-Policy in `root-files/_headers` is the tightest policy
that still lets the sites' real third-party resources load. When you add a
new embed, find the matching directive below and add its origin — do **not**
loosen with wildcards.

## Current directives

| Directive | Value | Why |
| --------- | ----- | --- |
| `default-src` | `'self'` | Deny-by-default; everything else narrows from here. |
| `base-uri` | `'self'` | Block `<base>` hijacking. |
| `object-src` | `'none'` | No Flash/plugins. |
| `frame-ancestors` | `'self'` | Anti-clickjacking (pairs with X-Frame-Options). |
| `img-src` | `'self' data: https:` | Site images, data URIs, any HTTPS image (badges, avatars). |
| `media-src` | `'self' https:` | Audio/video from self or HTTPS. |
| `font-src` | `'self' https://fonts.gstatic.com data:` | Google Fonts + inlined fonts. |
| `style-src` | `'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net cdnjs.cloudflare.com` | Theme CSS, inline styles, font + CDN stylesheets. |
| `script-src` | `'self' 'unsafe-inline' unpkg.com cdn.jsdelivr.net cdnjs.cloudflare.com giscus.app badge.dimensions.ai d1bxh8uas1mnw7.cloudfront.net` | Theme JS, model-viewer (unpkg), giscus, Dimensions/Altmetric badges. |
| `frame-src` | `https://giscus.app` | giscus comments iframe. |
| `connect-src` | `'self' giscus.app api.github.com badge.dimensions.ai d1bxh8uas1mnw7.cloudfront.net api.altmetric.com` | XHR/fetch allowlist (giscus, GitHub API for repo stats, Dimensions/Altmetric badges). |
| `upgrade-insecure-requests` | — | Auto-upgrade any stray http URL to https. |

## Documented risk acceptances

Two directives are deliberately looser than the strictest possible policy.
Both are conscious trade-offs, not oversights:

1. **`script-src` / `style-src` keep `'unsafe-inline'`.** The al-folio theme
   ships inline `<script>`/`<style>` blocks and runtime-injected inline
   `style="…"` attributes. Real hardening here means per-request nonces,
   which on static Cloudflare Pages requires a `_middleware` edge function
   that rewrites responses and injects a nonce + matching header. That is a
   higher-risk change (a misconfigured CSP white-screens the whole site), so
   it is deferred to its own focused round. When done, add `'strict-dynamic'`
   + a nonce to `script-src`, drop `'unsafe-inline'` for scripts, and (if a
   site diverges from the standard) list `_headers` in that site's
   `.standards-allow`.

2. **`img-src` / `media-src` stay `https:` (any HTTPS origin).** These are
   academic content sites that embed images and media from many origins
   (paper figures, external hosts). Images and media cannot execute
   JavaScript, so they are not an XSS vector; an allowlist here would break
   future embedded content for negligible security gain. The channel that
   *does* matter for exfiltration — `connect-src` — is an explicit allowlist.

## Adding a third-party script/style/frame/connect host

1. Identify what the embed loads: a script? a stylesheet? an iframe? a
   fetch/XHR endpoint?
2. Add its **exact origin** (scheme + host, no path) to the matching
   directive in `root-files/_headers`. (Images/media already allow any
   HTTPS origin — no change needed.)
3. Commit in web-standards, tag a release + move `v1`, then in each site run
   `git submodule update --remote standards` and commit (the pre-commit hook
   re-syncs `_headers`).
4. Verify in the browser console that no CSP violation is logged.
