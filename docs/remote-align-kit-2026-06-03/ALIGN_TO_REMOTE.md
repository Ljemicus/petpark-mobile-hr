# OPENCLAW TASK — PetPark Mobile: align to the REAL remote Supabase schema

Repo: `~/Projects/petpark-mobile` (Expo SDK 55, Expo Router, RN, Supabase).
Branch: `feat/mobile-complete-kit`. Last commit: `e4421e3 feat(mobile): add complete kit
foundation`. Remote Supabase project: `hmtlcgjcxhjecsbmmxol` (ACTIVE_HEALTHY, eu-west-1, pg17).

## Situation
A prior pass built a LOCAL draft schema (`supabase/migrations/00006_mobile_feature_foundation.sql`)
and wired some screens to draft tables (`users`, `sitter_profiles`, `groomers`, `availability`,
direct sender/receiver messages, `forum_*`). THEN it was discovered the **remote already has a
richer, normalized 32-table schema**. So the draft is duplicate/wrong direction.

**Goal of THIS task:** convert the mobile app's data access to the EXISTING remote schema,
keep all the safe fixes that already landed, and reduce new migrations to only genuinely
missing modules (forum, shop, breeder/rescue, maybe pet extras) — as an **approval-gated
additive plan**, not applied.

Build currently passes (tsc 0, expo-doctor 19/19, ios+android export, nav orphans 0, payments
gated off). Don't regress that.

## Absolute rules (from the handoff — do not violate)
1. **Do NOT push/apply ANY migration to remote Supabase** (incl. `00006`) without explicit
   human approval. Treat `00006` as local draft/reference only.
2. **Do NOT touch the web repo** (`~/Projects/petpark`).
3. **Payments stay OFF:** keep `PAYMENTS_ENABLED=false` and the Croatian "Plaćanje uskoro" UI.
   No live or sandbox Stripe.
4. **Preserve the Booking-Request Conversation MVP** behavior and its tables
   (`booking_requests`, `booking_request_messages`, `booking_request_events`).
5. Keep PetPark branding + `PetParkLogo`; never reintroduce "Šapica".
6. Do NOT discard commit `e4421e3` or `git reset` away work. Build on the branch.
7. Do NOT commit `.env*` or secrets. Croatian UI copy preferred.
8. Any schema change = minimal ADDITIVE migration plan FIRST, then wait for approval.

## Keep vs Rewrite (explicit)
**KEEP as-is (already correct/safe):**
- `lib/payments/config.ts` + payment-gate changes in `app/payments/checkout.tsx`,
  `app/shop/basket.tsx`, `lib/shop.ts`.
- Dead-nav fix for `/objavi-uslugu` in `app/(tabs)/index.tsx`.
- `scripts/audit-features.sh`.
- The type split in `lib/domain-types.ts` (adapt the type shapes to remote columns, but keep
  the decoupling from `mock-data`).

**REWRITE to use remote schema:**
- `lib/db.ts` (the data adapters — the core of this task).
- `app/chat/new-chat.tsx`, `app/(tabs)/forum.tsx`, `app/topic/[id].tsx`, `app/sitter/[id].tsx`,
  and any screen whose query currently hits draft tables.

---

## Phase 0 — introspect the REAL remote schema (read-only) — DO THIS FIRST
The handoff lists remote table NAMES but not their COLUMNS. You must not guess field names.
Run the included script with a **read-only** DB connection:

    DATABASE_URL="postgresql://<readonly-conn>" bash scripts/introspect-remote.sh
    # (or, if the supabase CLI is linked to hmtlcgjcxhjecsbmmxol, the script falls back to it)

