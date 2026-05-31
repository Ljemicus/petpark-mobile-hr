// Tipovi za Owner Dashboard

export type Species = 'dog' | 'cat' | 'other';
export type ServiceType = 'boarding' | 'walking' | 'house-sitting' | 'drop-in' | 'daycare';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: Species;
  breed: string | null;
  age: number | null;
  weight: number | null;
  special_needs: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface SitterInfo {
  id: string;
  name: string;
  avatar_url: string | null;
}

export interface PetInfo {
  id: string;
  name: string;
  species: Species;
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
  payment_status?: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  sitter?: SitterInfo;
  pet?: PetInfo;
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

export const SPECIES_LABELS: Record<Species, string> = {
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
