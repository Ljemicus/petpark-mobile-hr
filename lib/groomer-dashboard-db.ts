// Database funkcije za Groomer Dashboard
// The remote mobile schema does not include the old groomer_* draft tables.
// Keep groomer dashboard functions safe and Uskoro-friendly.

import { supabase } from './supabase';
import type {
  GroomerProfile,
  GroomerBooking,
  GroomerAvailabilitySlot,
  GroomerReview,
  PortfolioImage,
  MonthlyEarnings,
} from './groomer-dashboard-types';
import { captureAppError } from './sentry';

export type GroomerDashboardDbErrorKind = 'network' | 'auth' | 'unknown';

type GroomerDashboardDbLastError = {
  kind: GroomerDashboardDbErrorKind;
  message: string;
  source: string;
  at: string;
};

let groomerDashboardDbLastError: GroomerDashboardDbLastError | null = null;

function classifyGroomerDashboardDbError(err: unknown): GroomerDashboardDbErrorKind {
  const message = err instanceof Error ? err.message.toLowerCase() : String(err ?? '').toLowerCase();
  if (message.includes('jwt') || message.includes('auth') || message.includes('permission') || message.includes('rls')) return 'auth';
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) return 'network';
  return 'unknown';
}

function recordGroomerDashboardDbError(source: string, err: unknown) {
  const message = err instanceof Error ? err.message : 'Nepoznata greška';
  groomerDashboardDbLastError = {
    kind: classifyGroomerDashboardDbError(err),
    message,
    source,
    at: new Date().toISOString(),
  };
  console.error(`[groomer-dashboard-db] ${source} failed:`, err);
  captureAppError(`groomer-dashboard-db.${source}`, err);
}

export function getGroomerDashboardDbLastError() {
  return groomerDashboardDbLastError;
}

export function clearGroomerDashboardDbLastError() {
  groomerDashboardDbLastError = null;
}

export async function getGroomerProfile(userId: string): Promise<GroomerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*, provider_groomer_settings(*)')
      .eq('profile_id', userId)
      .eq('provider_kind', 'groomer')
      .maybeSingle();

    if (error || !data) throw error ?? new Error('Groomer profil nije pronađen');
    const settings = Array.isArray((data as any).provider_groomer_settings)
      ? (data as any).provider_groomer_settings[0]
      : (data as any).provider_groomer_settings;

    return {
      id: data.id,
      user_id: data.profile_id,
      name: data.display_name,
      city: data.city || '',
      services: ['sisanje', 'kupanje', 'trimanje', 'nokti', 'cetkanje'],
      prices: { sisanje: 0, kupanje: 0, trimanje: 0, nokti: 0, cetkanje: 0 },
      rating: data.rating_avg,
      review_count: data.review_count,
      bio: data.bio,
      verified: data.verified_status === 'verified',
      specialization: settings?.specialization || 'oba',
      phone: data.phone,
      email: data.email,
      address: data.address,
      working_hours: (settings?.working_hours_json as GroomerProfile['working_hours']) || null,
    };
  } catch (err) {
    recordGroomerDashboardDbError('getGroomerProfile', err);
    return null;
  }
}

export async function updateGroomerProfile(
  groomerId: string,
  updates: Partial<GroomerProfile>
): Promise<GroomerProfile | null> {
  try {
    const { error } = await supabase
      .from('providers')
      .update({
        display_name: updates.name,
        city: updates.city,
        bio: updates.bio,
        phone: updates.phone,
        email: updates.email,
        address: updates.address,
      })
      .eq('id', groomerId);

    if (error) throw error;
    return null;
  } catch (err) {
    recordGroomerDashboardDbError('updateGroomerProfile', err);
    return null;
  }
}

export async function getGroomerBookings(_groomerId: string): Promise<GroomerBooking[]> {
  return [];
}

export async function updateGroomerBookingStatus(
  _bookingId: string,
  _status: 'confirmed' | 'rejected' | 'completed' | 'cancelled'
): Promise<boolean> {
  return false;
}

export async function getGroomerAvailability(_groomerId: string): Promise<GroomerAvailabilitySlot[]> {
  return [];
}

export async function addAvailabilitySlot(
  _slot: Omit<GroomerAvailabilitySlot, 'id'>
): Promise<GroomerAvailabilitySlot | null> {
  return null;
}

export async function deleteAvailabilitySlot(_slotId: string): Promise<boolean> {
  return false;
}

export async function generateDefaultSlots(
  _groomerId: string,
  _workDays: number[] = [1, 2, 3, 4, 5],
  _workStart: string = '09:00',
  _workEnd: string = '17:00',
  _slotDuration: number = 60,
  _days: number = 28
): Promise<number> {
  return 0;
}

export async function getGroomerReviews(groomerId: string): Promise<GroomerReview[]> {
  try {
    const { data: provider } = await supabase
      .from('providers')
      .select('profile_id')
      .eq('id', groomerId)
      .maybeSingle();

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, booking_id, reviewer_profile_id, reviewee_profile_id, rating, comment, created_at,
        reviewer:profiles!reviews_reviewer_profile_id_fkey(display_name, avatar_url)
      `)
      .eq('reviewee_profile_id', provider?.profile_id || groomerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      booking_id: row.booking_id,
      reviewer_id: row.reviewer_profile_id,
      reviewee_id: row.reviewee_profile_id,
      rating: row.rating,
      comment: row.comment,
      created_at: row.created_at,
      reviewer: row.reviewer
        ? { name: row.reviewer.display_name || 'Korisnik', avatar_url: row.reviewer.avatar_url }
        : undefined,
    }));
  } catch (err) {
    recordGroomerDashboardDbError('getGroomerReviews', err);
    return [];
  }
}

export async function getGroomerPortfolio(_groomerId: string): Promise<PortfolioImage[]> {
  return [];
}

export async function addPortfolioImage(
  _image: Omit<PortfolioImage, 'id' | 'created_at'>
): Promise<PortfolioImage | null> {
  return null;
}

export async function deletePortfolioImage(_imageId: string): Promise<boolean> {
  return false;
}

export async function getGroomerEarnings(_groomerId: string): Promise<{
  totalEarnings: number;
  thisMonthEarnings: number;
  monthlyEarnings: MonthlyEarnings[];
  completedBookings: GroomerBooking[];
}> {
  return { totalEarnings: 0, thisMonthEarnings: 0, monthlyEarnings: [], completedBookings: [] };
}

export async function getUnreadMessagesCount(_userId: string): Promise<number> {
  return 0;
}
