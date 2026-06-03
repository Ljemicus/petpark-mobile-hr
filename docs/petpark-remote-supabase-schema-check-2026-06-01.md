# PetPark remote Supabase schema check — 2026-06-01

Remote project: `hmtlcgjcxhjecsbmmxol` (`ACTIVE_HEALTHY`).

## Summary
- Remote public tables: 32
- Tables referenced/created by new local migration: 35
- Direct same-name overlap: 11

## Concept mapping
- users / profiles: remote has `profiles, profile_roles`; absent/new names `users`
- sitter profiles / providers: remote has `providers, provider_sitter_settings, provider_services, service_listings`; absent/new names `sitter_profiles`
- groomers: remote has `providers, provider_groomer_settings, provider_services, service_listings`; absent/new names `groomers`
- trainers: remote has `trainers, provider_trainer_settings, training_programs, trainer_availability, trainer_bookings, trainer_reviews`; absent/new names `—`
- pets/passports/docs: remote has `pets, pet_passports`; absent/new names `pet_appointments, pet_documents`
- booking requests/bookings: remote has `booking_requests, booking_request_messages, booking_request_events, bookings, booking_items`; absent/new names `—`
- chat: remote has `conversations, conversation_participants, messages`; absent/new names `—`
- walks: remote has `walks, walk_checkpoints`; absent/new names `—`
- payments/payouts: remote has `payments, payout_requests, stripe_events`; absent/new names `—`
- notifications: remote has `notifications`; absent/new names `—`
- availability: remote has `availability_slots`; absent/new names `availability`
- forum: remote has `—`; absent/new names `forum_categories, forum_topics, forum_replies`
- shop: remote has `—`; absent/new names `products, product_reviews, cart_items`
- breeder/rescue: remote has `—`; absent/new names `publisher_profiles, litters, puppies, applications, breeder_reviews, breeder_documents, rescue_listings, rescue_appeals`

## Direct table overlap with new migration
`bookings`, `messages`, `notifications`, `pet_passports`, `pets`, `reviews`, `trainer_availability`, `trainer_bookings`, `trainers`, `training_programs`, `walks`

## New migration tables missing by exact name on remote
`applications`, `availability`, `breeder_documents`, `breeder_reviews`, `cart_items`, `forum_categories`, `forum_replies`, `forum_topics`, `groomer_availability`, `groomer_bookings`, `groomer_portfolio`, `groomers`, `litters`, `pet_appointments`, `pet_documents`, `pet_updates`, `product_reviews`, `products`, `publisher_profiles`, `puppies`, `rescue_appeals`, `rescue_listings`, `sitter_profiles`, `users`

## Remote tables
`availability_slots`, `booking_items`, `booking_request_events`, `booking_request_messages`, `booking_requests`, `bookings`, `conversation_participants`, `conversations`, `messages`, `notifications`, `payments`, `payout_requests`, `pet_passports`, `pets`, `profile_roles`, `profiles`, `provider_groomer_settings`, `provider_services`, `provider_sitter_settings`, `provider_trainer_settings`, `providers`, `reviews`, `service_listings`, `stripe_events`, `trainer_availability`, `trainer_bookings`, `trainer_reviews`, `trainers`, `training_programs`, `waitlist_requests`, `walk_checkpoints`, `walks`

## Recommendation
Do not apply `00006_mobile_feature_foundation.sql` to remote as-is. Remote already has a better normalized schema (`profiles`, `providers`, `service_listings`, `booking_requests`, `conversations`, `availability_slots`). The mobile app should be adapted to that schema, and only truly missing modules like forum/shop/breeder/rescue should get additive migrations after confirmation.
