# Profile: jekyll-public

For **public al-folio / Jekyll academic sites** (e.g. the personal site).

- **Build:** `bundle exec jekyll build` → `_site`
- **robots:** public, with a Liquid sitemap (search engines welcome; AI
  crawlers disallowed)
- **CSP / `_headers`:** static file with a CDN-friendly allowlist (Google
  Fonts, unpkg, giscus, jsdelivr/cdnjs, Dimensions/Altmetric)
- **CodeQL:** JavaScript/TypeScript **and** Ruby
- **Root files** (`_headers`, `robots.txt`) are synced and drift-checked
  byte-for-byte against `profiles/jekyll-public/root-files/`.

## Onboard

```bash
cd /path/to/your-site
bash /path/to/web-standards/bin/onboard.sh --profile jekyll-public
```

This writes `.standards-profile` (= `jekyll-public`) so sync/drift resolve
this profile's root files.
