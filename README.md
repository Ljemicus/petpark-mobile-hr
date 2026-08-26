# PetPark Mobile

**Expo and React Native companion prototype for a Croatian pet-services marketplace.**

The application explores how PetPark's marketplace language translates to a native mobile surface: sitter discovery, pet services, community content, commerce browsing, account flows, and lost-pet visibility.

![Expo 55](https://img.shields.io/badge/Expo-55-171717?style=flat-square)
![React Native 0.83](https://img.shields.io/badge/React_Native-0.83-171717?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-E63323?style=flat-square)

## Current experience

- tab-based mobile navigation with Expo Router
- sitter search, city filtering, profiles, services, and reviews
- pet-shop catalogue and client-side cart
- training, grooming, forum, and topic surfaces
- lost-pet feed with native sharing
- login, registration, profile, privacy, and terms flows
- notification and message interface prototypes
- phone-first layout with tablet support enabled

## Scope boundary

This public repository is a **product and interaction prototype backed by local mock data**.

It does not currently provide:

- live authentication or remote user accounts
- production booking, messaging, or marketplace APIs
- payment processing or inventory persistence
- push-notification delivery
- App Store or Play Store release evidence

Those integrations belong behind explicit environment, security, backend, and release acceptance gates.

## Run locally

```bash
npm ci
npm run start
```

Then open the project in an iOS simulator, Android emulator, Expo Go-compatible environment, or the web target.

Useful scripts:

```bash
npm run ios
npm run android
npm run web
npx tsc --noEmit
```

## Structure

```text
app/(tabs)/     home, discovery, shop, forum, and profile
app/sitter/     sitter detail experience
app/product/    product detail experience
app/            messages, lost pets, training, grooming, and account flows
components/     shared mobile cards and controls
lib/            theme, mock domain data, auth prototype, and notifications
assets/         application icons and launch imagery
```

## Product relationship

The web marketplace remains the primary operational product. This repository is the mobile companion track and should not be read as proof that every production backend or release gate is already complete.
