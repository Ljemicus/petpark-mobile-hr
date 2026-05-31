// Tipovi za Trainer Dashboard

export type TrainingType = 'osnovna' | 'napredna' | 'agility' | 'ponasanje' | 'stenci';
export type TrainerBookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

export interface TrainerProfile {
  id: string;
  user_id: string;
  name: string;
  city: string;
  specializations: TrainingType[];
  price_per_hour: number;
  certificates: string[];
  rating: number;
  review_count: number;
  bio: string | null;
  certified: boolean;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface TrainingProgram {
  id: string;
  trainer_id: string;
  name: string;
  type: TrainingType;
  duration_weeks: number;
  sessions: number;
  price: number;
  description: string;
  created_at?: string;
}

export interface TrainerAvailabilitySlot {
  id: string;
  trainer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface TrainerBooking {
  id: string;
  trainer_id: string;
  user_id: string;
  program_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: TrainerBookingStatus;
  pet_name: string | null;
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
  program?: TrainingProgram;
}

export interface TrainerReview {
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

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  'osnovna': 'Osnovna poslušnost',
  'napredna': 'Napredni trening',
  'agility': 'Agility',
  'ponasanje': 'Korekcija ponašanja',
  'stenci': 'Štenci',
};

export const TRAINER_BOOKING_STATUS_LABELS: Record<TrainerBookingStatus, string> = {
  'pending': 'Na čekanju',
  'confirmed': 'Potvrđeno',
  'rejected': 'Odbijeno',
  'completed': 'Završeno',
  'cancelled': 'Otkazano',
};

// Alias for convenience
export const STATUS_LABELS = TRAINER_BOOKING_STATUS_LABELS;

export const STATUS_COLORS: Record<TrainerBookingStatus, { bg: string; text: string; dot: string }> = {
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

export const DAY_LABELS = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'] as const;
