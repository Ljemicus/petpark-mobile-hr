# Workstream 3: Post-merge Sanity Review

**Started:** 2026-04-03 ~10:00 CEST
**Branch:** `production`
**Scope:** Onboarding, auth, profile, upload, admin verification, Supabase migrations

---

## Plan

1. Read all files touched by the onboarding/auth/profile work (last 5 commits)
2. Run TypeScript type-check
3. Audit for security holes, bugs, edge cases, and cleanup items
4. Apply fixes
5. Produce priority-ranked findings

## TypeScript Check

**Result:** `npx tsc --noEmit` — **PASS, zero errors** (before AND after fixes).

---

## Files Inspected

| File | Status |
|---|---|
| `lib/auth-context.tsx` | Reviewed + Fixed |
| `lib/upload.ts` | Reviewed + Fixed |
| `lib/db.ts` | Reviewed + Fixed |
| `app/onboarding.tsx` | Reviewed + Fixed |
| `app/login.tsx` | Reviewed + Fixed |
| `app/register.tsx` | Reviewed + Fixed |
| `app/(tabs)/profile.tsx` | Reviewed + Fixed |
| `app/(tabs)/index.tsx` | Reviewed |
| `app/admin/verification.tsx` | Reviewed + Fixed |
| `components/OnboardingGate.tsx` | Reviewed |
| `components/Button.tsx` | Reviewed |
| `supabase/migrations/00001_create_tables.sql` | Reviewed |
| `supabase/migrations/00002_create_storage_buckets.sql` | Reviewed |
| `supabase/migrations/00003_rls_policies.sql` | Reviewed |
| `app/terms.tsx` | Reviewed |
| `app/privacy.tsx` | Reviewed |

---

## What Looks Good

- **TypeScript is clean** — zero errors across the whole project.
- **Onboarding flow UX** is solid: 5-step progressive disclosure, role-branching, clear validation at each step, good copy.
- **Upload abstraction** (`safeUpload` / `uploadToSupabaseStorage`) is clean and well-guarded.
- **RLS policies** are correctly scoped for user-owned data (avatars, verification docs, profile rows).
- **Admin verification UI** is well-built: expandable cards, refresh, approve/reject with confirmation dialogs, loading states.
- **OnboardingGate** correctly redirects unauthenticated or mid-onboarding users.
- **Supabase table schema** has proper constraints, foreign keys, and updated_at triggers.

---

## Findings and Fixes

### P0 — Security / Correctness

#### 1. Mock fallback in login always succeeds — FIXED
**File:** `lib/auth-context.tsx`
**Issue:** When Supabase `signInWithPassword` fails, the catch block fell back to mock data and always returned `{ success: true }` — any email/password combo bypassed auth.
**Fix:** Removed mock fallback. Now returns `{ success: false, error: err.message }` on failure.

#### 2. Mock fallback in register always succeeds — FIXED
**File:** `lib/auth-context.tsx`
**Issue:** Same pattern as login — if Supabase signUp failed, a mock user was created.
**Fix:** Removed mock fallback. Now returns `{ success: false, error: err.message }` on failure. Removed unused `users` import from mock-data.

#### 3. Admin verification screen has zero authentication — FIXED
**File:** `app/admin/verification.tsx`
**Issue:** No auth check. Any user could navigate to `/admin/verification` and approve/reject sitters.
**Fix:** Added email-based admin guard. Only logged-in users with emails in `ADMIN_EMAILS` list can access the screen. Others see "Pristup odbijen" message.

#### 4. RLS allows sitters to self-update verification_status — OPEN
**File:** `supabase/migrations/00003_rls_policies.sql`
**Issue:** The "Sitters: self update" policy only checks `auth.uid() = id`. A sitter could self-verify via direct Supabase call.
**Status:** Not fixed — requires a Postgres trigger or Edge Function, which is beyond the scope of a sanity review micro-fix. Documented for follow-up.

#### 5. `verified` field set to `true` when status is `pending` — FIXED
**File:** `lib/auth-context.tsx`
**Issue:** `verified: onboarding.verificationStatus === 'pending'` set verified=true on submission, before admin approval.
**Fix:** Changed to `verified: false`. Only admin approval should set this to true.

### P1 — Bugs

#### 6. "Skip for now" creates infinite redirect loop — FIXED
**File:** `app/onboarding.tsx`, `lib/auth-context.tsx`
**Issue:** Skip button navigated to tabs but didn't clear `needsOnboarding`, causing OnboardingGate to redirect back.
**Fix:** Added `skipOnboarding()` method to auth context that clears `needsOnboarding` flag. Skip button now calls it before navigating.

