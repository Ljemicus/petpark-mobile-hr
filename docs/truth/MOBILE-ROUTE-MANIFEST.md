# MOBILE ROUTE MANIFEST — KIT-0 (2026-07-02)

| Ruta | Datoteka | KLASIFIKACIJA | Napomena |
|---|---|---|---|
| `/forum` | `app/(tabs)/forum.tsx` | STUB | forum schema absent remotely |
| `/` | `app/(tabs)/index.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/notifications` | `app/(tabs)/notifications.tsx` | NOINDEX | authenticated mobile surface |
| `/pet-shops` | `app/(tabs)/pet-shops.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/profile` | `app/(tabs)/profile.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/requests` | `app/(tabs)/requests.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/search` | `app/(tabs)/search.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/shop` | `app/(tabs)/shop.tsx` | GATED | payments/shop disabled; keep fail-closed/uskoro |
| `/admin/verification` | `app/admin/verification.tsx` | NOINDEX | private/authenticated surface; should remain out of index |
| `/booking/[id]` | `app/booking/[id].tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/booking/[sitterId]` | `app/booking/[sitterId].tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/booking/confirmation` | `app/booking/confirmation.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/booking/my-bookings` | `app/booking/my-bookings.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/booking-requests/[id]` | `app/booking-requests/[id].tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/chat/[userId]` | `app/chat/[userId].tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/chat` | `app/chat/index.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/chat/new-chat` | `app/chat/new-chat.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/dashboard/breeder/applications` | `app/dashboard/breeder/applications.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/breeder/documents` | `app/dashboard/breeder/documents.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/breeder/earnings` | `app/dashboard/breeder/earnings.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/breeder` | `app/dashboard/breeder/index.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/breeder/litters` | `app/dashboard/breeder/litters.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/breeder/messages` | `app/dashboard/breeder/messages.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/breeder/puppies` | `app/dashboard/breeder/puppies.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/groomer/availability` | `app/dashboard/groomer/availability.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/groomer/bookings` | `app/dashboard/groomer/bookings.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/groomer/earnings` | `app/dashboard/groomer/earnings.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/groomer` | `app/dashboard/groomer/index.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/groomer/portfolio` | `app/dashboard/groomer/portfolio.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/groomer/profile` | `app/dashboard/groomer/profile.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/groomer/reviews` | `app/dashboard/groomer/reviews.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/owner/bookings` | `app/dashboard/owner/bookings.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/owner` | `app/dashboard/owner/index.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/owner/messages` | `app/dashboard/owner/messages.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/owner/pets` | `app/dashboard/owner/pets.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/owner/requests` | `app/dashboard/owner/requests.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/rescue/appeals` | `app/dashboard/rescue/appeals.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/rescue` | `app/dashboard/rescue/index.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/rescue/listings` | `app/dashboard/rescue/listings.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/rescue/messages` | `app/dashboard/rescue/messages.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/sitter/availability` | `app/dashboard/sitter/availability.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/sitter/bookings` | `app/dashboard/sitter/bookings.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/sitter/earnings` | `app/dashboard/sitter/earnings.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/sitter` | `app/dashboard/sitter/index.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/sitter/messages` | `app/dashboard/sitter/messages.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/sitter/requests` | `app/dashboard/sitter/requests.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/sitter/settings` | `app/dashboard/sitter/settings.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/trainer/availability` | `app/dashboard/trainer/availability.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/trainer/bookings` | `app/dashboard/trainer/bookings.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/trainer/earnings` | `app/dashboard/trainer/earnings.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/trainer` | `app/dashboard/trainer/index.tsx` | NOINDEX | authenticated mobile surface |
| `/dashboard/trainer/programs` | `app/dashboard/trainer/programs.tsx` | NOINDEX | authenticated mobile surface |
| `/grooming` | `app/grooming.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/login` | `app/login.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/lost-pets` | `app/lost-pets.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/messages` | `app/messages.tsx` | NOINDEX | authenticated mobile surface |
| `/notifications` | `app/notifications.tsx` | NOINDEX | authenticated mobile surface |
| `/onboarding` | `app/onboarding.tsx` | NOINDEX | authenticated mobile surface |
| `/payments/cancel` | `app/payments/cancel.tsx` | GATED | payments/shop disabled; keep fail-closed/uskoro |
| `/payments/checkout` | `app/payments/checkout.tsx` | GATED | payments/shop disabled; keep fail-closed/uskoro |
| `/payments/history` | `app/payments/history.tsx` | GATED | payments/shop disabled; keep fail-closed/uskoro |
| `/payments/methods` | `app/payments/methods.tsx` | GATED | payments/shop disabled; keep fail-closed/uskoro |
| `/payments/receipt/[id]` | `app/payments/receipt/[id].tsx` | GATED | payments/shop disabled; keep fail-closed/uskoro |
| `/payments/success` | `app/payments/success.tsx` | GATED | payments/shop disabled; keep fail-closed/uskoro |
| `/payments/wallet` | `app/payments/wallet.tsx` | GATED | payments/shop disabled; keep fail-closed/uskoro |
| `/pet-passport/[id]` | `app/pet-passport/[id].tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/pet-passport` | `app/pet-passport/index.tsx` | NOINDEX | private/authenticated surface; should remain out of index |
| `/privacy` | `app/privacy.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/register` | `app/register.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/shop/[slug]` | `app/shop/[slug].tsx` | GATED | payments/shop disabled; keep fail-closed/uskoro |
| `/shop/basket` | `app/shop/basket.tsx` | GATED | payments/shop disabled; keep fail-closed/uskoro |
| `/shop` | `app/shop/index.tsx` | GATED | payments/shop disabled; keep fail-closed/uskoro |
| `/sitter/[id]` | `app/sitter/[id].tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/terms` | `app/terms.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/topic/[id]` | `app/topic/[id].tsx` | STUB | forum schema absent remotely |
| `/training` | `app/training.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/walk/[id]` | `app/walk/[id].tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/walk/active` | `app/walk/active.tsx` | LAUNCH | public V1 surface if copy/data is honest |
| `/walk` | `app/walk/index.tsx` | LAUNCH | public V1 surface if copy/data is honest |
