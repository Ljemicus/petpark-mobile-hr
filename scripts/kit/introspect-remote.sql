-- KIT-0 / KIT-C — READ-ONLY introspekcija remote Supabase baze.
-- Isključivo SELECT upiti. Pokreni redom, spremi sav output u docs/truth/live-schema-dump-<datum>.md
-- NIKAD ne pokreći DDL/DML iz ovog konteksta.

-- 1. Sve tablice u public shemi + RLS status
SELECT c.relname AS tablica,
       c.relrowsecurity AS rls_ukljucen,
       c.relforcerowsecurity AS rls_forsiran,
       pg_size_pretty(pg_total_relation_size(c.oid)) AS velicina,
       (SELECT reltuples::bigint FROM pg_class WHERE oid = c.oid) AS procj_redova
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;

-- 2. Kolone po tablici (za usporedbu s generated types)
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. Sve RLS politike (kritično za KIT-C matricu)
SELECT schemaname, tablename, policyname, permissive, roles, cmd,
       qual AS using_izraz, with_check AS check_izraz
FROM pg_policies
WHERE schemaname IN ('public','storage')
ORDER BY tablename, policyname;

-- 4. Tablice s RLS=off (CRVENA LISTA — svaka javno čitljiva preko anon ključa ako ima grant)
SELECT c.relname AS tablica_bez_rls
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity = false
ORDER BY 1;

-- 5. Funkcije i triggeri
SELECT routine_name, routine_type, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

SELECT event_object_table AS tablica, trigger_name, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 6. Storage bucketi + javnost
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 7. Foreign key graf (za TABLE-CLASSIFICATION i razumijevanje ovisnosti)
SELECT tc.table_name AS tablica, kcu.column_name AS kolona,
       ccu.table_name AS referencira_tablicu, ccu.column_name AS referencira_kolonu
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public'
ORDER BY tc.table_name;

-- 8. Ciljana provjera spornih modula (forum / shop / breeder / trainer)
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND (
  table_name LIKE 'forum%' OR table_name LIKE 'shop%' OR table_name LIKE 'product%'
  OR table_name LIKE 'breeder%' OR table_name LIKE 'trainer%' OR table_name LIKE 'training%'
)
ORDER BY table_name;