Read first: `remote-schema/SCHEMA-SUMMARY.md` (every table's real columns),
`remote-schema/03-foreign-keys.tsv` (how to join), `remote-schema/04-enums.tsv` (status enum
values), `remote-schema/06-rls-policies.tsv` (what an authed user is allowed to do).
`remote-schema/` is gitignored — do not commit DB dumps. If you cannot get a connection, STOP
and ask the human for a read-only `DATABASE_URL`; do not proceed by guessing columns.

Also regenerate the typed client from the remote schema and make it the source of truth:

    supabase gen types typescript --project-id hmtlcgjcxhjecsbmmxol > lib/database.types.ts
    # (or --linked / --db-url; whichever the repo is set up for)

Wire `createClient<Database>(...)` to these types so the compiler catches wrong
columns/tables for you.

## Phase 1 — map draft concepts to remote (write it down, then code)
Using the introspection output, produce
`docs/remote-schema-mapping-2026-06-01.md` containing, for each draft call the app makes, the
exact remote table(s)+columns+joins to use. Confirmed concept mapping from the handoff (verify
columns against Phase 0):
- `users` → `profiles` (+ `profile_roles` for role)
- `sitter_profiles` → `providers` + `provider_sitter_settings` + `provider_services` +
  `service_listings`
- `groomers` → `providers` + `provider_groomer_settings` + `provider_services` +
  `service_listings`
- `availability` → `availability_slots`
- direct sender/receiver messages → `conversations` + `conversation_participants` + `messages`
- bookings/requests → keep `booking_requests*` (MVP) and `bookings`/`booking_items` as they are
- trainers → `trainers` + `provider_trainer_settings` + `training_programs` +
  `trainer_availability` + `trainer_bookings` + `trainer_reviews`
- pets/passports → `pets` + `pet_passports`; walks → `walks` + `walk_checkpoints`;
  notifications → `notifications`
This doc is the spec for Phase 2. Keep it accurate; you'll reference it in review.

## Phase 2 — rewrite data adapters in `lib/db.ts` (and the screens) to remote
Rewrite each adapter to the mapped remote tables, using the regenerated types. At minimum
(confirm/extend against the real screens):
- `getSitters()` / `getSitterById()` → from `providers` + `service_listings` +
  `provider_sitter_settings` (+ `provider_services`), joined per `03-foreign-keys.tsv`.
- `getChatContacts()` → from `profiles` / `providers` (+ existing `conversations` for who the
  user already talks to).
- chat thread + detail → `conversations` / `conversation_participants` / `messages`
  (newest-last; unread via the participants/last-read columns the schema actually has).
- availability reads → `availability_slots` (+ `trainer_availability` where trainer-specific).
- Booking-request flows → keep hitting `booking_requests*`; do not rename or fork them.
Update `lib/domain-types.ts` shapes to match the remote columns (keep the names the UI uses,
map fields in the adapter). Replace any remaining draft-table query in the changed screens
(`new-chat`, `forum`, `topic/[id]`, `sitter/[id]`). After this phase, NO app/lib query should
reference `users`, `sitter_profiles`, `groomers`, `availability`, or a direct
sender/receiver messages table.

## Phase 3 — isolate the draft migration; plan ONLY genuinely-missing modules
- Move `supabase/migrations/00006_mobile_feature_foundation.sql` OUT of the applied migrations
  path so it can never auto-apply: e.g. rename to
  `supabase/drafts/00006_mobile_feature_foundation.DRAFT.sql` and add a header comment "DRAFT —
  do not apply to remote; superseded by remote schema". Keep it for reference.
- Write `supabase/drafts/additive-plan-2026-06-01.md` proposing minimal ADDITIVE migrations
  for the truly-missing modules (these are NOT on remote per the handoff):
  - **forum:** `forum_categories`, `forum_topics`, `forum_replies`
  - **shop:** `products`, `product_reviews`, `cart_items`
  - **breeder/rescue:** `publisher_profiles`, `litters`, `puppies`, `applications`,
    `breeder_reviews`, `breeder_documents`, `rescue_listings`, `rescue_appeals`
  - **maybe pet extras:** `pet_appointments`, `pet_documents`, `pet_updates`
  For each: columns, FKs to existing remote tables (e.g. author → `profiles`), and RLS
  policies. Provide them as ready-to-review SQL files under `supabase/drafts/` but **do not
  apply them**. Explicitly list which features stay non-functional until these are approved
  (forum, shop catalog, breeder/rescue dashboards).

## Phase 4 — handle features that depend on unapproved tables
For in-scope features whose tables are NOT yet on remote (forum, shop catalog, breeder/rescue):
- Do NOT fake them with draft tables. Instead render a clean, honest state in Croatian:
  e.g. forum/shop list shows an inviting "Uskoro" / empty state, not a crash or mock list.
- Keep the screens and navigation intact (so approving the additive migration later just turns
  them on). Gate behind a simple feature flag if helpful (mirroring `PAYMENTS_ENABLED`).
Features whose tables DO exist on remote (chat, pets/passport, walks, notifications, booking
requests, provider/sitter/trainer listings, profile) must actually work against remote.

## Phase 5 — gates
1. `npx tsc --noEmit` → 0 (the regenerated `database.types.ts` should now catch schema drift).
2. `npx expo-doctor` → pass.
3. `npx expo export --platform ios` AND `--platform android` → both pass.
4. `bash scripts/audit-features.sh` → nav orphans 0; no draft-table references remain in the
   matrix; supabase calls now point at remote tables.
5. Grep gate: `grep -RnE "from\('(users|sitter_profiles|groomers|availability)'\)" app lib`
   returns NOTHING.
6. If you can get the local stack running, smoke-test the remote-backed reads against a dev/
   staging connection (NOT production writes). Note the Colima `docker.sock` mount blocker from
   the handoff — if `supabase start` still fails on infra, say so and rely on typed compile +
   export + read-only introspection rather than claiming a full local run.

## Phase 6 — commit
On `feat/mobile-complete-kit` (do not discard `e4421e3`). Suggested commits:
- `refactor(mobile): regenerate types from remote schema; type the supabase client`
- `refactor(mobile): rewrite lib/db adapters onto remote profiles/providers/service_listings`
- `refactor(mobile): chat onto conversations/messages; remove draft message model`
- `chore(mobile): move 00006 to supabase/drafts (do not apply); add additive migration plan`
- `feat(mobile): honest "Uskoro" states for forum/shop/breeder pending additive schema`
Also commit (or remove) the stray `docs/petpark-remote-supabase-schema-check-2026-06-01.md`
mentioned in the handoff, plus the new mapping/plan docs. Do NOT apply migrations to remote.
Do NOT commit `.env*`/keys or the `remote-schema/` dump.

---

## Acceptance criteria
1. No app/lib query references draft tables (`users`, `sitter_profiles`, `groomers`,
   `availability`) or a direct sender/receiver message model; Phase-5 grep gate is clean.
2. `lib/database.types.ts` regenerated from remote `hmtlcgjcxhjecsbmmxol`; client typed with it;
   `tsc --noEmit` = 0.
3. Remote-backed features (chat, pets/passport, walks, notifications, booking requests,
   provider/sitter/trainer listings, profile) read/write the REAL remote tables per the mapping
   doc; booking-request MVP preserved.
4. `00006` moved to `supabase/drafts/` and cannot auto-apply; a reviewed ADDITIVE migration plan
   (forum/shop/breeder-rescue/pet-extras) exists as draft SQL, NOT applied.
5. Features lacking remote tables show honest Croatian "Uskoro"/empty states, screens + nav
   intact, no mock/crash.
6. Payments still `PAYMENTS_ENABLED=false` with "Plaćanje uskoro"; no Stripe. `/objavi-uslugu`
   nav fix intact.
7. `expo-doctor` pass; `expo export` ios+android pass; `audit-features.sh` nav orphans 0.
8. Branding/logo intact; no Šapica; web repo untouched; remote DB NOT migrated; no secrets/dumps
   committed.

## Report back
- The remote `SCHEMA-SUMMARY.md` highlights you relied on (key columns/FKs/enums per table).
- The mapping doc (draft concept → remote tables/columns/joins).
- Per adapter/screen: the exact remote query you now use and what it replaced.
- The additive migration plan (which modules, tables, FKs, RLS) and the explicit list of
  features that stay "Uskoro" until approved.
- Gate results: tsc, expo-doctor, both exports, audit matrix, and the Phase-5 grep gate output.
- Whether `supabase start` ran locally or was still blocked by Colima (and what you verified
  instead).
- Confirmations: remote NOT migrated, payments off, MVP preserved, web repo untouched, no
  Šapica, logo intact, no secrets/dumps committed.
