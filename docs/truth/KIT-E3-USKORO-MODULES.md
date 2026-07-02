# KIT-E E.3 — Mobile Uskoro moduli (2026-07-02)

## Promjene

- Dodan mobile shared `components/shared/DisabledModule.tsx` s copyjem:
  - naslov po modulu
  - "Radimo na tome. Hvala na strpljenju."
- Forum tab i topic detail prebačeni su na DisabledModule.
- Shop tab, product detail i basket prebačeni su na DisabledModule.
- Payment ekrani prebačeni su na DisabledModule:
  - checkout
  - history
  - methods
  - wallet
  - success
  - cancel
  - receipt
- `lib/shop.ts` više nema `FALLBACK_PRODUCTS` ni `FALLBACK_REVIEWS`.
  - `getProducts()` vraća `[]`
  - `getProductBySlug()` vraća `null`
  - `getProductReviews()` vraća `[]`
  - `getRelatedProducts()` vraća `[]`
- `lib/payments/index.ts` više ne re-exporta `stripe.ts`.
- `lib/payments/stripe.ts` ima fail-fast guard na `PAYMENTS_ENABLED`; direktni import ne pokreće API poziv dok su plaćanja ugašena.

## Nav orphan

E.0 audit je pokazao `nav orphans: 0`; breeder chat orphan iz prompta nije reproduciran, pa stub nije dodan.

## Granice

- Nema remote migracija.
- Nema Stripe aktivacije.
- Nema shop tablica.
- Lokalni cart context ostaje, ali korisnički shop UI više ne prikazuje lažni katalog.
