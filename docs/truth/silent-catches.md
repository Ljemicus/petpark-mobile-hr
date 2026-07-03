# Silent catches — KIT-E E.0

Datum: 2026-07-03

## `lib/owner-dashboard-db.ts`

- line 146: potential silent fallback

```ts
      } catch (err) {
        recordOwnerDashboardError('getPetsByOwner', err);
        return [];
      }
    }
    
    export async function createPet(petData: Omit<Pet, 'id' | 'created_at'>): Promise<Pet | null> {
      try {
```

- line 168: potential silent fallback

```ts
      } catch (err) {
        recordOwnerDashboardError('createPet', err);
        return null;
      }
    }
    
    export async function updatePet(petId: string, updates: Partial<Pet>): Promise<Pet | null> {
      try {
```

- line 190: potential silent fallback

```ts
      } catch (err) {
        recordOwnerDashboardError('updatePet', err);
        return null;
      }
    }
    
    export async function deletePet(petId: string): Promise<boolean> {
      try {
```

- line 201: potential silent fallback

```ts
      } catch (err) {
        recordOwnerDashboardError('deletePet', err);
        return false;
      }
    }
    
    export async function getOwnerBookings(ownerId: string): Promise<Booking[]> {
      try {
```

- line 221: potential silent fallback

```ts
      } catch (err) {
        recordOwnerDashboardError('getOwnerBookings', err);
        return [];
      }
    }
    
    export async function cancelBooking(bookingId: string): Promise<boolean> {
      try {
```

- line 232: potential silent fallback

```ts
      } catch (err) {
        recordOwnerDashboardError('cancelBooking', err);
        return false;
      }
    }
    
    export async function getReviewedBookingIds(ownerId: string): Promise<string[]> {
      try {
```

- line 246: potential silent fallback

```ts
      } catch (err) {
        recordOwnerDashboardError('getReviewedBookingIds', err);
        return [];
      }
    }
    
    export async function createReview(reviewData: {
      booking_id: string;
```

- line 276: potential silent fallback

```ts
      } catch (err) {
        recordOwnerDashboardError('createReview', err);
        return false;
      }
    }
    
    export async function getConversationSummaries(userId: string): Promise<ConversationSummary[]> {
      try {
```

- line 327: potential silent fallback

```ts
      } catch (err) {
        recordOwnerDashboardError('getConversationSummaries', err);
        return [];
      }
    }
    
    export async function getMessagesForConversation(userId: string, partnerId: string): Promise<Message[]> {
      try {
```

- line 345: potential silent fallback

```ts
      } catch (err) {
        recordOwnerDashboardError('getMessagesForConversation', err);
        return [];
      }
    }
    
    export async function sendMessage(messageData: Omit<Message, 'id' | 'created_at'>): Promise<Message | null> {
      try {
```

- line 372: potential silent fallback

```ts
      } catch (err) {
        recordOwnerDashboardError('sendMessage', err);
        return null;
      }
    }
    
    export async function markMessagesAsRead(userId: string, partnerId: string): Promise<void> {
      try {
```

- line 387: catch block

```ts
      } catch (err) {
        recordOwnerDashboardError('markMessagesAsRead', err);
      }
    }
    
    export async function getUnreadMessagesCount(userId: string): Promise<number> {
      const summaries = await getConversationSummaries(userId);
      return summaries.reduce((sum, summary) => sum + summary.unreadCount, 0);
```

## `lib/sitter-dashboard-db.ts`

- line 194: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('getSitterProfile', err);
        return null;
      }
    }
    
    export async function updateSitterProfile(
      userId: string,
```

- line 220: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('updateSitterProfile', err);
        return null;
      }
    }
    
    // ─── Bookings ─────────────────────────────────────────────────────
    
```

- line 243: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('getSitterBookings', err);
        return [];
      }
    }
    
    export async function updateBookingStatus(
      bookingId: string,
```

- line 257: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('updateBookingStatus', err);
        return false;
      }
    }
    
    // ─── Availability ─────────────────────────────────────────────────
    
```

- line 281: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('getAvailability', err);
        return [];
      }
    }
    
    export async function toggleAvailability(
      sitterId: string,
```

- line 320: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('toggleAvailability', err);
        return false;
      }
    }
    
    export async function setBulkAvailability(
      sitterId: string,
```

- line 337: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('setBulkAvailability', err);
        return false;
      }
    }
    
    // ─── Reviews ──────────────────────────────────────────────────────
    
