# Workstream 1: Supabase Bucket + SQL Setup

## Session: 2026-04-03 09:55 CEST

### Plan
1. Inspect repo for existing Supabase config, migrations, SQL files.
2. Create SQL migration stubs for tables, storage buckets, and RLS policies.
3. Document decisions and manual steps.
4. Run checks, commit.

### Findings (pre-existing state)
- **No `supabase/` directory or `.sql` files existed** — all Supabase setup was implicit in app code.
- App already references two tables (`users`, `sitter_profiles`) and two storage buckets (`avatars`, `verification-documents`).
- Upload code (`lib/upload.ts`) uses `safeUpload()` that silently returns `null` on bucket-missing errors.
- Auth context (`lib/auth-context.tsx`) upserts into both tables during onboarding.

### Files created
| File | Purpose |
|------|---------|
| `supabase/migrations/00001_create_tables.sql` | `users` and `sitter_profiles` tables with constraints, types, and `updated_at` triggers |
| `supabase/migrations/00002_create_storage_buckets.sql` | Creates `avatars` (public) and `verification-documents` (private) buckets |
| `supabase/migrations/00003_rls_policies.sql` | RLS on both tables + storage policies (owner-scoped uploads, public reads where appropriate) |
| `docs/agent-progress/workstream-1-supabase-setup.md` | This file |

### Decisions
- **`avatars` bucket is public** — avatar images are shown in the marketplace listing, so public read is needed.
- **`verification-documents` bucket is private** — only the owner can read their own docs. Admin access is deferred until the admin verification flow is built (noted in SQL).
- **`verification_status` enum values**: `none`, `pending`, `verified`, `rejected` — matches the app's current `'none' | 'pending'` plus future admin states.
- **RLS for sitter_profiles**: sitters can update their own row, but `verified`/`verification_status` should be admin-only in practice — enforced at app layer for now (noted in SQL).
- **Storage path convention**: `{user_id}/filename` — matches existing upload code in `app/onboarding.tsx`.
- **No live Supabase changes made** — all artifacts are repo files only.

### Manual steps required
1. **Run the migrations** in Supabase SQL Editor (or via `supabase db push` if CLI is configured):
   - `00001_create_tables.sql` first
   - `00002_create_storage_buckets.sql` second
   - `00003_rls_policies.sql` third
2. **Verify buckets** appear in Supabase Dashboard → Storage after running `00002`.
3. **Test upload flow** in the app after buckets exist — `safeUpload` should start returning URLs instead of `null`.

### Blockers
- None for the SQL artifacts. The migrations are ready to run.

### Next steps
- Run migrations against the live Supabase project.
- Build admin verification flow (approve/reject sitters, read verification-documents via service_role).
- Consider adding `supabase/config.toml` for local dev if the team wants `supabase start` support.

### Update — RLS hardening follow-up
- Added `supabase/migrations/00005_lock_verification_fields.sql`.
- This closes the remaining self-verification gap found in sanity review.
- The migration adds a DB trigger on `public.sitter_profiles` that blocks self-updates to:
  - `verified`
  - `verification_status`
  - `verification_notes`
  - `verification_documents`
  - `admin_notes`
- Result: sitters can still edit normal profile fields, but cannot mark themselves verified through direct client-side Supabase calls.
