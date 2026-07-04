#!/usr/bin/env bash
# sync-standards.sh — copy authoritative root files from the web-standards
# submodule into the consuming site's repo root, then stage any changes.
#
# Runs both interactively and as a pre-commit hook. Path resolution is
# relative to THIS script, so cwd doesn't matter:
#
#   standards/bin/sync-standards.sh   ->  script
#   standards/                        ->  submodule root  (STD_ROOT)
#   <site repo root>                  ->  parent of standards/  (SITE_ROOT)
#
# Special cases:
#   * .prettierignore — only the section ABOVE the "# --- site-specific ---"
#     marker is managed; the site's own ignores below it are preserved.
#   * .standards-allow — any filename listed here (one per line, '#' comments
#     ok) is SKIPPED, letting a site deliberately deviate.
set -euo pipefail

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

changed=()

sync_file() {
  local name="$1" src="$SRC/$1" dst="$SITE_ROOT/$1"
  if is_exempt "$name"; then
    echo "  skip (exempt): $name"
    return
  fi
  if [ ! -f "$dst" ] || ! cmp -s "$src" "$dst"; then
    cp "$src" "$dst"
    changed+=("$name")
    echo "  synced: $name"
  fi
}

# .prettierignore: replace only the managed (pre-marker) section.
sync_prettierignore() {
  local name=".prettierignore"
  local src="$SRC/$name" dst="$SITE_ROOT/$name"
  if is_exempt "$name"; then
    echo "  skip (exempt): $name"
    return
  fi
  local base tail merged
  base="$(sed -n "1,/$PRETTIER_MARKER/p" "$src")"
  if [ -f "$dst" ] && grep -qF "$PRETTIER_MARKER" "$dst"; then
    tail="$(sed "1,/$PRETTIER_MARKER/d" "$dst")"
    merged="$base"$'\n'"$tail"
  else
    merged="$(cat "$src")"
  fi
  if [ ! -f "$dst" ] || [ "$merged" != "$(cat "$dst")" ]; then
    printf '%s\n' "$merged" > "$dst"
    changed+=("$name")
    echo "  synced: $name (managed section)"
  fi
}

echo "Syncing web-standards root files into: $SITE_ROOT"

for f in _headers robots.txt .editorconfig .prettierrc .pre-commit-config.yaml; do
  sync_file "$f"
done
sync_prettierignore

if [ ${#changed[@]} -gt 0 ]; then
  ( cd "$SITE_ROOT" && git add -- "${changed[@]}" 2>/dev/null || true )
  echo "Updated ${#changed[@]} file(s) and staged them."
else
  echo "All root files already in sync."
fi
