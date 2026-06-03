# PetPark Mobile — remote schema alignment handoff

Date: 2026-06-03  
Repo: `/Users/ljemicus/Projects/petpark-mobile`  
Branch: `feat/mobile-complete-kit`  
Baseline commit before final pass: `d734a9b chore(mobile): align partial remote schema safely`

## Summary

Completed the remaining work from the remote-alignment zip as a safe mobile-side alignment pass.

The app now compiles and exports against the real remote Supabase types generated from project `hmtlcgjcxhjecsbmmxol`. Legacy draft schema references were removed from active app/lib Supabase queries. Features whose remote tables do not exist yet are kept as safe, honest empty/“Uskoro” paths instead of querying draft tables.

No remote Supabase migration was applied or pushed.

## Hard rules respected

- Remote DB was **not migrated**.
- No Supabase migration was pushed/applied.
- Web repo `~/Projects/petpark` was not touched.
- Payments remain disabled: `PAYMENTS_ENABLED = false`.
- Booking Request Conversation MVP tables remain preserved.
- PetParkLogo/branding was not changed.
- No Šapica branding was introduced; only references are in the kit instructions saying not to use it.
- No `.env`, secrets, DB dumps, or remote-schema dump were committed/added.

## What was already committed in previous checkpoint

Commit:

```text
d734a9b chore(mobile): align partial remote schema safely
```

That checkpoint added:

- `lib/database.types.ts` regenerated from remote Supabase public schema.
- typed Supabase client via `createClient<Database>()`.
- remote-alignment kit under `docs/remote-align-kit-2026-06-03/`.
- `docs/remote-schema-mapping-2026-06-01.md`.
- `scripts/introspect-remote.sh`.
- moved `supabase/migrations/00006_mobile_feature_foundation.sql` to `supabase/drafts/00006_mobile_feature_foundation.DRAFT.sql`.
- added additive draft plan and draft SQL under `supabase/drafts/`.

## Final pass completed after `d734a9b`

### 1. Auth/onboarding aligned to remote schema

File:

- `lib/auth-context.tsx`

Changed onboarding writes from draft tables:

- `users`
- `sitter_profiles`

To remote tables:

- `profiles`
- `providers`
- `provider_sitter_settings`

The app still updates auth metadata for local UX, but DB persistence now targets the remote normalized schema.

### 2. Booking flow aligned to remote schema

File:

- `lib/booking-db.ts`

Rewrote booking adapter around real remote columns:

- `bookings.owner_profile_id`
- `bookings.provider_id`
- `bookings.primary_service_code`
- `bookings.starts_at`
- `bookings.ends_at`
- `bookings.total_amount`
- `bookings.platform_fee_amount`
- `bookings.owner_note`
- `pets.owner_profile_id`
- `availability_slots`
- `providers`
- `provider_services`

Removed active usage of old draft concepts:

- `owner_id`
- `sitter_id`
- `service_type`
- `start_date`
- `end_date`
- `total_price`
- `availability`
- `sitter_profiles`
- `users` joins

The adapter maps remote rows back into the existing app-facing `Booking`, `SitterInfo`, `PetInfo`, and `Availability` shapes so screens did not need a large UI rewrite.

### 3. Checkout aligned while payments remain disabled

File:

- `app/payments/checkout.tsx`

Updated checkout read path from draft joins to remote joins:

- `bookings`
- `providers!bookings_provider_id_fkey`
- `pets!bookings_pet_id_fkey`

Provider Stripe readiness now reads from `providers.stripe_account_id` and `providers.stripe_onboarding_complete`.

Payments are still gated off by `PAYMENTS_ENABLED = false`; the checkout UI shows “Plaćanje uskoro” and does not start live/sandbox transactions.

### 4. Groomer dashboard safe remote path

Files:

- `lib/groomer-dashboard-db.ts`
- `app/dashboard/groomer/profile.tsx`
- `app/dashboard/groomer/availability.tsx`

Removed active `groomers` draft table usage.

Groomer profile now uses:

