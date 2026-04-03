-- Add admin_notes column to sitter_profiles for verification workflow
alter table public.sitter_profiles
  add column if not exists admin_notes text;
