# PetPark mobile visual contract — 2026-05-20

Source of truth: live PetPark web mobile screenshots from 2026-05-19 and current brand identity — warm cream, forest green, orange CTA, teal/sage support colors, soft rounded cards, pet/community feeling.

## Homepage
- Header: PetPark logo top, compact account action, no clutter.
- Badge: “PetPark zajednica”.
- Headline: “Mjesto gdje zajednica pomaže ljubimcima.”
- Subtitle: “Usluge, upozorenja, savjeti i udomljavanje — sve za ljubimce na jednom mjestu.”
- Primary CTA: “Objavi upozorenje”.
- Secondary CTA: “Pogledaj usluge”.
- Visual anchor: warm community board/card; no generic stock sitter hero.
- Categories: Čuvanje, Šetnja, Grooming, Trening, Izgubljeni, Udomljavanje.
- Follow-up sections: “Aktualno u zajednici”, “Brzi pristup”, trust cards.

## Tabs / global shell
MVP primary tabs:
1. Početna
2. Usluge
3. Upiti
4. Obavijesti
5. Profil

Shop must not be primary unless explicitly approved. Forum can remain reachable from home/quick links.

## Request surfaces
- These are requests/upiti, not confirmed bookings.
- Cards should feel like PetPark web cards: warm surface, soft border, one clear primary action.
- Show status and what it means before dense metadata.
- Conversation area should be calm/collapsible or clearly separated.
- Auth-required states should look like product UI, not debug empty states.
- Long names, notes and messages must wrap safely.

## Reusable primitives direction
- `PetParkScreen`: warm background + bottom tab padding.
- `PetParkHeader`: compact logo/account action.
- `PetParkHeroCard`: warm hero, badge, headline, CTA stack.
- `PetParkActionGrid`: 2/3-column mobile cards with Ionicons, not crude oversized emoji tiles.
- `PetParkRequestCard`: status-first, one primary action.
- `PetParkStatusPill`: forest/orange/teal semantic pills.
- `PetParkTrustCard`: small sage/cream trust proof cards.
