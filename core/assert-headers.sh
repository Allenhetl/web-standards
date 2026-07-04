#!/usr/bin/env bash
# assert-headers.sh — assert a _headers file satisfies one or more
# requirements YAML files (core baseline ∪ profile). Fails loudly on any
# unmet requirement. Requirements YAML is a simple, fixed shape (lists under
# csp.require-directives / csp.forbid-substrings / headers.require-present),
# parsed with awk so no YAML runtime is needed on the CI runner.
set -uo pipefail

HEADERS_FILE="${1:-}"
[ -n "$HEADERS_FILE" ] && shift || { echo "usage: assert-headers.sh <headers-file> <req.yml> [req.yml...]"; exit 2; }
if [ ! -f "$HEADERS_FILE" ]; then
  echo "::error::headers file not found: $HEADERS_FILE (did the build run?)"; exit 1
fi
CONTENT="$(cat "$HEADERS_FILE")"
fail=0

# Print the list items (one per line, unquoted, inline comments stripped)
# under `<parent>:` → `<child>:`. Parent is a top-level key (col 0), child is
# indented 2 spaces, items indented 4 spaces with "- ".
list_under() { # <file> <parent-key> <child-key>
  awk -v pk="$2:" -v ck="  $3:" '
    # entering / leaving the parent block (top-level keys are at column 0)
    $0 == pk { inpk=1; inck=0; next }
    inpk && /^[^[:space:]]/ { inpk=0; inck=0 }
    # entering / leaving the child list (2-space-indented keys)
    inpk && $0 == ck { inck=1; next }
    inpk && inck && /^  [^[:space:]-]/ { inck=0 }
    # a list item: strip "    - ", trailing " # comment", surrounding quotes
    inpk && inck && /^    - / {
      line=$0
      sub(/^    - /, "", line)
      sub(/[[:space:]]+#.*$/, "", line)   # drop inline comment
      sub(/[[:space:]]+$/, "", line)      # drop trailing space
      gsub(/^"|"$/, "", line)             # drop surrounding quotes
      print line
    }
  ' "$1"
}

for REQ in "$@"; do
  [ -f "$REQ" ] || { echo "::error::requirements file not found: $REQ"; fail=1; continue; }

  while IFS= read -r d; do
    [ -z "$d" ] && continue
    if printf '%s' "$CONTENT" | grep -qF "$d"; then echo "ok: CSP has [$d]"
    else echo "::error::CSP missing required directive: [$d] ($REQ)"; fail=1; fi
  done < <(list_under "$REQ" "csp" "require-directives")

  while IFS= read -r s; do
    [ -z "$s" ] && continue
    if printf '%s' "$CONTENT" | grep -qF "$s"; then echo "::error::CSP contains forbidden [$s] ($REQ)"; fail=1
    else echo "ok: CSP free of [$s]"; fi
  done < <(list_under "$REQ" "csp" "forbid-substrings")

  while IFS= read -r h; do
    [ -z "$h" ] && continue
    if printf '%s' "$CONTENT" | grep -qF "$h"; then echo "ok: header present [$h]"
    else echo "::error::missing required header: [$h] ($REQ)"; fail=1; fi
  done < <(list_under "$REQ" "headers" "require-present")
done

if [ "$fail" -ne 0 ]; then echo ""; echo "Header assertions FAILED."; exit 1; fi
echo "All header assertions passed."
