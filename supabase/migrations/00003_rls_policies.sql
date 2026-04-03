-- ============================================================
-- PetPark: Row-Level Security & Storage policies
-- Run in Supabase SQL Editor after tables + buckets exist.
-- ============================================================

-- ── Enable RLS ───────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.sitter_profiles enable row level security;

-- ── users policies ───────────────────────────────────────────

-- Anyone can read public profiles
create policy "Users: public read"
  on public.users for select
  using (true);

-- Authenticated users can insert their own row (onboarding upsert)
create policy "Users: self insert"
  on public.users for insert
  with check (auth.uid() = id);

-- Authenticated users can update only their own row
create policy "Users: self update"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── sitter_profiles policies ─────────────────────────────────

-- Anyone can read sitter profiles (marketplace listing)
create policy "Sitters: public read"
  on public.sitter_profiles for select
  using (true);

-- Sitters can insert their own profile
create policy "Sitters: self insert"
  on public.sitter_profiles for insert
  with check (auth.uid() = id);

-- Sitters can update their own profile (except verified/verification_status
-- which should be admin-only — enforced at app layer for now)
create policy "Sitters: self update"
  on public.sitter_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── Storage: avatars (public bucket) ─────────────────────────

-- Anyone can read avatars (bucket is public, but policies still needed)
create policy "Avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Authenticated users upload to their own folder: avatars/{uid}/*
create policy "Avatars: owner upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners can overwrite their own avatar (upsert)
create policy "Avatars: owner update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── Storage: verification-documents (private bucket) ─────────

-- Only the document owner can read their own verification docs
create policy "VerDocs: owner read"
  on storage.objects for select
  using (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users upload to their own folder
create policy "VerDocs: owner upload"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners can overwrite their own docs
create policy "VerDocs: owner update"
  on storage.objects for update
  using (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─────────────────────────────────────────────────────────────
-- NOTE: Admin read access to verification-documents should be
-- added when the admin verification flow is built. Options:
--   a) A service_role call from a server function (bypasses RLS)
--   b) A policy checking a custom claim / admin role
-- ─────────────────────────────────────────────────────────────
