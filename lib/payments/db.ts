// Database functions for Payments
// Payments remain disabled for the mobile MVP. These functions intentionally
// return safe empty/off states instead of querying absent draft payment tables.

import type { Payment, PaymentMethod, Payout, WalletBalance, PaymentReceipt } from './types';

const PLATFORMA_FEE = 0.10; // 10% platform fee

export async function getPaymentHistory(_userId: string): Promise<Payment[]> {
  return [];
}

export async function getPaymentByBookingId(_bookingId: string): Promise<Payment | null> {
  return null;
}

export async function getPaymentReceipt(_paymentId: string): Promise<PaymentReceipt | null> {
  return null;
}

export async function getPaymentMethods(_userId: string): Promise<PaymentMethod[]> {
  return [];
}

export async function savePaymentMethod(
  _userId: string,
  _paymentMethod: Omit<PaymentMethod, 'id' | 'created_at'>
): Promise<PaymentMethod | null> {
  return null;
}

export async function deletePaymentMethod(
  _userId: string,
  _paymentMethodId: string
): Promise<boolean> {
  return false;
}

export async function setDefaultPaymentMethod(
  _userId: string,
  _paymentMethodId: string
): Promise<boolean> {
  return false;
}

export async function getWalletBalance(_userId: string): Promise<WalletBalance> {
  return { available: 0, pending: 0, currency: 'EUR' };
}

export async function getPayoutHistory(_userId: string): Promise<Payout[]> {
  return [];
}

export async function requestPayout(_userId: string, _amount: number): Promise<Payout | null> {
  return null;
}

export async function getStripeConnectStatus(_userId: string): Promise<{
  accountId: string | null;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
} | null> {
  return {
    accountId: null,
    onboardingComplete: false,
    chargesEnabled: false,
    payoutsEnabled: false,
  };
}

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORMA_FEE * 100) / 100;
}

export function calculateSitterPayout(amount: number): number {
  const fee = calculatePlatformFee(amount);
  return Math.round((amount - fee) * 100) / 100;
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency,
  }).format(amount);
}
