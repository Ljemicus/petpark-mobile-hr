# KIT-E E.4 — Mobile → web Bearer contract (2026-07-02)

## Zaključak

Mobile booking-request API pozivi koriste centralni `petParkApi()` wrapper s `{ auth: true }`.

`petParkApi()`:

- čita Supabase session preko `supabase.auth.getSession()`
- ako nema tokena, baca `UNAUTHORIZED`
- ako token postoji, šalje header:
  - `Authorization: Bearer <supabase access token>`

## Pokriveni booking-request pozivi

Svi pozivi u `lib/api/booking-requests.ts` imaju `{ auth: true }`:

- `GET /api/booking-requests/owner`
- `GET /api/booking-requests/provider`
- `PATCH /api/booking-requests/:id/withdraw`
- `PATCH /api/booking-requests/:id/status`
- `GET /api/booking-requests/:id/messages`
- `POST /api/booking-requests/:id/messages`

## Guard skripta

Dodano:

- `scripts/check-booking-requests-bearer.mjs`

Skripta statički potvrđuje:

- `lib/api/client.ts` čita Supabase session
- `lib/api/client.ts` dodaje Bearer header
- svih 6 booking-request poziva ima `auth: true`

## Preview smoke status

Pravi integracijski smoke protiv PREVIEW okruženja nije pokrenut jer preview URL/test korisnik nisu eksplicitno zadani u ovom kitu. Ne zovem produkciju za ovaj test.

## Granice

- Nema produkcijskog API poziva.
- Nema promjene web API-ja.
- Nema CSRF promjene; PR-B1 ostaje human-gated.
