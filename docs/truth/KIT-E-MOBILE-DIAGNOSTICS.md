# KIT-E E.0 — Mobile istina dijagnostika (2026-07-02)

## Branch

`fix/kit-e-mobile-istina`

## Silent catches

Detaljna tablica: `docs/truth/silent-catches.md`

Rezultat read-only skena: 52 catch mjesta vraćaju `[]`, `null` ili `false`. Sva pronađena mjesta barem logiraju u console, ali UI i pozivatelji i dalje često vide prazan state umjesto stvarne greške.

## `completeOnboarding()` stvarni tok

Datoteka: `lib/auth-context.tsx`

Trenutno ponašanje:

1. Pokuša `supabase.auth.updateUser()` s onboarding metapodacima.
2. Pokuša `profiles.upsert()`.
3. Ako je rola sitter, pokuša `providers.upsert()`.
4. Ako nema greške, pozove `setNeedsOnboarding(false)`.
5. Ako bilo koji Supabase save baci grešku, catch samo logira:
   `completeOnboarding: Supabase save failed, using local state only`.
6. Nakon catcha se svejedno izvrši lokalni `setUser(...)` i `setNeedsOnboarding(false)`.

Zaključak: DB fail se prikazuje kao lažni uspjeh. Ovo je M1 i treba ga sanirati prije launch gatea.

## Payments / shop istina

- `lib/payments/index.ts` još uvijek re-exporta `stripe.ts`.
- `lib/payments/config.ts` ima `PAYMENTS_ENABLED = false` i copy `Plaćanje uskoro`.
- `lib/shop.ts` još sadrži `FALLBACK_PRODUCTS` i `FALLBACK_REVIEWS` i funkcije vraćaju fake katalog.

Zaključak: E.3 treba ukloniti fallback shop podatke i prestati izlagati Stripe helper re-export dok su plaćanja ugašena.

## Nav orphan audit

Pokrenuto: `bash scripts/audit-features.sh`

Rezultat:

- `tsc errors: 0`
- `nav orphans: 0`

Zaključak: ranije spomenuti `dashboard/breeder/messages.tsx → /dashboard/breeder/chat` orphan više nije reproduciran. Dokumentirano i ne izmišljam fix.

## Granice

KIT-E navodi preduvjet KIT-C. Ova E.0 dijagnostika je read-only i sigurna. Implementacije E.1–E.5 treba raditi pažljivo po sliceovima; migracije i remote schema promjene nisu rađene.
