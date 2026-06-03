#!/usr/bin/env bash
# =====================================================================
# PetPark Mobile — REMOTE SCHEMA INTROSPECTION (READ-ONLY)
# Run FIRST. Dumps the ACTUAL columns / FKs / enums / RLS of the
# remote Supabase schema so data-access rewrites target real fields
# instead of guessed names. Reads only; never writes, never migrates.
#
# Needs a READ connection to the remote DB. Provide ONE of:
#   - DATABASE_URL env (postgres connection string), OR
#   - supabase CLI linked to the project (uses `supabase db dump`/psql)
# Nothing here is committed; output goes to ./remote-schema/ which the
# plan tells you to gitignore.
#
#   cd ~/Projects/petpark-mobile && DATABASE_URL="postgresql://..." bash introspect-remote.sh
# =====================================================================
set -u
OUT="remote-schema"
rm -rf "$OUT"; mkdir -p "$OUT"
echo "remote-schema/" >> .gitignore 2>/dev/null || true

PSQL=""
if [ -n "${DATABASE_URL:-}" ] && command -v psql >/dev/null 2>&1; then
  PSQL="psql ${DATABASE_URL} -At -F $'\t'"
  echo ">> Using DATABASE_URL via psql"
elif command -v supabase >/dev/null 2>&1; then
  echo ">> No DATABASE_URL/psql; will try supabase CLI (must be linked)."
  echo ">> If this fails, set DATABASE_URL to a read-only connection string and re-run."
else
  echo "!! Need either DATABASE_URL + psql, or a linked supabase CLI. Aborting." ; exit 1
fi

run_sql() {
  # $1 = sql, $2 = outfile
  if [ -n "$PSQL" ]; then
    echo "$1" | $PSQL > "$OUT/$2" 2>>"$OUT/_errors.log" || echo "(query failed: $2 — see _errors.log)"
  else
    echo "$1" | supabase db query --stdin > "$OUT/$2" 2>>"$OUT/_errors.log" 2>&1 \
      || echo "(supabase db query failed for $2; consider DATABASE_URL+psql)"
  fi
}

# 1. All columns for every public table (the most important output)
run_sql "
select table_name, ordinal_position, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema='public'
order by table_name, ordinal_position;
" "01-columns.tsv"

# 2. Primary keys
run_sql "
select tc.table_name, kcu.column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name=kcu.constraint_name and tc.table_schema=kcu.table_schema
where tc.table_schema='public' and tc.constraint_type='PRIMARY KEY'
order by tc.table_name, kcu.ordinal_position;
" "02-primary-keys.tsv"

# 3. Foreign keys (relationships — critical for joins)
run_sql "
select tc.table_name as from_table, kcu.column_name as from_col,
       ccu.table_name as to_table, ccu.column_name as to_col
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name=kcu.constraint_name and tc.table_schema=kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name=tc.constraint_name and ccu.table_schema=tc.table_schema
where tc.table_schema='public' and tc.constraint_type='FOREIGN KEY'
order by tc.table_name;
" "03-foreign-keys.tsv"

# 4. Enum types and their values (status fields etc.)
run_sql "
select t.typname as enum_name, e.enumsortorder as ord, e.enumlabel as value
from pg_type t
join pg_enum e on t.oid=e.enumtypid
join pg_namespace n on n.oid=t.typnamespace
where n.nspname='public'
order by t.typname, e.enumsortorder;
" "04-enums.tsv"

# 5. RLS: is it enabled per table + policy definitions
run_sql "
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r'
order by c.relname;
" "05-rls-enabled.tsv"

run_sql "
select schemaname, tablename, policyname, cmd, roles::text, qual, with_check
from pg_policies where schemaname='public'
order by tablename, policyname;
" "06-rls-policies.tsv"

# 6. Views (mobile may read from these)
run_sql "
select table_name from information_schema.views where table_schema='public' order by table_name;
" "07-views.tsv"

# 7. Functions / RPCs the client could call
run_sql "
select p.proname as function_name, pg_get_function_arguments(p.oid) as args
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
order by p.proname;
" "08-functions.tsv"

# --- human-readable per-table summary ---
{
  echo "# Remote schema — per-table column summary"
  echo
  awk -F'\t' 'NR>0 && $1!="" {
    if ($1!=prev) { printf "\n## %s\n", $1; prev=$1 }
    printf "  - %s %s%s%s\n", $3, $4, ($5=="NO"?" NOT NULL":""), ($6!=""?" default "$6:"")
  }' "$OUT/01-columns.tsv" 2>/dev/null
} > "$OUT/SCHEMA-SUMMARY.md" 2>/dev/null

echo
echo "================= DONE ================="
echo "Wrote $OUT/ :"
ls -1 "$OUT"
echo
echo "Read SCHEMA-SUMMARY.md (columns), 03-foreign-keys.tsv (joins), 04-enums.tsv (statuses)."
echo "If files are empty, check $OUT/_errors.log and provide DATABASE_URL (read-only) + psql."
echo "remote-schema/ has been added to .gitignore (do not commit DB dumps)."
echo "========================================"
