# KIT-E E.5 — Sentry React Native Setup

Datum: 2026-07-02
Branch: `fix/kit-e-mobile-istina`

## Što je napravljeno

- Dodan Expo-compatible package: `@sentry/react-native`.
- Dodan Expo config plugin u `app.json`.
- Dodan centralni fail-closed init: `lib/sentry.ts`.
- Root layout se wrapa kroz `withSentry(RootLayout)`, ali samo kad je Sentry uključen.
- Postojeće module-level error recorder točke sada zovu `captureAppError(...)`:
  - booking DB
  - chat DB
  - owner dashboard DB
  - sitter dashboard DB
  - groomer dashboard DB
  - trainer dashboard DB
  - walk DB

## Fail-closed pravilo

Sentry se inicijalizira samo ako postoji:

```bash
EXPO_PUBLIC_SENTRY_DSN
```

Ako env nije postavljen:

- app se normalno pokreće
- `withSentry()` vraća originalnu komponentu
- `captureAppError()` je no-op
- ništa se ne šalje van

## Sampling

Performance/profiling sampling je namjerno ugašen dok vlasnik ne odobri produkcijske postavke:

```ts
tracesSampleRate: 0
profilesSampleRate: 0
```

## Što nije napravljeno

Nisu postavljeni produkcijski Sentry projekt/secrets ni sourcemap upload varijable. To traži owner odluku i stvarne vrijednosti:

- `EXPO_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN` za upload sourcemapova ako se koristi u CI/EAS
- Sentry org/project ako build pipeline to bude tražio

## Gate

Pokrenuti prije commita:

```bash
npx tsc --noEmit
npx expo-doctor
bash scripts/audit-features.sh
```
