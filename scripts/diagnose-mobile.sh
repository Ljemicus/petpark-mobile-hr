#!/usr/bin/env bash
# =====================================================================
# PetPark Mobile — READ-ONLY diagnostics
# Run FIRST, before fixing anything. Captures the real state of the
# repo so the fix is driven by actual errors, not guesses.
# Does NOT modify code, does NOT commit, does NOT reset.
#
#   cd ~/Projects/petpark-mobile && bash diagnose-mobile.sh
#
# Output: ./mobile-diagnostics/  (+ prints a summary)
# =====================================================================
set -u
OUT="mobile-diagnostics"
rm -rf "$OUT"; mkdir -p "$OUT"
log(){ echo "== $* =="; }

# --- 0. environment ---
{
  echo "node: $(node -v 2>/dev/null)"
  echo "npm:  $(npm -v 2>/dev/null)"
  echo "date: $(date -u) UTC"
} > "$OUT/00-env.txt"

# --- 1. git state (NEVER mutate) ---
log "git status"
git status > "$OUT/01-git-status.txt" 2>&1
git diff --stat > "$OUT/01-git-diff-stat.txt" 2>&1
git diff > "$OUT/01-git-diff-full.txt" 2>&1
git log --oneline -10 > "$OUT/01-git-log.txt" 2>&1
git stash list > "$OUT/01-git-stash.txt" 2>&1

# --- 2. package / toolchain identity ---
log "package.json + lockfile presence"
cp package.json "$OUT/02-package.json" 2>/dev/null
{
  echo "lockfiles present:"; ls -1 package-lock.json yarn.lock pnpm-lock.yaml bun.lockb 2>/dev/null
  echo
  echo "expo / react-native / router / navigation versions:"
  node -e "try{const p=require('./package.json');const a=Object.assign({},p.dependencies,p.devDependencies);['expo','expo-router','react','react-native','react-dom','@react-navigation/native','@react-navigation/bottom-tabs','@react-navigation/native-stack','typescript','expo-location','@supabase/supabase-js'].forEach(k=>console.log('  '+k+': '+(a[k]||'-')))}catch(e){console.log('package.json unreadable: '+e.message)}"
  echo
  echo "router detection:"
  if [ -d app ]; then echo "  app/ dir present -> Expo Router (file-based) likely"; fi
  grep -q '"main": *"expo-router/entry"' package.json 2>/dev/null && echo '  main = expo-router/entry -> Expo Router CONFIRMED'
  [ -f App.tsx ] || [ -f App.js ] && echo "  App.tsx/js present -> React Navigation entry possible (mix?)"
} > "$OUT/02-toolchain.txt" 2>&1

# --- 3. install (needed for tsc/expo-doctor to be meaningful) ---
log "npm install (this can take a few minutes)"
if [ -f package-lock.json ]; then
  ( npm ci > "$OUT/03-install.log" 2>&1 ) || ( npm install > "$OUT/03-install.log" 2>&1 ) \
    || echo "install failed (see 03-install.log)"
else
  ( npm install > "$OUT/03-install.log" 2>&1 ) || echo "install failed (see 03-install.log)"
fi
tail -n 20 "$OUT/03-install.log" > "$OUT/03-install-tail.txt" 2>/dev/null

# --- 4. expo-doctor ---
log "expo-doctor"
( npx --yes expo-doctor > "$OUT/04-expo-doctor.txt" 2>&1 ) || echo "(expo-doctor unavailable/failed — see file)"

# --- 5. TypeScript check (the big one) ---
log "tsc --noEmit"
( npx tsc --noEmit > "$OUT/05-tsc.txt" 2>&1 ) || true
TSC_ERRS=$(grep -cE "error TS" "$OUT/05-tsc.txt" 2>/dev/null || echo 0)
# group errors by code and by file for triage
grep -oE "error TS[0-9]+" "$OUT/05-tsc.txt" 2>/dev/null | sort | uniq -c | sort -rn > "$OUT/05-tsc-by-code.txt"
grep -E "error TS" "$OUT/05-tsc.txt" 2>/dev/null | sed -E 's/\(.*//' | sort | uniq -c | sort -rn | head -40 > "$OUT/05-tsc-by-file.txt"

# --- 6. expo-router route inventory + sanity ---
log "route inventory"
if [ -d app ]; then
  find app -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.jsx' -o -name '*.js' \) | sort > "$OUT/06-routes.txt"
  {
    echo "default exports missing (route files MUST default-export a component):"
    while IFS= read -r f; do
      case "$f" in */_layout.*) continue;; esac
      grep -qE "export default" "$f" || echo "  NO DEFAULT EXPORT: $f"
    done < "$OUT/06-routes.txt"
    echo
    echo "_layout files:"; find app -name '_layout.*' | sort
    echo
    echo "dynamic routes ([param]):"; find app -regex '.*\[[^]]*\].*' | sort
  } > "$OUT/06-route-sanity.txt" 2>&1
fi

# --- 7. deleted-file references (the cart/product removal risk) ---
log "stale references to deleted modules"
{
  echo "References to deleted cart/product/ProductCard (should be ZERO):"
  grep -rnE "cart-context|ProductCard|app/product|from ['\"].*cart|/cart\b" \
    --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
    app components lib 2>/dev/null | grep -v node_modules
  echo
  echo "Šapica branding (must be ZERO — do not reintroduce):"
  grep -rniE "sapica|šapica|sapica" --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.json' \
    app components lib assets 2>/dev/null | grep -v node_modules | head -40
} > "$OUT/07-stale-refs.txt" 2>&1

# --- 8. metro/expo bundle smoke (export catches router+import errors tsc misses) ---
log "expo export smoke test (catches bundling/router errors)"
( npx --yes expo export --platform ios --output-dir "$OUT/.export-smoke" > "$OUT/08-expo-export.log" 2>&1 ) \
  || echo "(expo export failed or unavailable — inspect 08-expo-export.log for real bundling errors)"
rm -rf "$OUT/.export-smoke" 2>/dev/null
tail -n 40 "$OUT/08-expo-export.log" > "$OUT/08-expo-export-tail.txt" 2>/dev/null

# --- summary ---
echo
echo "=================== SUMMARY ==================="
echo "Router:        $(grep -m1 'Expo Router' "$OUT/02-toolchain.txt" 2>/dev/null || echo 'see 02-toolchain.txt')"
echo "tsc errors:    ${TSC_ERRS}  (top codes in 05-tsc-by-code.txt, top files in 05-tsc-by-file.txt)"
echo "stale refs:    $(grep -c ':' "$OUT/07-stale-refs.txt" 2>/dev/null) lines flagged (07-stale-refs.txt)"
echo "git: untouched (read-only). diff saved to 01-git-diff-full.txt"
echo "Read $OUT/05-tsc-by-file.txt and $OUT/08-expo-export-tail.txt first."
echo "==============================================="
