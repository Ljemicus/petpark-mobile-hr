# KIT-E E.2 — Sitter dashboard errors (2026-07-02)

## Sanirano

Sitter dashboard DB modul:

- `lib/sitter-dashboard-db.ts`
  - dodan `recordSitterDashboardError()`
  - dodan `getSitterDashboardLastError()`
  - dodan `clearSitterDashboardLastError()`
  - realni catch blokovi sada pamte zadnju grešku u module-level stateu.

Sitter ekrani s hrvatskim error stateom i retryjem:

- `app/dashboard/sitter/index.tsx`
- `app/dashboard/sitter/bookings.tsx`
- `app/dashboard/sitter/availability.tsx`
- `app/dashboard/sitter/earnings.tsx`
- `app/dashboard/sitter/messages.tsx`

Shared UI:

- koristi postojeći `components/shared/InlineErrorState.tsx`

## Broj saniranih sitter catch mjesta

14 catch mjesta u `lib/sitter-dashboard-db.ts` prebačeno je na `recordSitterDashboardError()`.

## Napomena

`createPetUpdate()` ostaje hard-disabled jer remote schema još nema draft pet-update tablice; to nije silent catch nego svjesni schema gap.

## Granice

- Nema Sentry integracije u ovom commitu; E.5 će spojiti capture na isti `recordSitterDashboardError()` hook.
- Nema remote migracija.
- Nema promjene Supabase sheme.
