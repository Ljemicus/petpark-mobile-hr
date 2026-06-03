# PetPark Mobile — remote-schema alignment kit

The mobile app was partly wired to a LOCAL DRAFT schema before it was discovered the **remote
Supabase already has a richer 32-table schema**. This kit converts the app's data access to
that existing remote schema, keeps the safe fixes, and reduces new migrations to only the
genuinely-missing modules (forum, shop, breeder/rescue) as an APPROVAL-GATED plan.

Predaj cijeli folder openclawu. Redoslijed:

1. **`ALIGN_TO_REMOTE.md`** — glavni plan (Phases 0→6). Openclaw radi sam, ali NE smije
   migrirati remote bazu bez tvog odobrenja.
2. **`scripts/introspect-remote.sh`** — pokreće se PRVO (Phase 0), READ-ONLY. Dumpa STVARNE
   kolone / FK / enume / RLS remote sheme da se queryji pišu prema pravim poljima, ne prema
   nagađanju. Treba read-only `DATABASE_URL` (ili linkani supabase CLI). Ništa ne piše u bazu;
   izlaz ide u gitignoran `remote-schema/`.

## Zašto introspekcija prvo
Handoff zna IMENA remote tablica, ali ne i njihove KOLONE. Bez stvarne sheme svaki rewrite
queryja je nagađanje imena polja. Skripta izvuče istinu; ako nema konekcije, plan kaže
agentu da STANE i traži read-only `DATABASE_URL`, a ne da nagađa.

## Tvrde granice (detalji u ALIGN_TO_REMOTE.md)
- NE migrirati/pushati remote Supabase bez eksplicitnog odobrenja (ni `00006`).
- Payments OFF (`PAYMENTS_ENABLED=false`, "Plaćanje uskoro"); bez Stripea.
- Sačuvati Booking-Request MVP i njegove tablice.
- Ne dirati web repo; ne bacati commit `e4421e3`; ne commitati `.env`/ključeve ni DB dump.
- Zadržati `PetParkLogo`; ne vraćati Šapicu; hrvatski UI.
- Promjena sheme = prvo minimalan ADDITIVE plan, pa čekati odobrenje.

## Definicija gotovog
Nijedan query više ne gađa draft tablice (`users`/`sitter_profiles`/`groomers`/`availability`
ili direktni sender/receiver messages). `database.types.ts` regeneriran iz remotea, klijent
tipiziran, tsc=0. Remote-backed featurei (chat, pets/passport, walks, notifications, booking
requests, provider/sitter/trainer listings, profil) rade protiv pravih tablica. Featurei bez
remote tablica (forum/shop/breeder-rescue) pokazuju pošten "Uskoro", screens i navigacija
ostaju. `00006` izmješten u `supabase/drafts/`, additive plan spreman ali NEpoduzet.
