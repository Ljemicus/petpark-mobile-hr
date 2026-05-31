# PetPark mobile patch triage — 2026-05-20

Status: previous visual polish is **not approved**. Screenshots from `petpark-wrong-mobile-polish-chatgpt-handoff-2026-05-19` are evidence only, not a target.

## Provenance freeze
- Mobile repo: `/Users/ljemicus/Projects/petpark-mobile`
- Branch/HEAD at start: `production` / `4387457 feat: add booking request mobile surfaces`
- State: dirty; wrong-polish changes are mixed into uncommitted dirty state, alongside older unrelated modifications/untracked files.
- Web source: `/Users/ljemicus/Projects/petpark`, `main` / `0deec8cc feat: add mobile booking request APIs`
- Production web/API status checked: `https://petpark.hr` returned HTTP 200 from Vercel on 2026-05-20.
- Native screenshot provenance from handoff: Android dev-client package `hr.petpark.app`, emulator `PetParkSmokeApi35`/`emulator-5554`, build command `npx expo run:android --device PetParkSmokeApi35`, screenshots under `/Users/ljemicus/.openclaw/workspace/artifacts/petpark-wrong-mobile-polish-chatgpt-handoff-2026-05-19/screenshots`.

## File decisions
| File | Decision | Notes |
| --- | --- | --- |
| `app/(tabs)/index.tsx` | replace | Wrong sitter-marketplace home copy/structure replaced with PetPark community home matching live web contract. |
| `app/(tabs)/_layout.tsx` | replace | Shop/Forum removed from primary tabs; MVP tabs now Početna/Usluge/Upiti/Obavijesti/Profil. |
| `app/(tabs)/requests.tsx` | keep/add | New safe navigation hub; no backend writes. |
| `app/(tabs)/notifications.tsx` | keep/add | Tab entry reuses existing notifications screen. |
| `app/_layout.tsx` | keep functional, needs later cleanup | Route warning fix kept for existing route leaves. Payment route declarations pre-existed in dirty scope; not changed in this pass. |
| `app/dashboard/owner/requests.tsx` | keep functional | Auth loading fix likely valuable; no visual rewrite yet. |
| `app/dashboard/sitter/requests.tsx` | keep functional | Auth loading fix likely valuable; no visual rewrite yet. |
| `app/booking-requests/[id].tsx` | keep functional | Auth-required detail fix likely valuable; no confirmed-booking conversion added. |
| `app/notifications.tsx` | keep functional | Auth loading fix likely valuable; tab wrapper added separately. |
| `components/SitterCard.tsx` | needs inspection | Existing warm-card polish may remain acceptable for service cards, but not relied on by new home. |
| payments/shop/cart related dirty files | ignored | Forbidden/needs owner approval; no destructive deletion/reset performed. |

## Screenshot audit summary
- Web identity: warm cream, forest text, orange CTA, teal/sage accents, dense community/service marketplace with soft rounded cards.
- Native wrong direction: oversized sitter-marketplace hero, persistent Shop as primary tab, emoji/category rhythm, too much generic sitter/shop framing.
- Exact copy mismatch: web target headline is “Mjesto gdje zajednica pomaže ljubimcima.”; rejected native headline was “Pronađi savršenog sittera za ljubimca”.
- Priority correction: home message first, Shop out of primary nav, Upiti/Obavijesti into app shell, service/community sections above provider-only marketplace blocks.

## Kept vs replaced
- Kept: unauthenticated loading fixes, bottom tab padding concept, existing request route functionality, existing auth/client hardening.
- Replaced: mobile homepage visual/copy direction; primary tab map.
- Ignored: payment/Stripe, production DB, uploads, messaging channels, destructive cleanup.
