// Walk Tracker Database Functions
// Supabase integracija za šetnje

import { supabase } from './supabase';
import type { Walk, WalkWithDetails } from './walk-types';
import { captureAppError } from './sentry';
import type { Json } from './database.types';

export type WalkDbErrorKind = 'network' | 'auth' | 'unknown';

type WalkDbLastError = {
  kind: WalkDbErrorKind;
  message: string;
  source: string;
  at: string;
};

let walkDbLastError: WalkDbLastError | null = null;

function classifyWalkDbError(err: unknown): WalkDbErrorKind {
  const message = err instanceof Error ? err.message.toLowerCase() : String(err ?? '').toLowerCase();
  if (message.includes('jwt') || message.includes('auth') || message.includes('permission') || message.includes('rls')) return 'auth';
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) return 'network';
  return 'unknown';
}

function recordWalkDbError(source: string, err: unknown) {
  const message = err instanceof Error ? err.message : 'Nepoznata greška';
  walkDbLastError = {
    kind: classifyWalkDbError(err),
    message,
    source,
    at: new Date().toISOString(),
  };
  console.error(`[walk-db] ${source} failed:`, err);
  captureAppError(`walk-db.${source}`, err);
}

export function getWalkDbLastError() {
  return walkDbLastError;
}

export function clearWalkDbLastError() {
  walkDbLastError = null;
}

type RemoteWalk = {
  id: string;
  booking_id: string;
  provider_id: string;
  owner_profile_id: string;
  pet_id: string;
  started_at: string | null;
  ended_at: string | null;
  status: string;
  distance_km: number | null;
  route_geojson: Json | null;
  created_at: string;
  pets?: { name?: string | null; species?: string | null } | null;
  provider?: { display_name?: string | null } | null;
};

function routeFromJson(value: Json | null): { lat: number; lng: number }[] {
  return Array.isArray(value)
    ? value.filter((point): point is { lat: number; lng: number } =>
        typeof point === 'object' &&
        point !== null &&
        typeof (point as any).lat === 'number' &&
        typeof (point as any).lng === 'number'
      )
    : [];
}

function toWalk(row: RemoteWalk): WalkWithDetails {
  return {
    id: row.id,
    sitter_id: row.provider_id,
    pet_id: row.pet_id,
    booking_id: row.booking_id,
    start_time: row.started_at || row.created_at,
    end_time: row.ended_at,
    status: row.status === 'completed' || row.status === 'zavrsena' ? 'zavrsena' : 'u_tijeku',
    distance_km: row.distance_km ?? 0,
    route: routeFromJson(row.route_geojson),
    checkpoints: [],
    created_at: row.created_at,
    petName: row.pets?.name ?? undefined,
    petSpecies: row.pets?.species as WalkWithDetails['petSpecies'],
    sitterName: row.provider?.display_name ?? undefined,
  };
}

const WALK_SELECT = `
  id, booking_id, provider_id, owner_profile_id, pet_id, started_at, ended_at,
  status, distance_km, route_geojson, created_at,
  pets:pets!walks_pet_id_fkey(name, species),
  provider:providers!walks_provider_id_fkey(display_name)
`;

// Dohvati walk po ID-u
export async function getWalkById(id: string): Promise<Walk | null> {
  try {
    const { data, error } = await supabase
      .from('walks')
      .select(WALK_SELECT)
      .eq('id', id)
      .single();

    if (error || !data) throw error ?? new Error('Walk nije pronađen');
    return toWalk(data as any);
  } catch (err) {
    recordWalkDbError('getWalkById', err);
    return null;
  }
}

// Dohvati walk-ove za korisnika (provider ili owner profile)
export async function getWalksForUser(userId: string): Promise<WalkWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('walks')
      .select(WALK_SELECT)
      .or(`provider_id.eq.${userId},owner_profile_id.eq.${userId}`)
      .order('started_at', { ascending: false });

    if (error || !data) throw error ?? new Error('Walkovi nisu pronađeni');
    return (data as any[]).map(toWalk);
  } catch (err) {
    recordWalkDbError('getWalksForUser', err);
    return [];
  }
}

// Dohvati aktivne walk-ove za sittera/providera
export async function getActiveWalksForSitter(sitterId: string): Promise<WalkWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('walks')
      .select(WALK_SELECT)
      .eq('provider_id', sitterId)
      .eq('status', 'active')
      .order('started_at', { ascending: false });

    if (error || !data) throw error ?? new Error('Aktivne šetnje nisu pronađene');
    return (data as any[]).map(toWalk);
  } catch (err) {
    recordWalkDbError('getActiveWalksForSitter', err);
    return [];
  }
}

