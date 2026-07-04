#!/usr/bin/env bash
# onboard.sh — bring a site into compliance with web-standards in one run.
# Run from the ROOT of the site repo you want to onboard:
#
#   cd /path/to/my-site
#   bash /path/to/web-standards/bin/onboard.sh
#
# or, if web-standards is already a submodule:
#
#   bash standards/bin/onboard.sh
#
# Idempotent: safe to re-run. Does NOT commit — it stages changes and prints
# the remaining human steps so you can review before committing.
set -euo pipefail

STANDARDS_URL="https://github.com/Allenhetl/web-standards"
SUBMODULE_PATH="standards"

SITE_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$SITE_ROOT" ]; then
  echo "error: run this from inside the site's git repository." >&2
  exit 1
fi
cd "$SITE_ROOT"

echo "==> Onboarding site: $SITE_ROOT"

# 1. Add the standards submodule (skip if already present).
if [ -d "$SUBMODULE_PATH" ] && git submodule status "$SUBMODULE_PATH" >/dev/null 2>&1; then
  echo "[1/5] submodule '$SUBMODULE_PATH' already present — updating"
  git submodule update --init --remote "$SUBMODULE_PATH"
else
  echo "[1/5] adding submodule '$SUBMODULE_PATH'"
  git submodule add "$STANDARDS_URL" "$SUBMODULE_PATH"
fi

STD="$SITE_ROOT/$SUBMODULE_PATH"

# 2. Copy caller workflow stubs into the site.
echo "[2/5] installing reusable-workflow caller stubs"
mkdir -p "$SITE_ROOT/.github/workflows"
for stub in "$STD/templates/workflows/"*.yml; do
  base="$(basename "$stub")"
  cp "$stub" "$SITE_ROOT/.github/workflows/$base"
  echo "      + .github/workflows/$base"
done

# 3. Sync root files.
echo "[3/5] syncing root files"
bash "$STD/bin/sync-standards.sh"

# 4. Ensure the auto-sync pre-commit hook is present.
echo "[4/5] pre-commit config synced (auto-sync hook included)"

# 5. Install the pre-commit hook if pre-commit is available.
echo "[5/5] installing pre-commit hook"
if command -v pre-commit >/dev/null 2>&1; then
  pre-commit install
else
  echo "      pre-commit not found — install it, then run: pre-commit install"
fi

git add -A .github/workflows .gitmodules "$SUBMODULE_PATH" 2>/dev/null || true

cat <<'EOF'

==> Onboarding complete (nothing committed yet). Remaining human steps:

  1. Review staged changes:            git status && git diff --staged
  2. Reusable workflows reference @main of Allenhetl/web-standards.
     If your default branch differs, adjust the caller stubs.
  3. If this is NOT a Jekyll site, add site-specific exemptions to
     .standards-allow (e.g. robots.txt if it can't use Liquid).
  4. Confirm the CSP in _headers covers this site's embeds; extend the
     matching directive if you add third-party scripts/frames.
  5. Fill site config (e.g. _config.yml url/baseurl for Jekyll).
  6. Commit:   git commit -m "Adopt web-standards"

See standards/CHECKLIST.md for the full list.
EOF
