# PetPark Mobile - Feature Parity Analiza

## Trenutno stanje Web Appa (Next.js)

### User Roles & Dashboards
1. **Vlasnik (Owner)** - `/dashboard/vlasnik`
   - Upravljanje ljubimcima (dodavanje, uređivanje, brisanje)
   - Pregled rezervacija
   - Recenzije (ostavljanje, pregled)
   - Aktivne šetnje (walk tracking)
   - Statistika (broj ljubimaca, aktivnih rezervacija, potrošnja)

2. **Sitter** - `/dashboard/sitter`
   - 6 tabova: Rezervacije, Kalendar, Analitika, Profil, Recenzije, Zarada
   - Upravljanje dostupnošću (kalendar)
   - Update-i za vlasnike (foto, video, text)
   - Onboarding wizard za nove sitttere
   - Analitika i zarada (grafikoni)

3. **Breeder** - `/dashboard/breeder`
   - Upravljanje leglima
   - Pregled upita
   - Onboarding

4. **Groomer** - `/dashboard/groomer`
   - Dashboard s rezervacijama
   - Upravljanje terminima
   
5. **Trainer** - `/dashboard/trainer`
   - Slično groomer dashboardu

6. **Rescue** - `/dashboard/rescue`
   - Upravljanje udomljavanjima
   - Apeali za donacije

### Ključne Funkcionalnosti Weba
- **Pretraga** (`/pretraga`) - Filteri: grad, usluga, cijena, rating, datum
- **Booking sistem** - Kreiranje, potvrda, otkazivanje, plaćanje
- **Poruke** (`/poruke`) - Chat između korisnika
- **Onboarding** - Wizardi za svaku ulogu
- **Pets** - Karton ljubimca, pasoš, cijepljenja
- **Forum** - Kategorije, teme, komentari
- **Shop** - Proizvodi, košarica, checkout
- **Izgubljeni ljubimci** - Oglasi, potrage
- **Udomljavanje** - Oglasi za udomljavanje

### UI Komponente (shadcn/ui)
- Avatar, Badge, Button, Calendar, Card, Dialog, Dropdown, Input, Label, Popover, Select, Tabs, Textarea, Toast

## Trenutno stanje Mobile Appa (Expo)

### Postojeće Stranice
- `/(tabs)/index` - Home (sitteri, grooming, dresura, shop preview)
- `/(tabs)/search` - Osnovna pretraga sitttera (samo grad filter)
- `/(tabs)/shop` - Shop kategorije i proizvodi
- `/(tabs)/forum` - Forum kategorije i teme
- `/(tabs)/profile` - Profil korisnika (osnovno)
- `/login`, `/register` - Auth
- `/onboarding` - Onboarding wizard (postoji ali je osnovni)
- `/messages` - Chat
- `/grooming` - Grooming listing
- `/training` - Dresura listing
- `/lost-pets` - Izgubljeni ljubimci
- `/cart` - Košarica
- `/sitter/[id]` - Detalji sitttera (osnovno)
- `/product/[id]` - Detalji proizvoda
- `/topic/[id]` - Detalji teme

### Postojeće Komponente
- `Badge`, `Button`, `CategoryCard`, `ForumTopicCard`, `OnboardingGate`, `ProductCard`, `SearchBar`, `SitterCard`

### Styling
- `Colors.ts` - Hardkodirane boje (primary: #F97316)
- StyleSheet za stilove (nema NativeWind ili slično)

## Što Nedostaje u Mobile Appu

### 1. Dashboards (Najvažnije)
- ❌ Sitter Dashboard - Potpuno nedostaje
- ❌ Owner Dashboard - Potpuno nedostaje
- ❌ Groomer Dashboard - Potpuno nedostaje
- ❌ Breeder Dashboard - Potpuno nedostaje
- ❌ Trainer Dashboard - Potpuno nedostaje
- ❌ Rescue Dashboard - Potpuno nedostaje

### 2. Booking Sistem
- ❌ Booking list (za vlasnika i providera)
- ❌ Booking detail screen
- ❌ Booking creation flow
- ❌ Booking status management

### 3. Pet Management
- ❌ Pet list screen
- ❌ Add/Edit Pet screen
- ❌ Pet passport
- ❌ Pet medical records

### 4. Pretraga i Filteri
- ⚠️ Osnovna pretraga postoji ali nedostaju:
  - Filter po uslugama
  - Filter po cijeni
  - Filter po datumu
  - Filter po ratingu
  - Map view

### 5. Onboarding Wizardi
- ⚠️ Postoji osnovni onboarding ali nedostaju:
  - Sitter-specific koraci
  - Groomer-specific koraci
  - Breeder-specific koraci
  - Trainer-specific koraci

### 6. Profil i Recenzije
- ⚠️ Osnovni profil postoji ali nedostaje:
  - Edit profila
  - Recenzije (pregled i ostavljanje)
  - Verification status detalji

### 7. Kalendar i Dostupnost
- ❌ Kalendar za upravljanje dostupnošću
- ❌ Availability picker

### 8. Analitika
- ❌ Statistika za providere
- ❌ Earnings reports

### 9. Chat/Updates
- ⚠️ Osnovne poruke postoje ali nedostaje:
  - Pet updates (foto/video od sitttera)

### 10. UI/UX Poboljšanja
- ⚠️ Boje su OK ali nedostaje:
  - Konsistentna tipografija
  - Animacije
  - Loading stateovi
  - Error handling

## Implementacijski Plan

### Faza 1: Dashboard Infrastructure
1. Kreirati `app/dashboard/` strukturu
2. Kreirati role-based routing
3. Kreirati shared dashboard komponente

### Faza 2: Owner Dashboard
1. Owner dashboard home
2. Pet management (list, add, edit)
3. Booking list za vlasnika
4. Reviews (ostavljanje i pregled)

### Faza 3: Sitter Dashboard
1. Sitter dashboard s tabovima
2. Booking management
3. Calendar/Availability
4. Profile edit
5. Earnings/Analytics

### Faza 4: Search & Booking
1. Advanced search s filterima
2. Booking creation flow
3. Booking detail screen
4. Payment integration (prep)

### Faza 5: Other Dashboards
1. Groomer dashboard
2. Breeder dashboard
3. Trainer dashboard

### Faza 6: UI/UX Polish
1. NativeWind integracija za bolji styling
2. Animacije
3. Loading states
4. Error handling