- `providers` with `provider_kind = 'groomer'`
- `provider_groomer_settings`

Groomer availability/bookings/portfolio functions remain safe empty or no-op where the remote schema does not have the old draft dashboard tables.

### 5. Sitter dashboard aligned/stabilized

File:

- `lib/sitter-dashboard-db.ts`

The sitter dashboard now uses remote-backed concepts where present:

- `providers`
- `provider_sitter_settings`
- `provider_services`
- `availability_slots`
- `bookings`
- `reviews`
- conversation helpers

Old direct `availability`/`sitter_profiles` references were removed from active queries.

### 6. Owner dashboard/chat aligned to conversations model

Files:

- `lib/owner-dashboard-db.ts`
- `lib/chat/db.ts`
- `lib/chat/realtime.ts`

Chat now uses the remote normalized model:

- `conversations`
- `conversation_participants`
- `messages`
- `profiles`

Existing UI types still expose `sender_id` / `receiver_id` because screens are built around those fields, but they are now adapter-level compatibility fields mapped from `messages.sender_profile_id` and conversation participants. Active DB queries no longer use the old direct sender/receiver message table model.

### 7. Trainer/walk modules stabilized against remote schema

Files:

- `lib/trainer-dashboard-db.ts`
- `lib/walk-db.ts`

Trainer and walk paths were adjusted to remote-compatible reads/writes where possible and safe empty/no-op paths where old dashboard-specific tables do not exist.

Remote-backed walk tables used:

- `walks`
- `walk_checkpoints`
- `bookings`

### 8. Missing-table features made honest and safe

Files:

- `lib/breeder-dashboard-db.ts`
- `lib/shop.ts`
- `app/(tabs)/forum.tsx`
- `lib/db.ts`

The remote schema still does not include approved production tables for:

- forum categories/topics/replies
- shop products/cart/reviews
- breeder/rescue dashboards
- some pet extras

Those modules now return empty/disabled/“Uskoro” behavior instead of querying draft tables. Draft additive SQL remains in `supabase/drafts/` for future approval.

## Gates run

All required local gates passed after the final pass.

```bash
npx tsc --noEmit
```

Result: passed, 0 errors.

```bash
npx expo-doctor
```

Result: passed, 19/19 checks.

```bash
bash scripts/audit-features.sh
```

Result: passed enough for this alignment gate:

- `tsc errors: 0`
- `nav orphans: 0`
- `supabase tables referenced: 17`

```bash
npx expo export --platform ios
```

Result: passed, exported to `dist`.

```bash
npx expo export --platform android
```

Result: passed, exported to `dist`.

Draft-table grep gate:

```bash
grep -RnE "from\('(users|sitter_profiles|groomers|availability)'\)|from\(\"(users|sitter_profiles|groomers|availability)\"\)" app lib
```

Result: no active app/lib matches.

Old direct message-query grep gate:

```bash
grep -RnE "from\('messages'\).*sender_id|from\(\"messages\"\).*sender_id|sender:users|receiver:users|receiver_id\.eq|sender_id\.eq" app lib
```

Result: no active app/lib matches.

## Known limitations / still not production-complete

This pass makes the mobile app compile/export and stops it from targeting the duplicate local draft schema. It does **not** make every planned PetPark feature production-ready.

Still pending human approval / future DB work:

1. Apply or revise additive migrations for missing modules:
   - forum
   - shop catalog/cart/reviews
   - breeder/rescue dashboards
   - pet extras
2. Real device QA:
   - auth onboarding writes
   - booking request/booking flow
   - chat send/receive
   - sitter/provider profile flows
   - walk tracking
3. Remote RLS QA with real test users.
4. Payment activation remains intentionally blocked until explicitly approved.
5. Supabase CLI introspection script still needs updating if `supabase db query --stdin` is unavailable in the installed CLI; types were generated successfully via `supabase gen types`.

## Recommended next step

Commit this final pass after review, then run a real-device smoke test against remote Supabase with test accounts. Do **not** apply any `supabase/drafts/*.sql` without explicit approval.
