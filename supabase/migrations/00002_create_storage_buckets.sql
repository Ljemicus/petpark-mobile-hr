-- ============================================================
-- PetPark: Storage buckets for avatars & verification documents
-- Run in Supabase SQL Editor (storage schema requires service_role).
-- ============================================================

-- 1. avatars bucket ───────────────────────────────────────────
-- Public bucket — avatar images are readable by anyone.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. verification-documents bucket ────────────────────────────
-- Private bucket — only the owner and admins should read these.
insert into storage.buckets (id, name, public)
values ('verification-documents', 'verification-documents', false)
on conflict (id) do nothing;
