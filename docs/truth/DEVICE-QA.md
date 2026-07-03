# DEVICE-QA — KIT-E E.6

Datum: 2026-07-03
Status: BLOCKED / nije izvršeno na fizičkom uređaju.

Razlog: nema odobrenog internal/preview builda, test usera i stvarnog iOS/Android uređaja u ovom autonomous sliceu. Ne deployamo i ne gađamo produkciju bez eksplicitnog odobrenja.

## Lokalni gates izvršeni

- `npx tsc --noEmit` — PASS
- `npx expo-doctor` — 19/19 PASS
- `bash scripts/audit-features.sh` — PASS: tsc errors 0, nav orphans 0, iOS export PASS
- `node scripts/check-booking-requests-bearer.mjs` — PASS

## Real-device matrica

| Flow | iOS | Android | Napomena |
| --- | --- | --- | --- |
| Registracija → email potvrda → onboarding | BLOCKED | BLOCKED | Treba test user/build; onboarding fail path lokalno hardeniran. |
| Pretraga → provider profil → booking request | BLOCKED | BLOCKED | Treba preview/internal build. |
| Provider request + poruke | BLOCKED | BLOCKED | Treba dva test profila. |
| Chat realtime u dva smjera | BLOCKED | BLOCKED | Treba dva uređaja/sessiona. |
| Upload slike profil/ljubimac | BLOCKED | BLOCKED | Treba real permission/device check. |
| Pet passport pregled | BLOCKED | BLOCKED | Treba test pet profil. |
| Walk tracker start/stop/spremanje | BLOCKED | BLOCKED | Dok nema real-device PASS na oba OS-a, walk ne dobiva launch PASS iz ovog kita. |
| Notifikacije | BLOCKED | BLOCKED | Ovisi o build env i push setupu. |

Detaljni runbook ostaje u `docs/truth/KIT-E6-REAL-DEVICE-QA.md`.
