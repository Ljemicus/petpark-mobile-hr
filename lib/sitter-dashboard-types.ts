// Tipovi za Sitter Dashboard

export type ServiceType = 'boarding' | 'walking' | 'house-sitting' | 'drop-in' | 'daycare';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface SitterProfile {
  user_id: string;
  bio: string | null;
  experience_years: number;
  services: ServiceType[];
  prices: Record<ServiceType, number>;
  verified: boolean;
  rating_avg: number;
  review_count: number;
  city: string | null;
  instant_booking: boolean;
  created_at: string;
}

export interface OwnerInfo {
  id: string;
  name: string;
  avatar_url: string | null;
  email: string;
}

export interface PetInfo {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string | null;
  special_needs: string | null;
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
  note: string | null;
  address: string | null;
  message: string | null;
  created_at: string;
  owner?: OwnerInfo;
  pet?: PetInfo;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: {
    name: string;
    avatar_url: string | null;
  };
}

export interface Availability {
  id: string;
  sitter_id: string;
  date: string;
  available: boolean;
  created_at: string;
}

export interface PetUpdate {
  id: string;
  booking_id: string;
  type: 'photo' | 'video' | 'text';
  emoji: string;
  caption: string;
  photo_url: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id: string | null;
  content: string | null;
  image_url: string | null;
  read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url: string | null;
    role: string;
  };
}

export interface ConversationSummary {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: Message | null;
  unreadCount: number;
}

export interface MonthlyEarnings {
  month: string;
  amount: number;
  bookingCount: number;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  boarding: 'Čuvanje u domu',
  walking: 'Šetnja',
  'house-sitting': 'Čuvanje u kući vlasnika',
  'drop-in': 'Kratki posjet',
  daycare: 'Dnevni boravak',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Na čekanju',
  accepted: 'Prihvaćeno',
  rejected: 'Odbijeno',
  completed: 'Završeno',
  cancelled: 'Otkazano',
};

export const SPECIES_LABELS: Record<string, string> = {
  dog: 'Pas',
  cat: 'Mačka',
  other: 'Ostalo',
};

export const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  accepted: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  completed: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  cancelled: { bg: '#F3F4F6', text: '#4B5563', dot: '#9CA3AF' },
};
