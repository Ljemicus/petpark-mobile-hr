#!/usr/bin/env bash
# =====================================================================
# PetPark Mobile — FEATURE-READINESS audit (READ-ONLY)
# Run FIRST. Goes beyond "does it build" to map what each feature
# actually wires up: screens, navigation targets, Supabase calls,
# loading/empty/error states, and mock-vs-real data. Drives the
# completion work in COMPLETE_MOBILE.md.
# Does NOT modify code, does NOT commit, does NOT touch any DB.
#
#   cd ~/Projects/petpark-mobile && bash audit-features.sh
#   Output: ./feature-audit/
# =====================================================================
set -u
OUT="feature-audit"
rm -rf "$OUT"; mkdir -p "$OUT"
SRC_DIRS="app components lib"

section(){ echo; echo "===== $* ====="; }

# Feature areas to evaluate (payments intentionally LAST / out of scope for functional work)
FEATURES="booking chat passport walk owner-dashboard sitter-dashboard groomer-dashboard trainer-dashboard breeder-dashboard rescue-dashboard shop search profile notifications"

# --- 0. route inventory ---
if [ -d app ]; then
  find app -type f \( -name '*.tsx' -o -name '*.ts' \) | sort > "$OUT/00-all-routes.txt"
  {
    echo "Route files lacking a default export (Expo Router needs one):"
    while IFS= read -r f; do
      case "$f" in */_layout.*) continue;; esac
      grep -qE "export default" "$f" || echo "  MISSING DEFAULT EXPORT: $f"
    done < "$OUT/00-all-routes.txt"
  } > "$OUT/00-route-sanity.txt"
fi

# --- 1. navigation graph: every router.push/navigate target vs files that exist ---
section "navigation targets" 
grep -rnoE "(router\.(push|replace|navigate)|<Link[^>]*href=)[^)]*" $SRC_DIRS 2>/dev/null \
  | grep -v node_modules > "$OUT/01-nav-targets.txt"
# crude extraction of string paths being navigated to
grep -roE "(push|replace|navigate|href)\(?[=]?['\"][^'\"]+['\"]" $SRC_DIRS 2>/dev/null \
  | grep -oE "['\"]/[^'\"]+['\"]" | tr -d "'\"" | sort -u > "$OUT/01-nav-paths.txt"
{
  echo "Navigated-to paths that may have NO matching route file:"
  while IFS= read -r p; do
    # normalize: strip leading slash and query/params
    base="${p#/}"; base="${base%%\?*}"
    # check if any file under app/ plausibly matches the first segment(s)
    seg1="${base%%/*}"
    if [ -n "$seg1" ] && [ -d app ]; then
      if ! find app -path "*${seg1}*" -name '*.tsx' | grep -q .; then
        echo "  NO MATCH: $p"
      fi
    fi
  done < "$OUT/01-nav-paths.txt"
} > "$OUT/01-nav-orphans.txt" 2>&1

# --- 2. Supabase wiring per feature ---
section "supabase usage"
grep -rnoE "supabase\.(from\(['\"][a-z_]+['\"]\)|auth\.|rpc\(['\"][a-z_]+['\"]\)|storage\.)" $SRC_DIRS 2>/dev/null \
  | grep -v node_modules > "$OUT/02-supabase-calls.txt"
grep -roE "\.from\(['\"][a-z_]+['\"]\)" $SRC_DIRS 2>/dev/null | grep -oE "['\"][a-z_]+['\"]" | tr -d "'\"" | sort | uniq -c | sort -rn > "$OUT/02-supabase-tables.txt"
grep -roE "\.rpc\(['\"][a-z_]+['\"]\)" $SRC_DIRS 2>/dev/null | grep -oE "['\"][a-z_]+['\"]" | tr -d "'\"" | sort -u > "$OUT/02-supabase-rpcs.txt"

# --- 3. mock vs real data ---
section "mock data reach"
{
  echo "Files importing mock-data:"
  grep -rlnE "mock-data|mockData|MOCK_|sampleData|fixtures" $SRC_DIRS 2>/dev/null | grep -v node_modules
  echo
  echo "TODO / FIXME / not implemented / placeholder markers:"
  grep -rniE "TODO|FIXME|not implemented|coming soon|placeholder|stub|uskoro|dummy" $SRC_DIRS 2>/dev/null | grep -v node_modules | head -120
} > "$OUT/03-mock-and-todos.txt"

