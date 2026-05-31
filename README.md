# PetPark Mobile

PetPark mobilna aplikacija — platforma za sve potrebe ljubimaca (čuvanje, šišanje, dresura, uzgajivači).

## 🚀 Quick Start

```bash
# Instalacija
npm install

# Development server
npx expo start

# Web preview
npx expo start --web

# iOS simulator
npx expo start --ios

# Android emulator
npx expo start --android
```

## 📱 Features

### Dashboard-i
- **Owner Dashboard** — Upravljanje ljubimcima, rezervacije, poruke
- **Sitter Dashboard** — Upravljanje terminima, zarada, dostupnost
- **Groomer Dashboard** — Termini, portfolio, recenzije
- **Trainer Dashboard** — Programi treniranja, rezervacije, klijenti
- **Breeder Dashboard** — Legla, štenci, zahtjevi, dokumenti

### Core Features
- ✅ **Booking System** — Rezervacije usluga (5-step wizard)
- ✅ **Real-time Chat** — Instant poruke s notifikacijama
- ✅ **Walk Tracker** — GPS tracking šetnji s checkpointima
- ✅ **Pet Passport** — Zdravstveni podaci, cijepljenja, dokumenti
- ✅ **Payments** — Stripe integracija, wallet, payout

## 🛠 Tech Stack

- **Framework:** Expo SDK 55
- **UI:** React Native + NativeWind (Tailwind)
- **Navigation:** Expo Router
- **Backend:** Supabase (Auth, DB, Realtime)
- **Payments:** Stripe Checkout
- **Maps:** React Native Maps
- **Location:** Expo Location

## 📁 Project Structure

```
app/
├── (tabs)/           # Bottom tab navigation
├── booking/          # Booking flow (5 screens)
├── chat/             # Real-time chat (3 screens)
├── dashboard/        # All dashboards
│   ├── owner/
│   ├── sitter/
│   ├── groomer/
│   ├── trainer/
│   └── breeder/
├── payments/         # Payment system (7 screens)
├── pet-passport/     # Pet health records (3 screens)
├── walk/             # Walk tracker (3 screens)
└── ...

lib/
├── booking-*.ts      # Booking types & DB
├── chat/             # Chat types, DB, realtime
├── *-dashboard-*.ts  # Dashboard types & DB
├── payments/         # Payment types, DB, Stripe
├── walk-*.ts         # Walk tracker types & DB
└── ...
```

## 🔧 Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## 📦 Build

### EAS Build (Production)

```bash
# Login
npx eas login

# iOS build
npx eas build --platform ios

# Android build
npx eas build --platform android

# Both
npx eas build --platform all
```

### Local Build

```bash
# iOS (zahtijeva Xcode)
npx expo run:ios

# Android (zahtijeva Android Studio)
npx expo run:android
```

## 🧪 Testing

```bash
# TypeScript check
npx tsc --noEmit

# Lint
npx eslint .
```

## 📋 TODO

- [ ] Push notifikacije
- [ ] Apple Pay / Google Pay
- [ ] Deep linking
- [ ] Offline mode

## 📄 License

Privatni projekt — DentistRI d.o.o.
