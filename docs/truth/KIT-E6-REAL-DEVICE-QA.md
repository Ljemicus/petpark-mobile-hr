# KIT-E E.6 — Real Device QA Runbook

Datum: 2026-07-03
Branch: `fix/kit-e-mobile-istina`

## Status

**Pripremljeno, nije izvršeno na fizičkom uređaju.**

Razlog: E.6 traži stvarni iOS/Android uređaj ili dogovoreni test build + test user. U ovom autonomous sliceu ne radimo deploy, ne šaljemo build, ne koristimo produkcijski smoke bez eksplicitnog odobrenja.

## Preduvjeti za stvarno izvršenje

- Preview/internal build koji Ljemicus odobri.
- Test user za owner/sitter/groomer/trainer flow.
- `EXPO_PUBLIC_SUPABASE_URL` i `EXPO_PUBLIC_SUPABASE_ANON_KEY` postavljeni u build env.
- Opcionalno: `EXPO_PUBLIC_SENTRY_DSN` ako želimo provjeriti Sentry capture.
- Za E.4 preview smoke: preview URL i test user; ne gađati produkciju bez odobrenja.

## Smoke checklist

### Install / boot

- [ ] App se instalira na iOS uređaj.
- [ ] App se instalira na Android uređaj.
- [ ] Prvi boot ne crasha.
- [ ] Ako `EXPO_PUBLIC_SENTRY_DSN` nije postavljen, app radi bez Sentry errora.
- [ ] Ako je DSN postavljen, testni captured error stiže u Sentry projekt.

### Auth / onboarding

- [ ] Login s test userom radi.
- [ ] Onboarding ne prikazuje uspjeh ako remote save padne.
- [ ] Nakon uspješnog onboarding savea user završava na pravom dashboardu.

### Honest disabled modules

- [ ] Shop prikazuje “Uskoro”, bez fake proizvoda.
- [ ] Forum/topic prikazuje “Uskoro”, bez fake tema.
- [ ] Payments screenovi prikazuju “Uskoro”/disabled, bez aktivnog Stripe flowa.

### Booking request auth

- [ ] Booking request API pozivi šalju `Authorization: Bearer <token>`.
- [ ] Neautorizirani/test expired session dobije jasan error, ne false success.

### Error surfacing

- [ ] Owner dashboard prikazuje error state kad DB poziv padne.
- [ ] Sitter dashboard prikazuje error state kad DB poziv padne.
- [ ] Groomer dashboard prikazuje error state kad DB poziv padne.
- [ ] Trainer dashboard prikazuje error state kad DB poziv padne.
- [ ] Booking flow/detail/confirmation prikazuju retry/error umjesto tihe praznine.
- [ ] Chat list/detail prikazuju retry/error umjesto tihe praznine.
- [ ] Walk list/detail/active prikazuju retry/error umjesto tihe praznine.

### Native permissions

- [ ] Location permission prompt za walk radi.
- [ ] Walk screen ne crasha ako korisnik odbije lokaciju.
- [ ] Image/document picker flows ne crashaju kad permission nije odobren.

## Local gates already passed before this doc

- `npx tsc --noEmit` — PASS
- `npx expo-doctor` — 19/19 PASS
- `bash scripts/audit-features.sh` — tsc errors 0, nav orphans 0
- `node scripts/check-booking-requests-bearer.mjs` — PASS (2026-07-03)

## npm audit note

Nakon dodavanja `@sentry/react-native`, `npm audit --omit=dev` prijavljuje 15 nalaza:

- low: 1
- moderate: 12
- high: 1
- critical: 1

Nije pokrenut `npm audit fix` jer dio suggested fixa predlaže semver-major downgrade `expo` na `46.0.21`, što bi razbilo Expo SDK 55 projekt. Ovo treba zaseban dependency/security sprint, ne tiho auto-fixanje u KIT-E E.6.

## Blocker

E.6 real-device QA ostaje **blocked** dok Ljemicus ne odobri/pošalje:

1. uređaj ili internal build workflow,
2. test usere,
3. preview/prod target koji smijemo gađati,
4. odluku želi li Sentry DSN biti aktivan u tom buildu.
