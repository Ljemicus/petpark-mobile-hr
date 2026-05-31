// Payment types for mobile app

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Payment {
  id: string;
  booking_id: string;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  amount: number;
  platform_fee: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  booking?: {
    service_type: string;
    start_date: string;
    end_date: string;
    sitter?: {
      name: string;
      avatar_url: string | null;
    };
    owner?: {
      name: string;
      avatar_url: string | null;
    };
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default: boolean;
  created_at: string;
}

export interface Payout {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  stripe_payout_id: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: 'pending' | 'complete' | 'expired';
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Nije plaćeno',
  pending: 'Na čekanju',
  paid: 'Plaćeno',
  failed: 'Neuspjelo',
  refunded: 'Vraćeno',
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: 'Na čekanju',
  processing: 'U obradi',
  completed: 'Završeno',
  failed: 'Neuspjelo',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  unpaid: '#6B7280',
  pending: '#F59E0B',
  paid: '#10B981',
  failed: '#EF4444',
  refunded: '#8B5CF6',
};

export const PAYOUT_STATUS_COLORS: Record<PayoutStatus, string> = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  completed: '#10B981',
  failed: '#EF4444',
};

export interface PaymentReceipt {
  payment_id: string;
  booking_id: string;
  service_type: string;
  amount: number;
  platform_fee: number;
  total_paid: number;
  currency: string;
  paid_at: string;
  sitter_name: string;
  owner_name: string;
  pet_name: string;
}
