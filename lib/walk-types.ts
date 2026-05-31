// Walk Tracker Types
// Bazirano na web implementaciji

export type WalkStatus = 'u_tijeku' | 'zavrsena';

export interface WalkCheckpoint {
  time: string;
  label: string;
  emoji: string;
  lat: number;
  lng: number;
}

export interface WalkRoutePoint {
  lat: number;
  lng: number;
}

export interface Walk {
  id: string;
  sitter_id: string;
  pet_id: string;
  booking_id: string;
  start_time: string;
  end_time: string | null;
  status: WalkStatus;
  distance_km: number;
  route: WalkRoutePoint[];
  checkpoints: WalkCheckpoint[];
  created_at?: string;
}

// Extended walk s dodatnim podacima
export interface WalkWithDetails extends Walk {
  petName?: string;
  petSpecies?: 'dog' | 'cat' | 'other';
  sitterName?: string;
}

// Walk za dropdown selekciju (kada sitter bira koju šetnju započinje)
export interface WalkSelectorBooking {
  id: string;
  pet_id: string;
  pet?: {
    id: string;
    name: string;
    species: 'dog' | 'cat' | 'other';
  };
  start_date: string;
  end_date: string;
}

export const WALK_STATUS_LABELS: Record<WalkStatus, string> = {
  'u_tijeku': 'U tijeku',
  'zavrsena': 'Završena',
};

// Checkpoint opcije za sittera
export const CHECKPOINT_OPTIONS = [
  { emoji: '🌳', label: 'Park' },
  { emoji: '💧', label: 'Voda' },
  { emoji: '🏠', label: 'Kuća' },
  { emoji: '🏪', label: 'Dućan' },
  { emoji: '🎾', label: 'Igralište' },
  { emoji: '🚽', label: 'Toalet' },
  { emoji: '🦴', label: 'Poslastica' },
  { emoji: '🏥', label: 'Veterinar' },
  { emoji: '📸', label: 'Foto' },
  { emoji: '✅', label: 'Cilj' },
] as const;

// Formatiranje vremena (sekunde u MM:SS ili HH:MM:SS)
export function formatWalkDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Izračun prosječne brzine
export function calculateAverageSpeed(distanceKm: number, durationSeconds: number): string {
  if (durationSeconds === 0) return '0.0';
  return ((distanceKm / durationSeconds) * 3600).toFixed(1);
}

// Haversine formula za udaljenost između dvije točke
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Formatiranje datuma za prikaz
export function formatWalkDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Formatiranje vremena
export function formatWalkTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
