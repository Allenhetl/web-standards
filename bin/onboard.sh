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

# Which site-type profile to adopt (see profiles/). Default keeps the v1
# behavior for existing public Jekyll sites.
PROFILE="jekyll-public"
while [ $# -gt 0 ]; do
  case "$1" in
    --profile) PROFILE="$2"; shift 2 ;;
    --profile=*) PROFILE="${1#*=}"; shift ;;
    *) shift ;;
  esac
done

SITE_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$SITE_ROOT" ]; then
  echo "error: run this from inside the site's git repository." >&2
  exit 1
fi
cd "$SITE_ROOT"

echo "==> Onboarding site: $SITE_ROOT (profile: $PROFILE)"

# 1. Add the standards submodule (skip if already present).
if [ -d "$SUBMODULE_PATH" ] && git submodule status "$SUBMODULE_PATH" >/dev/null 2>&1; then
  echo "[1/5] submodule '$SUBMODULE_PATH' already present — updating"
  git submodule update --init --remote "$SUBMODULE_PATH"
else
  echo "[1/5] adding submodule '$SUBMODULE_PATH'"
  git submodule add "$STANDARDS_URL" "$SUBMODULE_PATH"
fi

STD="$SITE_ROOT/$SUBMODULE_PATH"

# Validate the profile exists, then record it so sync/check-drift resolve it.
STUB_DIR="$STD/profiles/$PROFILE/caller-workflows"
if [ ! -d "$STUB_DIR" ]; then
  echo "error: unknown profile '$PROFILE' (no $STUB_DIR). Available:" >&2
  ls "$STD/profiles" 2>/dev/null | sed 's/^/  - /' >&2
  exit 1
fi
echo "$PROFILE" > "$SITE_ROOT/.standards-profile"

# 2. Copy this profile's caller workflow stubs into the site.
echo "[2/5] installing reusable-workflow caller stubs (profile: $PROFILE)"
mkdir -p "$SITE_ROOT/.github/workflows"
for stub in "$STUB_DIR/"*.yml; do
  base="$(basename "$stub")"
  cp "$stub" "$SITE_ROOT/.github/workflows/$base"
  echo "      + .github/workflows/$base"
done

# 3. Install the Dependabot config (github-actions + submodule) if absent.
echo "[3/6] installing dependabot config"
if [ -f "$SITE_ROOT/.github/dependabot.yml" ]; then
  echo "      .github/dependabot.yml exists — left untouched"
else
  cp "$STD/templates/dependabot.yml" "$SITE_ROOT/.github/dependabot.yml"
  echo "      + .github/dependabot.yml"
fi

# 4. Sync root files.
echo "[4/6] syncing root files"
bash "$STD/bin/sync-standards.sh"

# 5. Ensure the auto-sync pre-commit hook is present.
echo "[5/6] pre-commit config synced (auto-sync hook included)"

# 6. Install the pre-commit hook if pre-commit is available.
echo "[6/6] installing pre-commit hook"
if command -v pre-commit >/dev/null 2>&1; then
  pre-commit install
else
  echo "      pre-commit not found — install it, then run: pre-commit install"
fi

git add -A .github/workflows .github/dependabot.yml .gitmodules .standards-profile "$SUBMODULE_PATH" 2>/dev/null || true

cat <<'EOF'

==> Onboarding complete (nothing committed yet). Remaining human steps:

  1. Review staged changes:            git status && git diff --staged
  2. Reusable workflows reference @v2 of Allenhetl/web-standards (the
     moving major tag). Pin to an exact @v2.1.0 if you want no auto-updates.
  3. Profile-specific: jekyll-public syncs a static _headers/robots (confirm
     the CSP covers your embeds); node-private GENERATES them and CI asserts
     the posture — no action unless you add new external resources.
  4. Fill site config (e.g. _config.yml url/baseurl for a Jekyll site).
  5. Commit:   git commit -m "Adopt web-standards"

See standards/CHECKLIST.md for the full list.
EOF
