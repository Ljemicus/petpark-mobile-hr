# Workstream 2: Admin Verification Flow

## Plan (2026-04-03 ~10:00 CEST)

Build a minimal internal admin verification screen for reviewing and approving/rejecting sitter verification requests.

**Approach:** Hidden route (`/admin/verification`) with no auth guard — documented as internal-only. Matches existing app patterns (Expo Router, Supabase, same design tokens).

## Files Changed

| File | Change |
|---|---|
| `lib/db.ts` | Added `PendingSitter` type, `getPendingSitters()`, `setSitterVerification()` |
| `app/admin/verification.tsx` | New screen — verification queue with approve/reject flow |
| `app/_layout.tsx` | Registered `admin/verification` route in Stack navigator |

## Decisions

1. **No admin auth** — the app has no role-based auth system yet. The screen is accessible via direct navigation only (`/admin/verification`). A yellow banner warns it's internal-only.
2. **Uses existing `sitter_profiles` table** — reads `verification_status = 'pending'` rows. On approve: sets `verified = true` + `verification_status = 'verified'`. On reject: sets `verification_status = 'rejected'`.
3. **Optional `admin_notes` column** — the update query sends `admin_notes` if the admin writes a note. If the column doesn't exist in Supabase yet, the field is silently ignored (Supabase behavior).
4. **Documents open via `Linking.openURL`** — taps on uploaded docs open them in the device browser. Works for both images and PDFs stored in Supabase Storage.

## Remaining Gaps

- **Admin authentication**: No login gate — anyone who navigates to the route can use it. Next step: add a simple PIN/password gate or tie into Supabase RLS with an admin role.
- **Rejection notification**: Sitters are not notified when rejected. Could add push notification or in-app status update.
- **Verified-to-pending re-submission**: No flow for a rejected sitter to re-apply.
- **`admin_notes` column**: Needs to be created in Supabase if it doesn't already exist (`ALTER TABLE sitter_profiles ADD COLUMN admin_notes TEXT`).
- **Profile screen update**: The sitter's profile screen currently only shows "pending" or "none" — should also handle "verified" and "rejected" states with appropriate UI.

## Next Steps

1. Add simple PIN-based access gate to admin screen.
2. Create `admin_notes` column in Supabase.
3. Update profile screen to show rejected/verified states.
4. Add entry point (e.g., hidden long-press on profile tab) for admin access.
