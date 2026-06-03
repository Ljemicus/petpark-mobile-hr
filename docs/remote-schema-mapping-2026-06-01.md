# PetPark Mobile remote schema mapping — 2026-06-01

Source of truth: `lib/database.types.ts` regenerated from Supabase project `hmtlcgjcxhjecsbmmxol` on 2026-06-03. The provided `scripts/introspect-remote.sh` was attempted first but the installed Supabase CLI no longer supports its `--stdin` query flag; no remote writes were made.

## Confirmed remote tables
`availability_slots`, `booking_items`, `booking_request_events`, `booking_request_messages`, `booking_requests`, `bookings`, `conversation_participants`, `conversations`, `messages`, `notifications`, `payments`, `payout_requests`, `pet_passports`, `pets`, `profile_roles`, `profiles`, `provider_groomer_settings`, `provider_services`, `provider_sitter_settings`, `provider_trainer_settings`, `providers`, `reviews`, `service_listings`, `stripe_events`, `trainer_availability`, `trainer_bookings`, `trainer_reviews`, `trainers`, `training_programs`, `waitlist_requests`, `walk_checkpoints`, `walks`.

## Draft concept → remote mapping

| Draft/local concept | Remote table(s) and key columns | Join / query notes | Status |
|---|---|---|---|
| `users` | `profiles(id, display_name, email, city, avatar_url, phone, status, onboarding_state)` + `profile_roles(profile_id, role)` | `profile_roles.profile_id -> profiles.id` | Use remote |
| `sitter_profiles` | `providers(id, profile_id, provider_kind, display_name, city, bio, rating_avg, review_count, verified_status, public_status)` + `provider_sitter_settings(provider_id, ...)` + `provider_services(provider_id, service_code, base_price, is_active)` + `service_listings(provider_id, title, short_description, photos, status)` | `providers.profile_id -> profiles.id`; settings/services/listings all FK to `providers.id`; filter `provider_kind = 'sitter'` | Use remote |
| `groomers` | `providers` + `provider_groomer_settings(provider_id, specialization, mobile_service, working_hours_json)` + `provider_services` + `service_listings` | Same provider joins; filter `provider_kind = 'groomer'` | Use remote |
| `availability` | `availability_slots(id, provider_id, starts_at, ends_at, status, timezone, service_code)` | `availability_slots.provider_id -> providers.id`; use `status` instead of boolean `available` | Use remote |
| Direct `messages(sender_id, receiver_id, read)` | `conversations(id, created_by_profile_id, booking_id, last_message_at)` + `conversation_participants(conversation_id, profile_id, last_read_at)` + `messages(id, conversation_id, sender_profile_id, content, image_storage_path, message_type, created_at)` | Unread state comes from participant `last_read_at`; sender is `sender_profile_id`; no receiver columns on `messages` | Use remote |
| Booking request MVP | `booking_requests`, `booking_request_messages`, `booking_request_events` | Preserve as-is; remote tables exist | Keep |
| Bookings | `bookings`, `booking_items` | Owner/provider/pet FKs via `owner_profile_id`, `provider_id`, `pet_id` | Use remote |
| Trainers | `trainers`, `provider_trainer_settings`, `training_programs`, `trainer_availability`, `trainer_bookings`, `trainer_reviews` | `training_programs.trainer_id -> trainers.id`; trainer availability uses `trainer_id/date/start_time/end_time` | Use remote |
| Pets/passports | `pets(owner_profile_id, ...)` + `pet_passports(pet_id, vet_name, vet_phone, vet_address, raw_json, notes)` | `pet_passports.pet_id -> pets.id`; app maps legacy vaccination arrays into `raw_json` | Use remote |
| Walks | `walks(owner_profile_id, provider_id, pet_id, started_at, ended_at, route_geojson, distance_km)` + `walk_checkpoints(walk_id, ...)` | No `sitter_id`; use `provider_id` | Use remote |
| Notifications | `notifications(profile_id, title, body, read_at, type, data)` | Profile-scoped | Use remote |
| Forum | Missing: `forum_categories`, `forum_topics`, `forum_replies` | Must be additive migration; screens show Uskoro until approved | Pending |
| Shop catalog/cart | Missing: `products`, `product_reviews`, `cart_items` | Must be additive migration; keep payment gate OFF | Pending |
| Breeder/rescue | Missing: publisher/listing/application/review/document tables | Must be additive migration | Pending |
| Pet extras | Missing: `pet_appointments`, `pet_documents`, `pet_updates` | Existing app calls should return empty/Uskoro until approved | Pending |

## Adapter work completed in this pass
- `lib/db.ts` sitter list/detail now reads `providers` + `profiles` + `provider_services` + `service_listings` instead of `sitter_profiles/users`.
- `lib/db.ts` chat contact search now reads `providers` + `profiles` instead of `sitter_profiles/users`.
- `lib/db.ts` forum adapters return empty arrays/null because forum tables do not exist remotely.
- `lib/db.ts` pets now use `owner_profile_id`; passport maps remote `pet_passports.raw_json` + vet columns.
- `lib/db.ts` pet appointment/document reads return empty arrays until additive pet-extra schema is approved.

## Still to align
The regenerated typed client exposes additional legacy references outside `lib/db.ts` (dashboard/payment/booking/chat/walk modules). These should be mapped using this doc before gates can pass.