```

- line 378: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('getSitterReviews', err);
        return [];
      }
    }
    
    // ─── Pet Updates ──────────────────────────────────────────────────
    // Remote schema does not have draft pet update rows yet. Keep the MVP safe and quiet.
```

- line 456: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('getSitterEarnings', err);
        return { totalEarnings: 0, thisMonthEarnings: 0, monthlyEarnings: [], completedBookings: [] };
      }
    }
    
    // ─── Messages ─────────────────────────────────────────────────────
    
```

- line 528: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('getConversationSummaries', err);
        return [];
      }
    }
    
    export async function getMessagesForConversation(userId: string, partnerId: string): Promise<Message[]> {
      try {
```

- line 552: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('getMessagesForConversation', err);
        return [];
      }
    }
    
    export async function sendMessage(messageData: Omit<Message, 'id' | 'created_at'>): Promise<Message | null> {
      try {
```

- line 587: potential silent fallback

```ts
      } catch (err) {
        recordSitterDashboardError('sendMessage', err);
        return null;
      }
    }
    
    export async function markMessagesAsRead(userId: string, partnerId: string): Promise<void> {
      try {
```

- line 602: catch block

```ts
      } catch (err) {
        recordSitterDashboardError('markMessagesAsRead', err);
      }
    }
    
    export async function getUnreadMessagesCount(userId: string): Promise<number> {
      try {
        const summaries = await getConversationSummaries(userId);
```

- line 611: catch block

```ts
      } catch (err) {
        recordSitterDashboardError('getUnreadMessagesCount', err);
        return 0;
      }
    }
```

## `lib/groomer-dashboard-db.ts`

- line 85: potential silent fallback

```ts
      } catch (err) {
        recordGroomerDashboardDbError('getGroomerProfile', err);
        return null;
      }
    }
    
    export async function updateGroomerProfile(
      groomerId: string,
```

- line 110: potential silent fallback

```ts
      } catch (err) {
        recordGroomerDashboardDbError('updateGroomerProfile', err);
        return null;
      }
    }
    
    export async function getGroomerBookings(_groomerId: string): Promise<GroomerBooking[]> {
      return [];
```

- line 182: potential silent fallback

```ts
      } catch (err) {
        recordGroomerDashboardDbError('getGroomerReviews', err);
        return [];
      }
    }
    
    export async function getGroomerPortfolio(_groomerId: string): Promise<PortfolioImage[]> {
      return [];
```

## `lib/trainer-dashboard-db.ts`

- line 64: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('getTrainerProfile', err);
        return null;
      }
    }
    
    export async function updateTrainerProfile(
      trainerId: string,
```

- line 87: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('updateTrainerProfile', err);
        return null;
      }
    }
    
    // ─── Bookings ─────────────────────────────────────────────────────
    
```

- line 122: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('getTrainerBookings', err);
        return [];
      }
    }
    
    export async function updateTrainerBookingStatus(
      bookingId: string,
```

- line 140: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('updateTrainerBookingStatus', err);
        return false;
      }
    }
    
    // ─── Availability ─────────────────────────────────────────────────
    
```

- line 161: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('getTrainerAvailability', err);
        return [];
      }
    }
    
    export async function addTrainerAvailabilitySlot(
      slot: Omit<TrainerAvailabilitySlot, 'id'>
```

- line 179: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('addTrainerAvailabilitySlot', err);
        return null;
      }
    }
    
    export async function deleteTrainerAvailabilitySlot(slotId: string): Promise<boolean> {
      try {
```

- line 194: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('deleteTrainerAvailabilitySlot', err);
        return false;
      }
    }
    
    export async function deleteTrainerAvailabilityByDay(
      trainerId: string,
```

- line 213: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('deleteTrainerAvailabilityByDay', err);
        return false;
      }
    }
    
    export async function generateTrainerSlots(
      trainerId: string,
```

- line 273: catch block

```ts
      } catch (err) {
        recordTrainerDashboardDbError('generateTrainerSlots', err);
        return 0;
      }
    }
    
    // ─── Training Programs ────────────────────────────────────────────
    
