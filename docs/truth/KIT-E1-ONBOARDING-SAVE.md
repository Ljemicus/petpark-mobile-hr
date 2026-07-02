# KIT-E E.1 — Onboarding save truth (2026-07-02)

## Problem

E.0 dijagnostika je potvrdila da `completeOnboarding()` hvata Supabase grešku, ali zatim lokalno postavlja:

- `setUser(...)`
- `setNeedsOnboarding(false)`

To je moglo prikazati lažni uspjeh: korisnik bi prošao onboarding lokalno iako remote zapis nije spremljen.

## Promjena

- `completeOnboarding()` sada vraća `{ success: boolean; error?: string }`.
- Bez aktivne sesije vraća grešku i ne mijenja lokalni onboarding state.
- `supabase.auth.updateUser`, `profiles.upsert` i `providers.upsert` sada provjeravaju `error`.
- Lokalni `user` i `needsOnboarding=false` mijenjaju se tek nakon uspješnog remote spremanja.
- `app/onboarding.tsx` prikazuje grešku i ostaje na onboardingu ako save ne uspije.

## Granice

- Nema remote migracija.
- Nema promjene RLS-a.
- Nema promjene onboarding sheme.
