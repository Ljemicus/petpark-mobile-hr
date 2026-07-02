# TRUTH — PetPark KIT-0 inventura (2026-07-02)

## Kratka istina

- Web repo: route manifest generated and classified into LAUNCH/GATED/NOINDEX/STUB.
- Mobile repo: env/fake-surface audit done; mobile route manifest generated from Expo Router files.
- Remote Supabase schema is authoritative: 32 public tables found, all with RLS enabled.
- No remote forum/shop/breeder tables exist. Those modules must be honest `Uskoro`/stub until a signed migration exists.
- Trainer/training tables exist remotely and are candidates for real mobile alignment, but RLS behavior still needs KIT-C/KIT-E tests.
- Payments remain disabled/out of scope; payment routes/screens must fail closed and show no transaction illusion.

## Web modules

- Core public pages/search/provider profiles/legal/contact: LAUNCH, subject to copy/legal gates.
- Booking request/notifications/messages data model: real remote tables exist; behavior gates continue in KIT-B/C.
- Shop/checkout/payments: GATED.
- Forum: STUB because forum tables are absent remotely.
- Breeders/uzgajivačnice: STUB/NOINDEX depending route because breeder tables are absent and mock data exists.
- Dashboards/admin/profile/messages/settings: NOINDEX/private.
- Design lab/redesign previews: NOINDEX and candidate for guard in KIT-D.

## Mobile modules

- Supabase env references are minimal: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`.
- Mobile shop has confirmed hardcoded fallback products/reviews in `lib/shop.ts`; KIT-E should replace with `Uskoro`.
- Mobile payments config already hard-disables payments with `PAYMENTS_ENABLED=false`; KIT-E should verify every entry point fails closed.
- Mobile trainer screens map to live remote trainer tables, but write/read behavior must be tested after KIT-C type/schema alignment.

## Decisions carried forward

- V1 is Croatian-first; do not invent root `/en`. Existing suffix EN pages need KIT-D SEO cleanup/no accidental hreflang expansion.
- No production deploy/env writes/data writes/migrations without explicit approval.
- No Šapica branding and no PetPark logo/slider changes in these kits.

## Artifacts

- `docs/truth/ROUTE-MANIFEST.md`
- `docs/truth/MOBILE-ROUTE-MANIFEST.md` in mobile repo
- `docs/truth/live-schema-dump-2026-07-02.md`
- `docs/truth/TABLE-CLASSIFICATION.md`
- `docs/truth/ENV-MATRIX.md`
- `docs/truth/FAKE-SURFACES.md`