```

- line 294: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('getTrainerPrograms', err);
        return [];
      }
    }
    
    export async function createTrainingProgram(
      program: Omit<TrainingProgram, 'id' | 'created_at'>
```

- line 312: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('createTrainingProgram', err);
        return null;
      }
    }
    
    export async function updateTrainingProgram(
      programId: string,
```

- line 332: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('updateTrainingProgram', err);
        return null;
      }
    }
    
    export async function deleteTrainingProgram(programId: string): Promise<boolean> {
      try {
```

- line 347: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('deleteTrainingProgram', err);
        return false;
      }
    }
    
    // ─── Reviews ──────────────────────────────────────────────────────
    
```

- line 383: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('getTrainerReviews', err);
        return [];
      }
    }
    
    // ─── Earnings ─────────────────────────────────────────────────────
    
```

- line 461: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('getTrainerEarnings', err);
        return {
          totalEarnings: 0,
          thisMonthEarnings: 0,
          monthlyEarnings: [],
          completedBookings: [],
        };
```

- line 505: catch block

```ts
      } catch (err) {
        recordTrainerDashboardDbError('getUnreadMessagesCount', err);
        return 0;
      }
    }
    
    // ─── Clients ──────────────────────────────────────────────────────
    
```

- line 571: potential silent fallback

```ts
      } catch (err) {
        recordTrainerDashboardDbError('getTrainerClients', err);
        return [];
      }
    }
```

## `lib/db.ts`

- line 93: potential silent fallback

```ts
      } catch {
        return [];
      }
    }
    
    export async function getSitterById(id: string): Promise<Sitter | null> {
      try {
        const { data, error } = await supabase
```

- line 121: potential silent fallback

```ts
      } catch {
        return null;
      }
    }
    
    // ─── Admin: Verification Queue ───────────────────────────────────────
    
    export interface PendingSitter {
```

- line 158: potential silent fallback

```ts
      } catch {
        return [];
      }
    }
    
    export async function setSitterVerification(
      sitterId: string,
      approved: boolean,
```

- line 178: potential silent fallback

```ts
      } catch {
        return false;
      }
    }
    
    function relativeTime(value?: string | null) {
      if (!value) return 'Upravo sada';
      const diffMs = Date.now() - new Date(value).getTime();
```

- line 254: potential silent fallback

```ts
      } catch {
        return [];
      }
    }
    
    // ─── Pet Passport ───────────────────────────────────────────────────
    
    export async function getOwnerPets(ownerId: string): Promise<Pet[]> {
```

- line 271: potential silent fallback

```ts
      } catch {
        return [];
      }
    }
    
    export async function getPetById(petId: string): Promise<Pet | null> {
      try {
        const { data, error } = await supabase
```

- line 286: potential silent fallback

```ts
      } catch {
        return null;
      }
    }
    
    export async function getPetPassport(petId: string): Promise<PetPassport | null> {
      try {
        const { data, error } = await supabase
```

- line 317: potential silent fallback

```ts
      } catch {
        return null;
      }
    }
    
    export async function getPetWithPassport(petId: string): Promise<PetWithPassport | null> {
      try {
        const [pet, passport] = await Promise.all([
```

- line 342: potential silent fallback

```ts
      } catch {
        return null;
      }
    }
    
    export async function savePetPassport(
      petId: string,
      passport: Partial<PetPassport>
```

- line 372: potential silent fallback

```ts
      } catch {
        return false;
      }
    }
    
    // Pet appointment/document tables are part of the additive draft plan; keep screens safely empty until approved.
    export async function getPetAppointments(_petId: string): Promise<Appointment[]> {
      return [];
```

## `lib/booking-db.ts`

- line 147: potential silent fallback

```ts
      } catch (err) {
        recordBookingDbError('createBooking', err);
        return null;
      }
    }
    
    export async function getBookingById(bookingId: string): Promise<Booking | null> {
      try {
```

- line 162: potential silent fallback

```ts
      } catch (err) {
        recordBookingDbError('getBookingById', err);
        return null;
      }
    }
    
    export async function getBookingByIdWithSitterDetails(bookingId: string): Promise<Booking | null> {
      return getBookingById(bookingId);
```

- line 177: potential silent fallback

```ts
      } catch (err) {
        recordBookingDbError('cancelBooking', err);
        return false;
      }
    }
    
    export async function getSitterAvailability(sitterId: string, startDate: string, endDate: string): Promise<Availability[]> {
      try {
```

- line 198: potential silent fallback

```ts
      } catch (err) {
        recordBookingDbError('getSitterAvailability', err);
        return [];
      }
    }
    
    export async function checkSitterAvailability(sitterId: string, startDate: string, endDate: string): Promise<boolean> {
      try {
```

- line 224: potential silent fallback

```ts
      } catch (err) {
        recordBookingDbError('checkSitterAvailability', err);
        return false;
      }
    }
    
    export async function getSitterForBooking(sitterId: string): Promise<SitterInfo | null> {
      try {
```

- line 251: potential silent fallback

```ts
      } catch (err) {
        recordBookingDbError('getSitterForBooking', err);
        return null;
      }
    }
    
    export async function getSitterPrices(sitterId: string): Promise<Record<ServiceType, number> | null> {
      try {
```

- line 260: potential silent fallback

```ts
      } catch (err) {
        recordBookingDbError('getSitterPrices', err);
        return null;
      }
    }
    
    export async function getOwnerPets(ownerId: string) {
      try {
```

- line 281: potential silent fallback

```ts
      } catch (err) {
        recordBookingDbError('getOwnerPets', err);
        return [];
      }
    }
