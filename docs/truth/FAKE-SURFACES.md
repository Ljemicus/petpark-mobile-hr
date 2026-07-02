# FAKE SURFACES — KIT-0 (2026-07-02)

A finding here does not automatically mean a bug; it is input for KIT-D/KIT-E to replace production-facing fake data with honest empty states.

## Web

| Datoteka | Signal | Presuda | Preporuka |
|---|---|---|---|
| `app/(site)/ljubimac/[id]/karton/page.tsx` | `10` | Demo detail route/data | KIT-D/E: remove demo illusion or clearly gate as preview/test-only. |
| `app/(site)/ljubimac/[id]/karton/page.tsx` | `42` | Demo detail route/data | KIT-D/E: remove demo illusion or clearly gate as preview/test-only. |
| `app/(site)/setnja/[id]/page.tsx` | `10` | Demo detail route/data | KIT-D/E: remove demo illusion or clearly gate as preview/test-only. |
| `app/(site)/setnja/[id]/page.tsx` | `32` | Demo detail route/data | KIT-D/E: remove demo illusion or clearly gate as preview/test-only. |
| `app/(site)/admin/marketing/marketing-dashboard.tsx` | `77` | Admin mock dashboard | NOINDEX/admin only; replace with empty state or live backend before launch. |
| `app/(site)/admin/marketing/marketing-dashboard.tsx` | `124` | Admin mock dashboard | NOINDEX/admin only; replace with empty state or live backend before launch. |
| `app/(site)/admin/marketing/marketing-dashboard.tsx` | `134` | Admin mock dashboard | NOINDEX/admin only; replace with empty state or live backend before launch. |
| `app/(site)/admin/marketing/marketing-dashboard.tsx` | `135` | Admin mock dashboard | NOINDEX/admin only; replace with empty state or live backend before launch. |
| `app/(site)/dashboard/breeder/upiti/page.tsx` | `20` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `app/(site)/dashboard/breeder/upiti/page.tsx` | `92` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `app/(site)/dashboard/breeder/page.tsx` | `30` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `app/(site)/dashboard/breeder/page.tsx` | `39` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `app/(site)/dashboard/breeder/page.tsx` | `100` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `app/(site)/dashboard/breeder/page.tsx` | `106` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `app/(site)/dashboard/breeder/page.tsx` | `112` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `app/(site)/dashboard/breeder/page.tsx` | `117` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `app/(site)/dashboard/breeder/page.tsx` | `118` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `app/(site)/dashboard/breeder/page.tsx` | `168` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `app/(site)/dashboard/breeder/page.tsx` | `170` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `lib/demo-data.ts` | `1` | Demo detail route/data | KIT-D/E: remove demo illusion or clearly gate as preview/test-only. |
| `lib/demo-data.ts` | `9` | Demo detail route/data | KIT-D/E: remove demo illusion or clearly gate as preview/test-only. |
| `lib/mock-breeders.ts` | `44` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `lib/mock-breeders.ts` | `335` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `lib/mock-breeders.ts` | `344` | Production-risk mock breeder surface | KIT-D: gate/stub breeder surfaces until real schema/data exists. |
| `lib/public/provider-profile-sanitizers.ts` | `139` | Likely fallback/default, verify manually | Keep only if not pretending live inventory. |
| `lib/public/provider-profile-sanitizers.ts` | `209` | Likely fallback/default, verify manually | Keep only if not pretending live inventory. |
| `lib/public/provider-profile-sanitizers.ts` | `240` | Likely fallback/default, verify manually | Keep only if not pretending live inventory. |
| `lib/public/provider-profile-sanitizers.ts` | `294` | Likely fallback/default, verify manually | Keep only if not pretending live inventory. |
| `components/payments/PayoutCard.tsx` | `30` | Payment mock/default | KIT-B: ensure fail-closed and no payout illusion while payments disabled. |
| `components/payments/PayoutCard.tsx` | `54` | Payment mock/default | KIT-B: ensure fail-closed and no payout illusion while payments disabled. |

## Mobile

| Datoteka | Signal | Presuda | Preporuka |
|---|---|---|---|
| `lib/shop.ts` | `67` | Confirmed production-risk shop fallback | KIT-E: replace with Uskoro/empty state; no hardcoded products/reviews. |
| `lib/shop.ts` | `116` | Confirmed production-risk shop fallback | KIT-E: replace with Uskoro/empty state; no hardcoded products/reviews. |
| `lib/shop.ts` | `149` | Confirmed production-risk shop fallback | KIT-E: replace with Uskoro/empty state; no hardcoded products/reviews. |
| `lib/shop.ts` | `153` | Confirmed production-risk shop fallback | KIT-E: replace with Uskoro/empty state; no hardcoded products/reviews. |
| `lib/shop.ts` | `157` | Confirmed production-risk shop fallback | KIT-E: replace with Uskoro/empty state; no hardcoded products/reviews. |
