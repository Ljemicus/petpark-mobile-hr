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
