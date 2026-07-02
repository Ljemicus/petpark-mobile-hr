#!/usr/bin/env bash
# KIT-0 — read-only inventura. Ne mijenja nijednu postojeću datoteku.
# Pokreni iz roota web repoa. Za mobile: bash 00-inventura.sh --mobile
set -euo pipefail

MODE="web"
[[ "${1:-}" == "--mobile" ]] && MODE="mobile"

if [[ ! -f package.json ]]; then
  echo "GREŠKA: pokreni iz roota repoa (nema package.json)" >&2; exit 1
fi

OUT="docs/truth"
mkdir -p "$OUT"
EX=(--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.expo --exclude-dir=dist --exclude-dir=build)

echo "== [1/4] Route manifest =="
if [[ "$MODE" == "web" ]]; then
  MAN="$OUT/ROUTE-MANIFEST.generated.md"
  {
    echo "# ROUTE MANIFEST (generirano $(date -u +%F)) — dopuni kolonu KLASIFIKACIJA"
    echo
    echo "## Stranice"
    echo "| Ruta | Datoteka | KLASIFIKACIJA | Napomena |"
    echo "|---|---|---|---|"
    find app -name "page.tsx" -not -path "*/api/*" | sort | while read -r f; do
      route=$(dirname "$f" | sed 's|^app||; s|(site)||; s|//|/|g'); [[ -z "$route" ]] && route="/"
      echo "| \`$route\` | \`$f\` | ??? | |"
    done
    echo
    echo "## API rute"
    echo "| Ruta | Datoteka | Metode | Auth poziv vidljiv? | Grupa | KLASIFIKACIJA |"
    echo "|---|---|---|---|---|---|"
    find app -path "*/api/*" -name "route.ts" | sort | while read -r f; do
      route=$(dirname "$f" | sed 's|^app||; s|(site)||; s|//|/|g')
      methods=$(grep -oE "export (async )?function (GET|POST|PATCH|PUT|DELETE)" "$f" | grep -oE "(GET|POST|PATCH|PUT|DELETE)" | tr '\n' ',' | sed 's/,$//')
      auth="NE"; grep -qE "getUser|getSession|auth\(|requireAuth|adminGuard|verifyAdmin|requireUser|createServerClient" "$f" && auth="da(heuristika)"
      echo "| \`$route\` | \`$f\` | $methods | $auth | ??? | ??? |"
    done
  } > "$MAN"
  echo "  → $MAN"
fi

echo "== [2/4] Env audit =="
ENVOUT="$OUT/env-usage-$MODE.txt"
grep -rhoE "process\.env\.[A-Z0-9_]+|EXPO_PUBLIC_[A-Z0-9_]+" "${EX[@]}" app lib components scripts 2>/dev/null \
  | sed 's/process\.env\.//' | sort | uniq -c | sort -rn > "$ENVOUT" || true
echo "  → $ENVOUT ($(wc -l < "$ENVOUT") varijabli)"

echo "== [3/4] NextAuth provjera =="
NA=$(grep -rlE "next-auth|NextAuth" "${EX[@]}" app lib components 2>/dev/null || true)
if [[ -z "$NA" ]]; then echo "  NextAuth: NIJE aktivan — NEXTAUTH_* env je legacy kandidat"; \
else echo "  NextAuth referenciran u:"; echo "$NA" | sed 's/^/    /'; fi

echo "== [4/4] Lažno-žive površine =="
FAKE="$OUT/fake-surfaces-$MODE.txt"
grep -rnE "FALLBACK_|MOCK_|DEMO_|SAMPLE_|hardcoded|seedData" "${EX[@]}" app lib components 2>/dev/null > "$FAKE" || true
echo "  → $FAKE ($(wc -l < "$FAKE") pogodaka — ručno filtriraj lažne pozitive)"

echo
echo "GOTOVO (read-only). Sljedeće: introspect-remote.sql na remote bazi, pa TABLE-CLASSIFICATION.md."
