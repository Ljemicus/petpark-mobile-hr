# KIT-E E.2 — Owner dashboard errors (2026-07-02)

## Sanirano

Owner dashboard DB modul:

- `lib/owner-dashboard-db.ts`
  - dodan `recordOwnerDashboardError()`
  - dodan `getOwnerDashboardLastError()`
  - dodan `clearOwnerDashboardLastError()`
  - catch blokovi više nisu samo tihi `console.error + []/null/false`; greška se pamti u module-level stateu.

Owner ekrani s hrvatskim error stateom i retryjem:

- `app/dashboard/owner/index.tsx`
- `app/dashboard/owner/bookings.tsx`
- `app/dashboard/owner/pets.tsx`
- `app/dashboard/owner/messages.tsx`

Shared UI:

- `components/shared/InlineErrorState.tsx`

## Obrazac

Odabrani E.2 obrazac je zapisan u `docs/truth/error-pattern.md`:

- zadržati postojeće povratne tipove radi kompatibilnosti
- module-level last error state
- ekran prikazuje iskren error umjesto lažnog praznog stanja

## Broj saniranih owner catch mjesta

12 catch mjesta u `lib/owner-dashboard-db.ts` prebačeno je na `recordOwnerDashboardError()`.

## Granice

- Nema Sentry integracije u ovom commitu; E.5 će spojiti capture na isti `recordOwnerDashboardError()` hook.
- Nema remote migracija.
- Nema promjene Supabase sheme.
