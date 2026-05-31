// Pet Passport types for mobile app

export type Species = 'dog' | 'cat' | 'other';

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

export interface Vaccination {
  name: string;
  date: string;
  vet: string;
  next_date: string;
}

export interface Allergy {
  name: string;
  severity: 'blaga' | 'umjerena' | 'ozbiljna';
  notes: string;
}

export interface Medication {
  name: string;
  dose: string;
  schedule: string;
  start_date: string;
  end_date: string | null;
}

export interface VetInfo {
  name: string;
  phone: string;
  address: string;
  emergency: boolean;
}

export interface PetPassport {
  pet_id: string;
  vaccinations: Vaccination[];
  allergies: Allergy[];
  medications: Medication[];
  vet_info: VetInfo;
  notes: string;
}

export interface PetWithPassport extends Pet {
  passport?: PetPassport;
}

export const SPECIES_LABELS: Record<Species, string> = {
  dog: 'Pas',
  cat: 'Mačka',
  other: 'Ostalo',
};

export const SPECIES_EMOJI: Record<Species, string> = {
  dog: '🐕',
  cat: '🐈',
  other: '🐰',
};

export const ALLERGY_SEVERITY_LABELS: Record<string, string> = {
  blaga: 'Blaga',
  umjerena: 'Umjerena',
  ozbiljna: 'Ozbiljna',
};

export interface Appointment {
  id: string;
  pet_id: string;
  type: 'vaccination' | 'checkup' | 'grooming' | 'other';
  title: string;
  date: string;
  time: string;
  vet_name: string | null;
  notes: string | null;
  status: 'upcoming' | 'completed' | 'cancelled';
  created_at: string;
}

export interface PetDocument {
  id: string;
  pet_id: string;
  name: string;
  type: 'certificate' | 'vaccination_record' | 'lab_result' | 'prescription' | 'other';
  url: string;
  uploaded_at: string;
}
