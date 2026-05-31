// Walk Tracker Database Functions
// Supabase integracija za šetnje

import { supabase } from './supabase';
import type { Walk, WalkWithDetails } from './walk-types';

// Dohvati walk po ID-u
export async function getWalkById(id: string): Promise<Walk | null> {
  try {
    const { data, error } = await supabase
      .from('walks')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as Walk;
  } catch {
    return null;
  }
}

// Dohvati walk-ove za korisnika (sitter ili owner)
export async function getWalksForUser(userId: string): Promise<WalkWithDetails[]> {
  try {
    // Dohvati kao sitter
    const { data: sitterWalks, error: sitterError } = await supabase
      .from('walks')
      .select(`
        *,
        pets:pet_id (name, species),
        sitter:sitter_id (name)
      `)
      .eq('sitter_id', userId)
      .order('start_time', { ascending: false });

    // Dohvati ID-eve ljubimaca koje user posjeduje
    const { data: pets } = await supabase
      .from('pets')
      .select('id')
      .eq('owner_id', userId);

    const petIds = (pets || []).map((p) => p.id);
    
    let ownerWalks: WalkWithDetails[] = [];
    if (petIds.length > 0) {
      const { data, error } = await supabase
        .from('walks')
        .select(`
          *,
          pets:pet_id (name, species),
          sitter:sitter_id (name)
        `)
        .in('pet_id', petIds)
        .order('start_time', { ascending: false });
      
      if (!error && data) {
        ownerWalks = data.map((w: any) => ({
          ...w,
          petName: w.pets?.name,
          petSpecies: w.pets?.species,
          sitterName: w.sitter?.name,
        })) as WalkWithDetails[];
      }
    }

    // Spoji i ukloni duplikate
    const sitterWalksFormatted = (sitterWalks || [])
      .filter((w: any) => !sitterError)
      .map((w: any) => ({
        ...w,
        petName: w.pets?.name,
        petSpecies: w.pets?.species,
        sitterName: w.sitter?.name,
      })) as WalkWithDetails[];

    const allWalks = [...sitterWalksFormatted, ...ownerWalks];
    
    // Ukloni duplikate
    const seen = new Set<string>();
    return allWalks.filter((w) => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
  } catch {
    return [];
  }
}

// Dohvati aktivne walk-ove za sittera
export async function getActiveWalksForSitter(sitterId: string): Promise<WalkWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('walks')
      .select(`
        *,
        pets:pet_id (name, species),
        sitter:sitter_id (name)
      `)
      .eq('sitter_id', sitterId)
      .eq('status', 'u_tijeku')
      .order('start_time', { ascending: false });

    if (error || !data) return [];
    
    return data.map((w: any) => ({
      ...w,
      petName: w.pets?.name,
      petSpecies: w.pets?.species,
      sitterName: w.sitter?.name,
    })) as WalkWithDetails[];
  } catch {
    return [];
  }
}

// Dohvati walk history za booking
export async function getWalksByBooking(bookingId: string): Promise<WalkWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('walks')
      .select(`
        *,
        pets:pet_id (name, species),
        sitter:sitter_id (name)
      `)
      .eq('booking_id', bookingId)
      .order('start_time', { ascending: false });

    if (error || !data) return [];
    
    return data.map((w: any) => ({
      ...w,
      petName: w.pets?.name,
      petSpecies: w.pets?.species,
      sitterName: w.sitter?.name,
    })) as WalkWithDetails[];
  } catch {
    return [];
  }
}

// Kreiraj novi walk (kada sitter započne šetnju)
export async function createWalk(walk: Omit<Walk, 'id' | 'created_at'>): Promise<Walk | null> {
  try {
    const { data, error } = await supabase
      .from('walks')
      .insert(walk)
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating walk:', error);
      return null;
    }
    return data as Walk;
  } catch (err) {
    console.error('Exception creating walk:', err);
    return null;
  }
}

// Ažuriraj walk (real-time tracking)
export async function updateWalk(
  walkId: string,
  updates: Partial<Walk>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('walks')
      .update(updates)
      .eq('id', walkId);

    if (error) {
      console.error('Error updating walk:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception updating walk:', err);
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
        ...endData,
        status: 'zavrsena',
      })
      .eq('id', walkId);

    if (error) {
      console.error('Error ending walk:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception ending walk:', err);
    return false;
  }
}

// Dohvati booking-e dostupne za walk (prihvaćene, s današnjim datumom)
export async function getAvailableBookingsForWalk(sitterId: string): Promise<any[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        pet_id,
        start_date,
        end_date,
        pets:pet_id (id, name, species)
      `)
      .eq('sitter_id', sitterId)
      .eq('status', 'accepted')
      .lte('start_date', today)
      .gte('end_date', today);

    if (error || !data) return [];
    
    return data.map((b: any) => ({
      id: b.id,
      pet_id: b.pet_id,
      pet: b.pets,
      start_date: b.start_date,
      end_date: b.end_date,
    }));
  } catch {
    return [];
  }
}

// Subscribe na walk updates (realtime)
export function subscribeToWalk(
  walkId: string,
  callback: (walk: Walk) => void
) {
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
        callback(payload.new as Walk);
      }
    )
    .subscribe();

  return subscription;
}

// Unsubscribe od walk updates
export function unsubscribeFromWalk(subscription: any) {
  supabase.removeChannel(subscription);
}
