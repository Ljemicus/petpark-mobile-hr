# Mobile KIT-E diagnostics — 2026-07-03

## completeOnboarding references
27:  completeOnboarding: (data: {
31:    onboarding?: OnboardingData;
45:  completeOnboarding: async () => ({ success: false, error: 'Onboarding nije spreman.' }),
78:        setNeedsOnboarding(!meta.onboarding_completed);
92:      setNeedsOnboarding(!!s && !meta.onboarding_completed);
122:  const completeOnboarding = async (data: {
126:    onboarding?: OnboardingData;
128:    const onboarding = data.onboarding ?? {};
129:    const avatar = onboarding.avatarUrl ?? (data.role === 'sitter' ? '🤝' : '🐾');
143:          onboarding,
144:          onboarding_completed: true,
146:          avatar_url: onboarding.avatarUrl ?? null,
147:          verification_status: onboarding.verificationStatus ?? 'none',
159:          avatar_url: onboarding.avatarUrl ?? null,
160:          onboarding_state: 'completed',
172:            bio: onboarding.experience ?? '',
174:            verified_status: onboarding.verificationStatus ?? 'none',
192:      console.warn('completeOnboarding: Supabase save failed:', message);
213:    <AuthContext.Provider value={{ user, session, login, register, completeOnboarding, skipOnboarding, logout, isLoggedIn: !!user, loading, needsOnboarding }}>

## payments exports/config
export * from './types';
export * from './db';
// TODO(petpark): Stripe mobile helpers are disabled until payments are activated in a separate kit.

--- config ---
// Payments are intentionally out of scope for this mobile completion pass.
// Keep payment screens compiling, but never start Stripe checkout while disabled.
export const PAYMENTS_ENABLED = false;

export const PAYMENT_DISABLED_TITLE = 'Plaćanje uskoro';
export const PAYMENT_DISABLED_MESSAGE =
  'Online plaćanje će biti dostupno uskoro. Upit i dogovor s pružateljem usluge rade normalno.';

--- stripe head ---
// Stripe integration for mobile payments
// Uses backend API endpoints (same as web) for security

import Constants from 'expo-constants';
import { PAYMENTS_ENABLED, PAYMENT_DISABLED_MESSAGE } from './config';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'https://petpark.hr';

function assertPaymentsEnabled() {
  // TODO(petpark): aktivira se posebnim kitom.
  if (!PAYMENTS_ENABLED) {
    throw new Error(PAYMENT_DISABLED_MESSAGE);
  }
}

function arePaymentsEnabled() {
  // TODO(petpark): aktivira se posebnim kitom.
  return PAYMENTS_ENABLED;
}

export interface CreateCheckoutResult {
  url: string;
  sessionId: string;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

// ─── Checkout Session ─────────────────────────────────────────────

export async function createCheckoutSession(
  bookingId: string,
  authToken: string
): Promise<CreateCheckoutResult | null> {
  assertPaymentsEnabled();
  try {
    const response = await fetch(`${API_URL}/api/payments/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ bookingId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Greška pri kreiranju plaćanja');
    }

    return await response.json();
  } catch (err) {
    console.error('createCheckoutSession error:', err);
    throw err;
  }
}

// ─── Payment Intent (for in-app payments) ─────────────────────────

export async function createPaymentIntent(
  bookingId: string,
  authToken: string
): Promise<PaymentIntentResult | null> {
  assertPaymentsEnabled();
  try {
    const response = await fetch(`${API_URL}/api/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ bookingId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Greška pri pripremi plaćanja');
    }

    return await response.json();
  } catch (err) {
    console.error('createPaymentIntent error:', err);
    throw err;
  }
}

// ─── Stripe Connect (for providers) ───────────────────────────────

export async function createConnectAccount(
  authToken: string
): Promise<{ accountId: string; onboardingUrl: string } | null> {
  assertPaymentsEnabled();
  try {
    const response = await fetch(`${API_URL}/api/payments/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Greška pri povezivanju računa');
    }

    return await response.json();
  } catch (err) {
    console.error('createConnectAccount error:', err);
    throw err;
  }
}

export async function getAccountStatus(
  authToken: string
): Promise<{
  accountId: string | null;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
} | null> {
  if (!arePaymentsEnabled()) return null;
  try {
    const response = await fetch(`${API_URL}/api/payments/account-status`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch account status');
    return await response.json();
  } catch (err) {
    console.error('getAccountStatus error:', err);
    return null;
  }
}

export async function createDashboardLink(authToken: string): Promise<string | null> {
  if (!arePaymentsEnabled()) return null;
  try {
    const response = await fetch(`${API_URL}/api/payments/dashboard-link`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to create dashboard link');
    const data = await response.json();
    return data.url;
  } catch (err) {
    console.error('createDashboardLink error:', err);
    return null;
  }
}

// ─── Refunds ──────────────────────────────────────────────────────

export async function requestRefund(
  paymentId: string,
  reason: string,
  authToken: string
): Promise<{ success: boolean; refundId?: string }> {
  assertPaymentsEnabled();
  try {
    const response = await fetch(`${API_URL}/api/payments/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ paymentId, reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Greška pri zahtjevu za povrat');
    }

    return await response.json();
  } catch (err) {
    console.error('requestRefund error:', err);
    throw err;
  }
}

// ─── Webhook Handling ─────────────────────────────────────────────

export function handlePaymentSuccess(sessionId: string): void {
  // Called when user returns from Stripe checkout
  // Payment status will be updated via webhook
  console.log('Payment success handled for session:', sessionId);
}

export function handlePaymentCancel(): void {
  // Called when user cancels Stripe checkout
  console.log('Payment cancelled by user');
}

## shop fallback scan
components/petpark/PetParkDesign.tsx:116:  const fallback = status === 'contacted' ? 'Kontaktiran' : status === 'closed' ? 'Zatvoreno' : status === 'withdrawn' ? 'Povučen' : 'Poslano';
components/petpark/PetParkDesign.tsx:117:  return <PetParkBadge label={label || fallback} tone={tone} />;
app/onboarding.tsx:290:          : 'Profil je spreman. Idemo te ubaciti da izgledaš kao netko kome bi ljudi stvarno povjerili psa.'
app/walk/[id].tsx:93:        // Ovaj fallback je za slučaj da getWalkById ne vrati podatke
app/walk/[id].tsx:95:        console.log('Walk not found by ID, trying fallback...');

## booking request web API bearer scan
app/booking-requests/[id].tsx:11:} from '../../lib/api/booking-requests';
app/booking-requests/[id].tsx:12:import { BookingRequestDetail, BookingRequestScreenShell } from '../../components/booking-requests/BookingRequestMobile';
components/booking-requests/BookingRequestMobile.tsx:15:} from '../../lib/api/booking-requests';
components/booking-requests/BookingRequestMobile.tsx:76:          onPress={() => router.push({ pathname: '/booking-requests/[id]', params: { id: request.id, role } } as any)}
app/_layout.tsx:40:                <Stack.Screen name="booking-requests/[id]" options={{ title: 'Detalji upita' }} />
app/notifications.tsx:13:import { BookingRequestScreenShell } from '../components/booking-requests/BookingRequestMobile';
app/notifications.tsx:52:    if (id) router.push({ pathname: '/booking-requests/[id]', params: { id, role } } as any);
lib/shop.ts:125:      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
app/dashboard/sitter/requests.tsx:6:import { getProviderBookingRequests, type ProviderBookingRequestSummary } from '../../../lib/api/booking-requests';
app/dashboard/sitter/requests.tsx:7:import { BookingRequestList, BookingRequestScreenShell } from '../../../components/booking-requests/BookingRequestMobile';
lib/payments/stripe.ts:43:        'Authorization': `Bearer ${authToken}`,
lib/payments/stripe.ts:72:        'Authorization': `Bearer ${authToken}`,
lib/payments/stripe.ts:100:        'Authorization': `Bearer ${authToken}`,
lib/payments/stripe.ts:128:        'Authorization': `Bearer ${authToken}`,
lib/payments/stripe.ts:145:        'Authorization': `Bearer ${authToken}`,
lib/payments/stripe.ts:171:        'Authorization': `Bearer ${authToken}`,
lib/auth-context.tsx:73:    supabase.auth.getSession().then(({ data: { session: s } }) => {
app/dashboard/owner/requests.tsx:6:import { getOwnerBookingRequests, type OwnerBookingRequestSummary } from '../../../lib/api/booking-requests';
app/dashboard/owner/requests.tsx:7:import { BookingRequestList, BookingRequestScreenShell } from '../../../components/booking-requests/BookingRequestMobile';
lib/api/index.ts:2:export * from './booking-requests';
lib/api/client.ts:34:  const { data, error } = await supabase.auth.getSession();
lib/api/client.ts:36:  return data.session?.access_token || null;
lib/api/client.ts:62:      ...(token ? { authorization: `Bearer ${token}` } : null),
lib/api/booking-requests.ts:118:  const response = await petParkApi<OwnerBookingRequestsResponse>('/api/booking-requests/owner', { auth: true });
lib/api/booking-requests.ts:123:  const response = await petParkApi<ProviderBookingRequestsResponse>('/api/booking-requests/provider', { auth: true });
lib/api/booking-requests.ts:128:  return petParkApi<BookingRequestStatusResponse>(`/api/booking-requests/${encodeURIComponent(id)}/withdraw`, {
lib/api/booking-requests.ts:135:  return petParkApi<BookingRequestStatusResponse>(`/api/booking-requests/${encodeURIComponent(id)}/status`, {
lib/api/booking-requests.ts:143:  return petParkApi<BookingRequestMessagesResponse>(`/api/booking-requests/${encodeURIComponent(id)}/messages`, {
lib/api/booking-requests.ts:149:  return petParkApi<BookingRequestMessagesResponse>(`/api/booking-requests/${encodeURIComponent(id)}/messages`, {

## Fixes applied in this KIT-E refresh

- Added `app/dashboard/breeder/chat.tsx` as a `DisabledModule` stub so the breeder chat target exists.
- `completeOnboarding()` now captures Supabase save failures through `captureAppError('auth.completeOnboarding', ...)` and returns a stable Croatian retry message without marking onboarding complete locally.