// Dohvati walk history za booking
export async function getWalksByBooking(bookingId: string): Promise<WalkWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('walks')
      .select(WALK_SELECT)
      .eq('booking_id', bookingId)
      .order('started_at', { ascending: false });

    if (error || !data) throw error ?? new Error('Šetnje za booking nisu pronađene');
    return (data as any[]).map(toWalk);
  } catch (err) {
    recordWalkDbError('getWalksByBooking', err);
    return [];
  }
}

// Kreiraj novi walk (kada sitter započne šetnju)
export async function createWalk(walk: Omit<Walk, 'id' | 'created_at'>): Promise<Walk | null> {
  try {
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('owner_profile_id, provider_id, pet_id')
      .eq('id', walk.booking_id)
      .single();

    if (bookingError || !booking) throw bookingError ?? new Error('Booking za šetnju nije pronađen');

    const { data, error } = await supabase
      .from('walks')
      .insert({
        booking_id: walk.booking_id,
        owner_profile_id: booking.owner_profile_id,
        provider_id: booking.provider_id || walk.sitter_id,
        pet_id: booking.pet_id || walk.pet_id,
        started_at: walk.start_time,
        ended_at: walk.end_time,
        status: walk.status === 'zavrsena' ? 'completed' : 'active',
        distance_km: walk.distance_km,
        route_geojson: walk.route as unknown as Json,
      })
      .select(WALK_SELECT)
      .single();

    if (error || !data) throw error ?? new Error('Šetnja nije kreirana');
    return toWalk(data as any);
  } catch (err) {
    recordWalkDbError('createWalk', err);
    return null;
  }
}

// Ažuriraj walk (real-time tracking)
export async function updateWalk(walkId: string, updates: Partial<Walk>): Promise<boolean> {
  try {
    const remoteUpdates = {
      started_at: updates.start_time,
      ended_at: updates.end_time,
      status: updates.status === 'zavrsena' ? 'completed' : updates.status === 'u_tijeku' ? 'active' : undefined,
      distance_km: updates.distance_km,
      route_geojson: updates.route as unknown as Json | undefined,
    };
    const cleanUpdates = Object.fromEntries(
      Object.entries(remoteUpdates).filter(([, value]) => value !== undefined)
    );

    const { error } = await supabase.from('walks').update(cleanUpdates).eq('id', walkId);
    if (error) throw error;
    return true;
  } catch (err) {
    recordWalkDbError('updateWalk', err);
    return false;
  }
}

// Završi walk
export async function endWalk(
  walkId: string,
  endData: {
    end_time: string;
    distance_km: number;
    route: { lat: number; lng: number }[];
    checkpoints: any[];
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('walks')
      .update({
        ended_at: endData.end_time,
        distance_km: endData.distance_km,
        route_geojson: endData.route as unknown as Json,
        status: 'completed',
      })
      .eq('id', walkId);

    if (error) throw error;
    return true;
  } catch (err) {
    recordWalkDbError('endWalk', err);
    return false;
  }
}

// Dohvati booking-e dostupne za walk (prihvaćene, s današnjim datumom)
export async function getAvailableBookingsForWalk(sitterId: string): Promise<any[]> {
  try {
    const today = new Date().toISOString();
    const { data, error } = await supabase
      .from('bookings')
      .select('id, pet_id, starts_at, ends_at, pets:pets!bookings_pet_id_fkey(id, name, species)')
      .eq('provider_id', sitterId)
      .eq('status', 'accepted')
      .lte('starts_at', today)
      .gte('ends_at', today);

    if (error || !data) throw error ?? new Error('Nema dostupnih bookinga za šetnju');
    return data.map((booking: any) => ({
      id: booking.id,
      pet_id: booking.pet_id,
      pet: booking.pets,
      start_date: booking.starts_at,
      end_date: booking.ends_at,
    }));
  } catch (err) {
    recordWalkDbError('getAvailableBookingsForWalk', err);
    return [];
  }
}

// Subscribe na walk updates (realtime)
export function subscribeToWalk(walkId: string, callback: (walk: Walk) => void) {
  const subscription = supabase
    .channel(`walk-${walkId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'walks',
        filter: `id=eq.${walkId}`,
      },
      (payload) => {
        callback(toWalk(payload.new as RemoteWalk));
      }
    )
    .subscribe();

  return subscription;
}

// Unsubscribe od walk updates
export function unsubscribeFromWalk(subscription: any) {
  supabase.removeChannel(subscription);
}
