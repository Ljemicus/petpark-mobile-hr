// Tipovi za Breeder Dashboard

export type LitterStatus = 'available' | 'reserved' | 'upcoming' | 'sold';
export type PuppyStatus = 'available' | 'reserved' | 'sold';
export type ApplicationStatus = 'new' | 'replied' | 'archived';
export type BreederVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Litter {
  id: string;
  breeder_id: string;
  breed: string;
  species: 'dog' | 'cat';
  expected_date?: string;
  birth_date?: string;
  total_puppies: number;
  available_count: number;
  reserved_count: number;
  sold_count: number;
  price_from: number;
  price_to: number;
  status: LitterStatus;
  description?: string;
  fci_registered: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Puppy {
  id: string;
  litter_id: string;
  name?: string;
  gender: 'male' | 'female';
  color: string;
  status: PuppyStatus;
  price: number;
  microchip?: string;
  notes?: string;
  reserved_by?: string;
  reserved_at?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  breeder_id: string;
  from_name: string;
  from_email: string;
  from_phone?: string;
  breed_interest: string;
  message: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface BreederProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  city?: string;
  phone?: string;
  email: string;
  avatar_url?: string;
  breeds: string[];
  species: ('dog' | 'cat')[];
  years_experience: number;
  fci_registered: boolean;
  certified: boolean;
  verified: boolean;
  verification_status: BreederVerificationStatus;
  profile_completeness_pct: number;
  created_at: string;
  updated_at: string;
}

export interface BreederReview {
  id: string;
  breeder_id: string;
  reviewer_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface BreederDocument {
  id: string;
  breeder_id: string;
  type: 'contract' | 'certificate' | 'pedigree' | 'health_test' | 'other';
  title: string;
  file_url: string;
  uploaded_at: string;
}

export interface BreederStats {
  totalLitters: number;
  activeLitters: number;
  totalPuppies: number;
  availablePuppies: number;
  totalApplications: number;
  newApplications: number;
  totalViews: number;
  responseRate: number;
  avgResponseTime: string;
  totalEarnings: number;
  thisMonthEarnings: number;
}

export const LITTER_STATUS_LABELS: Record<LitterStatus, string> = {
  available: 'Dostupno',
  reserved: 'Rezervirano',
  upcoming: 'Nadolazi',
  sold: 'Prodano',
};

export const PUPPY_STATUS_LABELS: Record<PuppyStatus, string> = {
  available: 'Dostupan',
  reserved: 'Rezerviran',
  sold: 'Prodan',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: 'Novo',
  replied: 'Odgovoreno',
  archived: 'Arhivirano',
};

export const DOCUMENT_TYPE_LABELS: Record<BreederDocument['type'], string> = {
  contract: 'Ugovor',
  certificate: 'Certifikat',
  pedigree: 'Rodovnik',
  health_test: 'Zdravstveni test',
  other: 'Ostalo',
};

export const LITTER_STATUS_COLORS: Record<LitterStatus, { bg: string; text: string }> = {
  available: { bg: '#D1FAE5', text: '#065F46' },
  reserved: { bg: '#FEF3C7', text: '#92400E' },
  upcoming: { bg: '#DBEAFE', text: '#1E40AF' },
  sold: { bg: '#F3F4F6', text: '#4B5563' },
};

export const PUPPY_STATUS_COLORS: Record<PuppyStatus, { bg: string; text: string }> = {
  available: { bg: '#D1FAE5', text: '#065F46' },
  reserved: { bg: '#FEF3C7', text: '#92400E' },
  sold: { bg: '#DBEAFE', text: '#1E40AF' },
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string }> = {
  new: { bg: '#FEE2E2', text: '#991B1B' },
  replied: { bg: '#D1FAE5', text: '#065F46' },
  archived: { bg: '#F3F4F6', text: '#4B5563' },
};