```

## `lib/chat/db.ts`

- line 116: potential silent fallback

```ts
      } catch (error) {
        recordChatDbError('searchUsers', error);
        return [];
      }
    }
    
    export async function getUserById(userId: string): Promise<ChatUser | null> {
      try {
```

- line 137: potential silent fallback

```ts
      } catch (error) {
        recordChatDbError('getUserById', error);
        return null;
      }
    }
```

## `lib/walk-db.ts`

- line 111: potential silent fallback

```ts
      } catch (err) {
        recordWalkDbError('getWalkById', err);
        return null;
      }
    }
    
    // Dohvati walk-ove za korisnika (provider ili owner profile)
    export async function getWalksForUser(userId: string): Promise<WalkWithDetails[]> {
```

- line 128: potential silent fallback

```ts
      } catch (err) {
        recordWalkDbError('getWalksForUser', err);
        return [];
      }
    }
    
    // Dohvati aktivne walk-ove za sittera/providera
    export async function getActiveWalksForSitter(sitterId: string): Promise<WalkWithDetails[]> {
```

- line 146: potential silent fallback

```ts
      } catch (err) {
        recordWalkDbError('getActiveWalksForSitter', err);
        return [];
      }
    }
    
    // Dohvati walk history za booking
    export async function getWalksByBooking(bookingId: string): Promise<WalkWithDetails[]> {
```

- line 163: potential silent fallback

```ts
      } catch (err) {
        recordWalkDbError('getWalksByBooking', err);
        return [];
      }
    }
    
    // Kreiraj novi walk (kada sitter započne šetnju)
    export async function createWalk(walk: Omit<Walk, 'id' | 'created_at'>): Promise<Walk | null> {
```

- line 198: potential silent fallback

```ts
      } catch (err) {
        recordWalkDbError('createWalk', err);
        return null;
      }
    }
    
    // Ažuriraj walk (real-time tracking)
    export async function updateWalk(walkId: string, updates: Partial<Walk>): Promise<boolean> {
```

- line 221: potential silent fallback

```ts
      } catch (err) {
        recordWalkDbError('updateWalk', err);
        return false;
      }
    }
    
    // Završi walk
    export async function endWalk(
```

- line 250: potential silent fallback

```ts
      } catch (err) {
        recordWalkDbError('endWalk', err);
        return false;
      }
    }
    
    // Dohvati booking-e dostupne za walk (prihvaćene, s današnjim datumom)
    export async function getAvailableBookingsForWalk(sitterId: string): Promise<any[]> {
```

- line 276: potential silent fallback

```ts
      } catch (err) {
        recordWalkDbError('getAvailableBookingsForWalk', err);
        return [];
      }
    }
    
    // Subscribe na walk updates (realtime)
    export function subscribeToWalk(walkId: string, callback: (walk: Walk) => void) {
```