# --- 4. per-feature state-handling matrix (loading / empty / error) ---
section "per-feature readiness matrix"
{
  printf "%-22s %7s %7s %8s %8s %8s %8s %9s\n" "FEATURE" "files" "screens" "sb_calls" "loading" "empty" "error" "mockData"
  for feat in $FEATURES; do
    # find files whose path mentions the feature keyword
    files=$(grep -rliE "$feat" $SRC_DIRS 2>/dev/null | grep -v node_modules | grep -iE "$feat" | sort -u)
    # broaden: also match by path containing the feature word
    pathfiles=$(find $SRC_DIRS -type f \( -name '*.tsx' -o -name '*.ts' \) 2>/dev/null | grep -iE "/[^/]*${feat%%-*}[^/]*\.(tsx|ts)$" | sort -u)
    allf=$(printf "%s\n%s\n" "$files" "$pathfiles" | sort -u | grep -v '^$')
    nf=$(printf "%s" "$allf" | grep -c . )
    [ -z "$allf" ] && { printf "%-22s %7s %7s %8s %8s %8s %8s %9s\n" "$feat" 0 - - - - - -; continue; }
    nscreen=$(printf "%s\n" "$allf" | { grep -E "app/" || true; } | grep -c . )
    nsb=$(printf "%s\n" "$allf" | xargs grep -lE "supabase\." 2>/dev/null | grep -c . )
    nload=$(printf "%s\n" "$allf" | xargs grep -liE "isLoading|loading|Spinner|ActivityIndicator|Skeleton" 2>/dev/null | grep -c . )
    nempty=$(printf "%s\n" "$allf" | xargs grep -liE "empty|nema|length === 0|length == 0|noData|No results" 2>/dev/null | grep -c . )
    nerr=$(printf "%s\n" "$allf" | xargs grep -liE "catch|error|Error|try {" 2>/dev/null | grep -c . )
    nmock=$(printf "%s\n" "$allf" | xargs grep -liE "mock|MOCK|sample|fixture" 2>/dev/null | grep -c . )
    printf "%-22s %7s %7s %8s %8s %8s %8s %9s\n" "$feat" "$nf" "$nscreen" "$nsb" "$nload" "$nempty" "$nerr" "$nmock"
    printf "%s\n" "$allf" > "$OUT/feat-$feat.txt"
  done
} > "$OUT/04-readiness-matrix.txt" 2>&1

# --- 5. forms without validation / submit handlers ---
section "forms"
grep -rlnE "TextInput|useForm|<Formik|Controller" $SRC_DIRS 2>/dev/null | grep -v node_modules > "$OUT/05-form-files.txt"
{
  echo "Form files and whether they reference a submit + validation:"
  while IFS= read -r f; do
    sub=$(grep -cE "onSubmit|handleSubmit|onPress=\{.*submit|insert\(|update\(|upsert\(" "$f"); 
    val=$(grep -cE "zod|yup|schema|validate|required|\.min\(|\.email\(" "$f");
    printf "  %s  submit:%s validation:%s\n" "$f" "$sub" "$val"
  done < "$OUT/05-form-files.txt"
} >> "$OUT/05-forms.txt" 2>&1

# --- 6. permissions / native capability usage (walk tracker = location) ---
section "native permissions"
{
  grep -rnE "expo-location|Location\.|requestForegroundPermissions|requestBackgroundPermissions|expo-notifications|Notifications\.|expo-image-picker|Camera|MediaLibrary" $SRC_DIRS 2>/dev/null | grep -v node_modules
  echo
  echo "app.json / app.config plugins & permissions:"
  for c in app.json app.config.js app.config.ts; do [ -f "$c" ] && { echo "--- $c ---"; cat "$c"; }; done
} > "$OUT/06-permissions.txt" 2>&1

# --- 7. typecheck + bundle (confirm still green before functional work) ---
section "typecheck + bundle smoke"
( npx tsc --noEmit > "$OUT/07-tsc.txt" 2>&1 ) || true
echo "tsc errors: $(grep -cE 'error TS' "$OUT/07-tsc.txt" 2>/dev/null)" > "$OUT/07-summary.txt"
( npx --yes expo export --platform ios --output-dir "$OUT/.exp" > "$OUT/07-export.txt" 2>&1 ) || echo "export failed (see 07-export.txt)" >> "$OUT/07-summary.txt"
rm -rf "$OUT/.exp" 2>/dev/null

# --- summary ---
echo
echo "================= SUMMARY ================="
cat "$OUT/04-readiness-matrix.txt"
echo
echo "tsc errors: $(grep -cE 'error TS' "$OUT/07-tsc.txt" 2>/dev/null)"
echo "nav orphans: $(grep -c 'NO MATCH' "$OUT/01-nav-orphans.txt" 2>/dev/null)"
echo "supabase tables referenced: $(wc -l < "$OUT/02-supabase-tables.txt" 2>/dev/null)"
echo "files still importing mock data: $(grep -c . "$OUT/03-mock-and-todos.txt" 2>/dev/null)"
echo "Read 04-readiness-matrix.txt, 01-nav-orphans.txt, 03-mock-and-todos.txt first."
echo "==========================================="
