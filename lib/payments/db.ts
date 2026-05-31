// Database functions for Payments

import { supabase } from '../supabase';
import type { Payment, PaymentMethod, Payout, WalletBalance, PaymentReceipt } from './types';

const PLATFORMA_FEE = 0.10; // 10% platform fee

// ─── Payments ─────────────────────────────────────────────────────

export async function getPaymentHistory(userId: string): Promise<Payment[]> {
  try {
    // Get payments for bookings where user is owner
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings!booking_id(
          service_type,
          start_date,
          end_date,
          sitter:users!sitter_id(name, avatar_url)
        )
      `)
      .eq('booking.owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Payment[];
  } catch (err) {
    console.error('getPaymentHistory error:', err);
    return [];
  }
}

export async function getPaymentByBookingId(bookingId: string): Promise<Payment | null> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error) throw error;
    return data as Payment;
  } catch (err) {
    console.error('getPaymentByBookingId error:', err);
    return null;
  }
}

export async function getPaymentReceipt(paymentId: string): Promise<PaymentReceipt | null> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        booking_id,
        amount,
        platform_fee,
        currency,
        created_at,
        booking:bookings!booking_id(
          service_type,
          sitter:users!sitter_id(name),
          owner:users!owner_id(name),
          pet:pets(name)
        )
      `)
      .eq('id', paymentId)
      .single();

    if (error || !data) throw error;

    // Handle Supabase nested query result structure
    const booking = Array.isArray(data.booking) ? data.booking[0] : data.booking;
    const sitter = Array.isArray(booking?.sitter) ? booking.sitter[0] : booking?.sitter;
    const owner = Array.isArray(booking?.owner) ? booking.owner[0] : booking?.owner;
    const pet = Array.isArray(booking?.pet) ? booking.pet[0] : booking?.pet;

    return {
      payment_id: data.id,
      booking_id: data.booking_id,
      service_type: booking?.service_type || '',
      amount: data.amount,
      platform_fee: data.platform_fee,
      total_paid: data.amount + data.platform_fee,
      currency: data.currency,
      paid_at: data.created_at,
      sitter_name: sitter?.name || '',
      owner_name: owner?.name || '',
      pet_name: pet?.name || '',
    };
  } catch (err) {
    console.error('getPaymentReceipt error:', err);
    return null;
  }
}

// ─── Payment Methods ──────────────────────────────────────────────

export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PaymentMethod[];
  } catch (err) {
    console.error('getPaymentMethods error:', err);
    return [];
  }
}

export async function savePaymentMethod(
  userId: string,
  paymentMethod: Omit<PaymentMethod, 'id' | 'created_at'>
): Promise<PaymentMethod | null> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: userId,
        ...paymentMethod,
      })
      .select()
      .single();

    if (error) throw error;
    return data as PaymentMethod;
  } catch (err) {
    console.error('savePaymentMethod error:', err);
    return null;
  }
}

export async function deletePaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deletePaymentMethod error:', err);
    return false;
  }
}

export async function setDefaultPaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<boolean> {
  try {
    // First, remove default from all methods
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the new default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('setDefaultPaymentMethod error:', err);
    return false;
  }
}

// ─── Wallet & Payouts (for sitters/groomers) ──────────────────────

export async function getWalletBalance(userId: string): Promise<WalletBalance> {
  try {
    // Get completed bookings earnings (paid status)
    const { data: earnings, error: earningsError } = await supabase
      .from('bookings')
      .select('total_price, platform_fee')
      .eq('sitter_id', userId)
      .eq('status', 'completed')
      .eq('payment_status', 'paid');

    if (earningsError) throw earningsError;

    // Get pending payouts
    const { data: pendingPayouts, error: payoutsError } = await supabase
      .from('payouts')
      .select('amount')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing']);

    if (payoutsError) throw payoutsError;

    // Calculate totals
    const totalEarnings = (earnings || []).reduce((sum, b) => {
      const fee = b.platform_fee || b.total_price * PLATFORMA_FEE;
      return sum + (b.total_price - fee);
    }, 0);

    const pendingAmount = (pendingPayouts || []).reduce((sum, p) => sum + p.amount, 0);

    return {
      available: Math.max(0, totalEarnings - pendingAmount),
      pending: pendingAmount,
      currency: 'EUR',
    };
  } catch (err) {
    console.error('getWalletBalance error:', err);
    return { available: 0, pending: 0, currency: 'EUR' };
  }
}

export async function getPayoutHistory(userId: string): Promise<Payout[]> {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Payout[];
  } catch (err) {
    console.error('getPayoutHistory error:', err);
    return [];
  }
}

export async function requestPayout(
  userId: string,
  amount: number
): Promise<Payout | null> {
  try {
    // Check available balance first
    const balance = await getWalletBalance(userId);
    if (balance.available < amount) {
      throw new Error('Nedovoljno sredstava za isplatu');
    }

    const { data, error } = await supabase
      .from('payouts')
      .insert({
        user_id: userId,
        amount,
        currency: 'EUR',
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Payout;
  } catch (err) {
    console.error('requestPayout error:', err);
    return null;
  }
}

// ─── Stripe Connect (for providers) ───────────────────────────────

export async function getStripeConnectStatus(userId: string): Promise<{
  accountId: string | null;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
} | null> {
  try {
    const { data, error } = await supabase
      .from('sitter_profiles')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      accountId: data?.stripe_account_id || null,
      onboardingComplete: data?.stripe_onboarding_complete || false,
      chargesEnabled: data?.stripe_onboarding_complete || false,
      payoutsEnabled: data?.stripe_onboarding_complete || false,
    };
  } catch (err) {
    console.error('getStripeConnectStatus error:', err);
    return null;
  }
}

// ─── Utility ──────────────────────────────────────────────────────

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
