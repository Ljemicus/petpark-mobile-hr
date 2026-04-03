-- ============================================================
-- PetPark: Core tables for users and sitter profiles
-- Run this in Supabase SQL Editor (or via supabase db push).
-- ============================================================

-- 1. users ────────────────────────────────────────────────────
-- Mirrors auth.users; stores public profile data.
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text        not null default '',
  city        text        not null default 'Zagreb',
  role        text        not null default 'vlasnik'
                          check (role in ('vlasnik', 'sitter')),
  avatar      text,                          -- public URL or emoji fallback
  onboarding_completed boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.users is
  'Public profile data for every authenticated user.';

-- 2. sitter_profiles ──────────────────────────────────────────
-- One-to-one with users where role = ''sitter''.
create table if not exists public.sitter_profiles (
  id                      uuid primary key references public.users (id) on delete cascade,
  bio                     text        not null default '',
  services                text[]      not null default '{}',
  price_per_hour          numeric(8,2) not null default 0,
  rating                  numeric(3,2) not null default 0,
  review_count            int         not null default 0,
  verified                boolean     not null default false,
  avatar                  text,
  has_yard                boolean     not null default false,
  verification_status     text        not null default 'none'
                                      check (verification_status in ('none', 'pending', 'verified', 'rejected')),
  verification_notes      text,
  verification_documents  text[]      not null default '{}',   -- array of public URLs
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table public.sitter_profiles is
  'Extended profile for sitters, including verification state.';

-- 3. Automatic updated_at trigger ─────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger sitter_profiles_updated_at
  before update on public.sitter_profiles
  for each row execute function public.set_updated_at();
