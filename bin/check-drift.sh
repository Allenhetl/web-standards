#!/usr/bin/env bash
# check-drift.sh — assert that a site's root files match the authoritative
# copies in standards/root-files/. Exits non-zero (with a diff) on any
# mismatch, so CI fails loudly. This is the backstop behind the pre-commit
# auto-sync: it catches --no-verify commits and machines without the hook.
#
# Same path model as sync-standards.sh. Honours .standards-allow exemptions
# and the .prettierignore managed-section rule.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STD_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SITE_ROOT="$(cd "$STD_ROOT/.." && pwd)"
SRC="$STD_ROOT/root-files"

ALLOW_FILE="$SITE_ROOT/.standards-allow"
PRETTIER_MARKER="# --- site-specific ---"

is_exempt() {
  [ -f "$ALLOW_FILE" ] || return 1
  grep -vE '^\s*(#|$)' "$ALLOW_FILE" 2>/dev/null | grep -qxF "$1"
}

drift=0

report() {
  echo "::error::web-standards drift in '$1' — run standards/bin/sync-standards.sh"
  echo "--- expected (standards/root-files/$1)"
  echo "+++ actual   ($1)"
  diff -u "$2" "$3" || true
  drift=1
}

check_file() {
  local name="$1" src="$SRC/$1" dst="$SITE_ROOT/$1"
  is_exempt "$name" && { echo "skip (exempt): $name"; return; }
  if [ ! -f "$dst" ]; then
    echo "::error::missing root file '$name' — run sync-standards.sh"; drift=1; return
  fi
  cmp -s "$src" "$dst" && echo "ok: $name" || report "$name" "$src" "$dst"
}

# .prettierignore: compare only the managed (pre-marker) section.
check_prettierignore() {
  local name=".prettierignore"
  local src="$SRC/$name" dst="$SITE_ROOT/$name"
  is_exempt "$name" && { echo "skip (exempt): $name"; return; }
  if [ ! -f "$dst" ]; then
    echo "::error::missing root file '$name' — run sync-standards.sh"; drift=1; return
  fi
  local a b
  # Anchor to line start: the banner text also contains the marker string.
  a="$(sed -n "1,/^$PRETTIER_MARKER/p" "$src")"
  b="$(sed -n "1,/^$PRETTIER_MARKER/p" "$dst")"
  if [ "$a" = "$b" ]; then
    echo "ok: $name (managed section)"
  else
    echo "::error::web-standards drift in managed section of '$name'"
    diff -u <(printf '%s\n' "$a") <(printf '%s\n' "$b") || true
    drift=1
  fi
}

echo "Checking web-standards drift in: $SITE_ROOT"
for f in _headers robots.txt .editorconfig .prettierrc .pre-commit-config.yaml; do
  check_file "$f"
done
check_prettierignore

if [ "$drift" -ne 0 ]; then
  echo ""
  echo "Drift detected. Run: standards/bin/sync-standards.sh && git commit"
  exit 1
fi
echo "No drift. Root files conform to web-standards."