#### 7. Private bucket docs return unusable public URLs — FIXED
**Files:** `lib/upload.ts`, `app/admin/verification.tsx`
**Issue:** `getPublicUrl()` was used for verification-documents (private bucket). Admin screen opened these URLs in browser — they'd 403.
**Fix:** Added `getSignedUrl()` helper to upload.ts. Admin verification screen now generates signed URLs on demand when opening documents.

#### 8. Missing `admin_notes` column in sitter_profiles table — FIXED
**File:** `supabase/migrations/00004_add_admin_notes.sql` (new)
**Issue:** `setSitterVerification()` wrote `admin_notes` but the column didn't exist.
**Fix:** Created new migration `00004_add_admin_notes.sql` adding the column.

### P2 — Minor bugs / cleanup

#### 9. Old brand name "Šapicu" remnants — FIXED
**Files:** `app/(tabs)/profile.tsx`, `app/login.tsx`
**Issue:** Guest profile and login screens still said "Šapicu" instead of "PetPark".
**Fix:** Updated both occurrences to "PetPark".

#### 10. Search filter not applied in Supabase query — FIXED
**File:** `lib/db.ts`
**Issue:** `getSitters()` only applied city filter to Supabase query; search filter only worked on mock fallback.
**Fix:** Added `.or()` filter for search term matching against `bio` and `users.full_name`.

#### 11. Document content type detection oversimplified — FIXED
**File:** `app/onboarding.tsx`
**Issue:** Only detected .pdf vs assumed jpeg for everything else.
**Fix:** Added mapping for pdf, png, heic, and jpg content types.

#### 12. Social login buttons non-functional — FIXED
**Files:** `app/login.tsx`, `app/register.tsx`, `app/(tabs)/profile.tsx`
**Issue:** Social buttons either did nothing or silently logged in as demo user.
**Fix:** All social buttons now show "Uskoro" (coming soon) alert. Removed mock login from register.tsx social handler.

#### 13. `completeOnboarding` silently swallows errors — FIXED
**File:** `lib/auth-context.tsx`
**Issue:** Empty catch block after Supabase writes meant data loss was invisible.
**Fix:** Added `console.warn` logging with error message.

---

## Fixes Applied Summary

| # | Priority | File(s) | Description |
|---|---|---|---|
| 1 | P0 | `lib/auth-context.tsx` | Remove mock login fallback |
| 2 | P0 | `lib/auth-context.tsx` | Remove mock register fallback |
| 3 | P0 | `app/admin/verification.tsx` | Add admin email-based auth guard |
| 5 | P0 | `lib/auth-context.tsx` | Fix verified=false on pending |
| 6 | P1 | `lib/auth-context.tsx`, `app/onboarding.tsx` | Add skipOnboarding, fix skip button |
| 7 | P1 | `lib/upload.ts`, `app/admin/verification.tsx` | Add getSignedUrl, use in admin |
| 8 | P1 | `supabase/migrations/00004_add_admin_notes.sql` | Add missing column |
| 9 | P2 | `app/(tabs)/profile.tsx`, `app/login.tsx` | Fix brand name remnants |
| 10 | P2 | `lib/db.ts` | Add search filter to Supabase query |
| 11 | P2 | `app/onboarding.tsx` | Better content type detection |
| 12 | P2 | `app/login.tsx`, `app/register.tsx`, `app/(tabs)/profile.tsx` | Social login → "coming soon" alert |
| 13 | P2 | `lib/auth-context.tsx` | Log completeOnboarding errors |

---

## Still Open (requires follow-up)

1. **P0 #4: RLS self-verification** — sitters can still self-update `verification_status` and `verified` via direct Supabase calls. Needs a Postgres trigger or Edge Function to block this server-side.
2. **Social login implementation** — buttons now show "coming soon" but real Apple/Google/Facebook OAuth should be implemented for production.
3. **Admin verification should use service_role** — current client-side approach relies on RLS. Moving to an Edge Function with service_role would be more secure and also fix P0 #4.

---

## Decisions

- Applied all fixes that could be made safely without changing architecture.
- Used email-based admin guard (hardcoded `ADMIN_EMAILS`) as a pragmatic stopgap — proper admin roles should come from Supabase claims or a roles table.
- Created a new migration file (00004) rather than editing existing ones, since they may already be applied in Supabase.
- Left P0 #4 (RLS self-verification) open since it requires either a Postgres trigger or server-side function — too risky for a sanity review patch.
