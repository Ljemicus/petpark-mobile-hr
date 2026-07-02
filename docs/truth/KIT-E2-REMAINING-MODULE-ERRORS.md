# KIT-E E.2 — Remaining Mobile Error Surfacing

Datum: 2026-07-02
Branch: `fix/kit-e-mobile-istina`

## Scope

Ovaj slice zatvara preostale safe E.2 module nakon owner/sitter dashboarda:

- booking flow/detail/confirmation
- chat list/detail
- groomer dashboard screens
- trainer dashboard screens
- walk list/detail/active tracking

## Pravilo

Ne mijenjamo postojeće javne return signature DB helpera u ovom sliceu da ne razbijemo UI širinu. Umjesto toga svaki modul ima module-level last-error state:

- `getBookingDbLastError()` / `clearBookingDbLastError()`
- `getChatDbLastError()` / `clearChatDbLastError()`
- `getGroomerDashboardDbLastError()` / `clearGroomerDashboardDbLastError()`
- `getTrainerDashboardDbLastError()` / `clearTrainerDashboardDbLastError()`
- `getWalkDbLastError()` / `clearWalkDbLastError()`

Kad Supabase/helper poziv padne, helper i dalje vraća postojeći fallback (`[]`, `null`, `false`) radi kompatibilnosti, ali greška više nije tiha: bilježi se klasificirani module-level error i logira se s jasnim prefixom.

## UI ponašanje

Ekrani koji čitaju ove module sada prikazuju `InlineErrorState` s hrvatskom porukom i retry akcijom:

> Ne možemo učitati podatke. Povuci za osvježavanje.

Ovo sprječava lažni “prazan dashboard / nema poruka / nema šetnji” kad je stvarni uzrok DB/network/auth greška.

## Namjerno izvan scopea

- Nema remote DB migracija.
- Nema promjene RLS politika.
- Nema produkcijskog API smoke testa.
- Nema Sentry DSN konfiguracije u ovom sliceu; to ide u KIT-E E.5.

## Gate

Pokrenuti prije commita:

```bash
npx tsc --noEmit
npx expo-doctor
bash scripts/audit-features.sh
```
