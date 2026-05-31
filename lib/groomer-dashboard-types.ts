// Tipovi za Groomer Dashboard

export type GroomingServiceType = 'sisanje' | 'kupanje' | 'trimanje' | 'nokti' | 'cetkanje';
export type GroomerBookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
export type GroomerSpecialization = 'psi' | 'macke' | 'oba';

export interface GroomerProfile {
  id: string;
  user_id: string;
  name: string;
  city: string;
  services: GroomingServiceType[];
  prices: Record<GroomingServiceType, number>;
  rating: number;
  review_count: number;
  bio: string | null;
  verified: boolean;
  specialization: GroomerSpecialization;
  phone: string | null;
  email: string | null;
  address: string | null;
  working_hours: Record<string, { start: string; end: string }> | null;
  portfolio_images?: PortfolioImage[];
}

export interface PortfolioImage {
  id: string;
  groomer_id: string;
  url: string;
  caption: string | null;
  is_before_after: boolean;
  before_url: string | null;
  after_url: string | null;
  created_at: string;
}

export interface GroomerAvailabilitySlot {
  id: string;
  groomer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_available: boolean;
}

export interface GroomerBooking {
  id: string;
  groomer_id: string;
  user_id: string;
  service: GroomingServiceType;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: GroomerBookingStatus;
  pet_name: string | null;
  pet_type: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    avatar_url: string | null;
    email: string;
    phone: string | null;
  };
}

export interface GroomerReview {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: {
    name: string;
    avatar_url: string | null;
  };
}

export interface MonthlyEarnings {
  month: string;
  amount: number;
  bookingCount: number;
}

export const GROOMING_SERVICE_LABELS: Record<GroomingServiceType, string> = {
  'sisanje': 'Šišanje',
  'kupanje': 'Kupanje',
  'trimanje': 'Trimanje',
  'nokti': 'Nokti',
  'cetkanje': 'Četkanje',
};

export const GROOMER_BOOKING_STATUS_LABELS: Record<GroomerBookingStatus, string> = {
  'pending': 'Na čekanju',
  'confirmed': 'Potvrđeno',
  'rejected': 'Odbijeno',
  'completed': 'Završeno',
  'cancelled': 'Otkazano',
};

export const GROOMER_SPECIALIZATION_LABELS: Record<GroomerSpecialization, string> = {
  'psi': 'Psi',
  'macke': 'Mačke',
  'oba': 'Psi i mačke',
};

export const STATUS_COLORS: Record<GroomerBookingStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  confirmed: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  completed: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  cancelled: { bg: '#F3F4F6', text: '#4B5563', dot: '#9CA3AF' },
};

export const CITIES = [
  'Zagreb',
  'Split',
  'Rijeka',
  'Osijek',
  'Zadar',
  'Pula',
  'Šibenik',
  'Dubrovnik',
  'Varaždin',
  'Karlovac',
];
