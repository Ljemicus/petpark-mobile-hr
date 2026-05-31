// Tipovi za Booking sistem

export type ServiceType = 'boarding' | 'walking' | 'house-sitting' | 'drop-in' | 'daycare';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
export type Species = 'dog' | 'cat' | 'other';

export interface SitterInfo {
  id: string;
  name: string;
  avatar_url: string | null;
  city: string;
  bio?: string;
  price_per_hour?: number;
  services?: ServiceType[];
  rating?: number;
  review_count?: number;
}

export interface PetInfo {
  id: string;
  name: string;
  species: Species;
  breed: string | null;
  photo_url: string | null;
}

export interface Booking {
  id: string;
  owner_id: string;
  sitter_id: string;
  pet_id: string;
  service_type: ServiceType;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  total_price: number;
  platform_fee?: number;
  note: string | null;
  payment_status: PaymentStatus;
  created_at: string;
  sitter?: SitterInfo;
  pet?: PetInfo;
}

export interface CreateBookingInput {
  sitter_id: string;
  pet_id: string;
  service_type: ServiceType;
  start_date: string;
  end_date: string;
  note?: string;
}

export interface Availability {
  id: string;
  sitter_id: string;
  date: string;
  available: boolean;
}

export interface BookingStep {
  step: number;
  title: string;
  description: string;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  boarding: 'Smještaj u domu čuvara',
  walking: 'Šetnja',
  'house-sitting': 'Čuvanje u kući vlasnika',
  'drop-in': 'Kratki posjet',
  daycare: 'Dnevni boravak',
};

export const SERVICE_EMOJI: Record<ServiceType, string> = {
  boarding: '🏠',
  walking: '🦮',
  'house-sitting': '🏡',
  'drop-in': '👋',
  daycare: '☀️',
};

export const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
  boarding: 'Vaš ljubimac boravi u domu čuvara',
  walking: 'Šetnja ljubimca u Vašem kvartu',
  'house-sitting': 'Čuvar dolazi u Vaš dom i brine se o ljubimcu',
  'drop-in': 'Kratki posjet za hranjenje ili igru',
  daycare: 'Dnevni boravak bez noćenja',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Na čekanju',
  accepted: 'Prihvaćeno',
  rejected: 'Odbijeno',
  completed: 'Završeno',
  cancelled: 'Otkazano',
};

export const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string; dot: string; border: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', border: '#FCD34D' },
  accepted: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', border: '#6EE7B7' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', border: '#FCA5A5' },
  completed: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', border: '#93C5FD' },
  cancelled: { bg: '#F3F4F6', text: '#4B5563', dot: '#9CA3AF', border: '#D1D5DB' },
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Nije plaćeno',
  pending: 'Na čekanju',
  paid: 'Plaćeno',
  failed: 'Neuspjelo',
  refunded: 'Vraćeno',
};

export const SPECIES_LABELS: Record<Species, string> = {
  dog: 'Pas',
  cat: 'Mačka',
  other: 'Ostalo',
};

export const BOOKING_STEPS: BookingStep[] = [
  { step: 1, title: 'Odaberi uslugu', description: 'Izaberite vrstu usluge' },
  { step: 2, title: 'Odaberi datume', description: 'Odaberite datume boravka' },
  { step: 3, title: 'Odaberi ljubimca', description: 'Odaberite ljubimca' },
  { step: 4, title: 'Detalji', description: 'Dodatne napomene' },
  { step: 5, title: 'Potvrda', description: 'Pregledajte i potvrdite' },
];

// Cijene po satu za svaku uslugu (default ako sitter nema definirane cijene)
export const DEFAULT_SERVICE_PRICES: Record<ServiceType, number> = {
  boarding: 25,
  walking: 15,
  'house-sitting': 30,
  'drop-in': 12,
  daycare: 20,
};

// Platform fee (10%)
export const PLATFORM_FEE_PERCENTAGE = 0.10;

export function calculateBookingPrice(
  serviceType: ServiceType,
  startDate: string,
  endDate: string,
  pricePerDay?: number
): { total: number; platformFee: number; sitterPayout: number; days: number } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  const dailyRate = pricePerDay || DEFAULT_SERVICE_PRICES[serviceType];
  const total = dailyRate * days;
  const platformFee = total * PLATFORM_FEE_PERCENTAGE;
  const sitterPayout = total - platformFee;
  
  return { total, platformFee, sitterPayout, days };
}

export function formatPrice(price: number): string {
  return `${price.toFixed(2)} €`;
}

export function canCancelBooking(status: BookingStatus): boolean {
  return status === 'pending' || status === 'accepted';
}

export function canReviewBooking(status: BookingStatus): boolean {
  return status === 'completed';
}

export function canPayBooking(status: BookingStatus, paymentStatus: PaymentStatus): boolean {
  return status === 'accepted' && paymentStatus === 'unpaid';
}

export function isBookingActive(status: BookingStatus): boolean {
  return status === 'pending' || status === 'accepted';
}
