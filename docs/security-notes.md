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
| `connect-src` | `'self' https:` | XHR/fetch to self or HTTPS. |
| `upgrade-insecure-requests` | — | Auto-upgrade any stray http URL to https. |

## Adding a third-party embed

1. Identify what the embed loads: a script? a stylesheet? an iframe? images?
2. Add its **exact origin** (scheme + host, no path) to the matching
   directive in `root-files/_headers` in the web-standards repo.
3. Commit in web-standards, then in each site run
   `git submodule update --remote standards` and commit (the pre-commit hook
   re-syncs `_headers`).
4. Verify in the browser console that no CSP violation is logged.

## `'unsafe-inline'` note

`script-src` and `style-src` include `'unsafe-inline'` because the al-folio
theme ships inline scripts/styles. This is a known trade-off; if a site
moves to nonce/hash-based inline handling, tighten this directive there and
add the site to `.standards-allow` for `_headers` so the drift check permits
the stricter policy.
