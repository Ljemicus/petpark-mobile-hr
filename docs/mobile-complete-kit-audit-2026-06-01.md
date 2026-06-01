# PetPark Mobile complete kit audit — 2026-06-01

## What was received
Zip contains:
- `README.md`
- `COMPLETE_MOBILE.md`
- `scripts/audit-features.sh`

This is not a patch/drop-in implementation. It is a work order for taking the mobile app from “builds” to “all features work end-to-end”. Payments remain out of scope and should be gated behind `PAYMENTS_ENABLED=false`.

## Repo checked
- Repo: `/Users/ljemicus/Projects/petpark-mobile`
- Branch: `production`
- HEAD: `a24eeff`
- Web repo was not touched.

## What I ran
Copied the kit audit script into:
- `scripts/audit-features.sh`

Then ran:

```bash
bash scripts/audit-features.sh
```

Generated output:
- `feature-audit/`

## Baseline result
Build health is still green at audit time:
- `tsc` errors: `0`
- iOS export smoke inside the script completed without reported failure.

Functional readiness is not complete yet.

Audit matrix:

```text
FEATURE                  files screens sb_calls  loading    empty    error  mockData
booking                     14      10        0       10       10       11         0
chat                         5       4        2        2        3        2         1
passport                     3       3        1        2        2        2         0
walk                         5       3        1        3        2        4         0
owner-dashboard              2       0        0        0        0        1         0
sitter-dashboard             4       1        1        1        1        2         1
groomer-dashboard            2       0        0        0        0        1         0
trainer-dashboard            2       0        0        0        0        1         0
breeder-dashboard            2       0        0        0        1        1         1
rescue-dashboard             0       -        -        -        -        -         -
shop                         8       5        1        4        3        3         0
search                       2       1        0        0        0        0         0
profile                      2       2        0        0        1        2         0
notifications                4       2        0        1        1        2         1
```

## Main gaps found

### 1. The kit’s goal is much bigger than the current DB migrations
The app references many tables, but current migrations only create a small core:
- `users`
- `sitter_profiles`
- payment tables from `001_mobile_payments.sql`

The audit found app references to tables such as:
- `messages`
- `bookings`
- `pets`
- `walks`
- `availability`
- `reviews`
- `groomers`
- `groomer_bookings`
- `groomer_availability`
- `trainers`
- `trainer_bookings`
- `training_programs`
- `publisher_profiles`
- `litters`
- `puppies`
- `applications`
- `products`
- `cart_items`
- `product_reviews`
- passport/document tables

These need local migrations, RLS policies, and seed data before the app can honestly be called end-to-end functional.

### 2. Mock/fallback data still exists
Files importing `lib/mock-data`:
- `app/chat/new-chat.tsx`
- `app/(tabs)/forum.tsx`
- `app/topic/[id].tsx`
- `app/sitter/[id].tsx`
- `components/SitterCard.tsx`
- `components/ForumTopicCard.tsx`
- `lib/navigation.ts`
- `lib/auth-context.tsx`
- `lib/db.ts`

Important: some “mockData” count is from type imports or fallback paths, not always visible fake UI. But for the kit acceptance criteria, those need to be removed or isolated for out-of-scope/static features.

### 3. Navigation orphan
One dead navigation target was found:

```text
NO MATCH: /objavi-uslugu
```

This either needs a route or the button must point to the correct existing route.

### 4. Booking Request MVP exists separately from legacy booking tables
The current mobile app already has web-backed booking-request API clients:
- `lib/api/booking-requests.ts`
- `lib/api/notifications.ts`

But older/native feature areas also reference direct Supabase tables like `bookings`, `messages`, etc. The completion pass must not break the booking-request MVP while adding local schema coverage for the older/direct Supabase flows.

### 5. Local Supabase is not currently available
`supabase status` failed because Docker is not reachable:

```text
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

So Phase 1 cannot proceed until Colima/Docker is running locally. No remote DB was touched.

## Safe next implementation order

1. Create a branch, e.g. `feat/mobile-complete-kit`.
2. Fix the one nav orphan: `/objavi-uslugu`.
3. Add local-only migrations for all tables currently referenced by the app.
4. Add idempotent local seed data covering owner/sitter/groomer/trainer/breeder/rescue/shop/passport/walk/chat/notifications.
5. Regenerate Supabase types from local schema.
6. Remove mock fallback paths feature-by-feature.
7. Gate payments with a clear `PAYMENTS_ENABLED=false` boundary.
8. Re-run:
   - `npx tsc --noEmit`
   - `npx expo-doctor`
   - `npx expo export --platform ios`
   - `npx expo export --platform android`
   - `bash scripts/audit-features.sh`

## Current repo changes made by this audit
Uncommitted generated/added files:
- `scripts/audit-features.sh`
- `feature-audit/`
- `docs/mobile-complete-kit-audit-2026-06-01.md`

No production/remote DB touched. No secrets committed. Web repo untouched.
