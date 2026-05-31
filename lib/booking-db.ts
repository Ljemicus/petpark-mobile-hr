// Database funkcije za Booking sistem

import { supabase } from './supabase';
import type {
  Booking,
  CreateBookingInput,
  SitterInfo,
  ServiceType,
  Availability,
} from './booking-types';
import { PLATFORM_FEE_PERCENTAGE } from './booking-types';

// ─── Bookings ─────────────────────────────────────────────────────

export async function createBooking(
  ownerId: string,
  input: CreateBookingInput,
  pricePerDay: number
): Promise<Booking | null> {
  try {
    const start = new Date(input.start_date);
    const end = new Date(input.end_date);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    const totalPrice = pricePerDay * days;
    const platformFee = totalPrice * PLATFORM_FEE_PERCENTAGE;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        owner_id: ownerId,
        sitter_id: input.sitter_id,
        pet_id: input.pet_id,
        service_type: input.service_type,
        start_date: input.start_date,
        end_date: input.end_date,
        total_price: totalPrice,
        platform_fee: platformFee,
        payment_status: 'unpaid',
        note: input.note || null,
        status: 'pending',
      })
      .select(`
        id,
        owner_id,
        sitter_id,
        pet_id,
        service_type,
        start_date,
        end_date,
        status,
        total_price,
        platform_fee,
        note,
        payment_status,
        created_at,
        sitter:users!sitter_id(id, name, avatar_url),
        pet:pets(id, name, species)
      `)
      .single();

    if (error) throw error;
    if (!data) return null;

    return transformBookingData(data);
  } catch (err) {
    console.error('createBooking error:', err);
    return null;
  }
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        owner_id,
        sitter_id,
        pet_id,
        service_type,
        start_date,
        end_date,
        status,
        total_price,
        platform_fee,
        note,
        payment_status,
        created_at,
        sitter:users!sitter_id(id, name, avatar_url),
        pet:pets(id, name, species, breed, photo_url)
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return transformBookingData(data);
  } catch (err) {
    console.error('getBookingById error:', err);
    return null;
  }
}

export async function getBookingByIdWithSitterDetails(bookingId: string): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        owner_id,
        sitter_id,
        pet_id,
        service_type,
        start_date,
        end_date,
        status,
        total_price,
        platform_fee,
        note,
        payment_status,
        created_at,
        sitter:users!sitter_id(id, name, avatar_url, city),
        pet:pets(id, name, species, breed, photo_url)
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return transformBookingData(data);
  } catch (err) {
    console.error('getBookingByIdWithSitterDetails error:', err);
    return null;
  }
}

export async function cancelBooking(bookingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('cancelBooking error:', err);
    return false;
  }
}

// ─── Sitter Availability ──────────────────────────────────────────

export async function getSitterAvailability(
  sitterId: string,
  startDate: string,
  endDate: string
): Promise<Availability[]> {
  try {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('sitter_id', sitterId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getSitterAvailability error:', err);
    return [];
  }
}

export async function checkSitterAvailability(
  sitterId: string,
  startDate: string,
  endDate: string
): Promise<boolean> {
  try {
    // Generiraj sve datume u rasponu
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    // Provjeri postoje li zauzeti datumi
    const { data, error } = await supabase
      .from('availability')
      .select('date, available')
      .eq('sitter_id', sitterId)
      .in('date', dates)
      .eq('available', false);

    if (error) throw error;
    
    // Ako postoje zauzeti datumi, sitter nije dostupan
    if (data && data.length > 0) return false;
    
    // Provjeri postoje li prihvaćeni bookingi za te datume
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('start_date, end_date')
      .eq('sitter_id', sitterId)
      .eq('status', 'accepted')
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

    if (bookingsError) throw bookingsError;
    
    // Ako postoje preklapajući bookingi, sitter nije dostupan
    if (bookings && bookings.length > 0) return false;
    
    return true;
  } catch (err) {
    console.error('checkSitterAvailability error:', err);
    return false;
  }
}

// ─── Sitter Info & Pricing ────────────────────────────────────────

export async function getSitterForBooking(sitterId: string): Promise<SitterInfo | null> {
  try {
    const { data, error } = await supabase
      .from('sitter_profiles')
      .select(`
        id,
        bio,
        services,
        price_per_hour,
        rating,
        review_count,
        verified,
        avatar,
        users!inner (id, full_name, city)
      `)
      .eq('id', sitterId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: (data as any).users.id,
      name: (data as any).users.full_name,
      avatar_url: data.avatar,
      city: (data as any).users.city,
      bio: data.bio || '',
      price_per_hour: data.price_per_hour || 0,
      services: data.services || [],
      rating: data.rating || 0,
      review_count: data.review_count || 0,
    };
  } catch (err) {
    console.error('getSitterForBooking error:', err);
    return null;
  }
}

export async function getSitterPrices(sitterId: string): Promise<Record<ServiceType, number> | null> {
  try {
    const { data, error } = await supabase
      .from('sitter_profiles')
      .select('prices, price_per_hour')
      .eq('id', sitterId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Ako postoji prices objekt, koristi ga
    if (data.prices) {
      return data.prices as Record<ServiceType, number>;
    }
    
    // Inače fallback na price_per_hour za sve usluge
    const defaultPrice = data.price_per_hour || 25;
    return {
      boarding: defaultPrice,
      walking: Math.round(defaultPrice * 0.6),
      'house-sitting': Math.round(defaultPrice * 1.2),
      'drop-in': Math.round(defaultPrice * 0.5),
      daycare: Math.round(defaultPrice * 0.8),
    };
  } catch (err) {
    console.error('getSitterPrices error:', err);
    return null;
  }
}

// ─── Owner Pets ───────────────────────────────────────────────────

export async function getOwnerPets(ownerId: string) {
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getOwnerPets error:', err);
    return [];
  }
}

// ─── Helper funkcije ──────────────────────────────────────────────

function transformBookingData(data: any): Booking {
  return {
    id: data.id,
    owner_id: data.owner_id,
    sitter_id: data.sitter_id,
    pet_id: data.pet_id,
    service_type: data.service_type,
    start_date: data.start_date,
    end_date: data.end_date,
    status: data.status,
    total_price: data.total_price,
    platform_fee: data.platform_fee,
    note: data.note,
    payment_status: data.payment_status,
    created_at: data.created_at,
    sitter: data.sitter ? {
      id: data.sitter.id,
      name: data.sitter.name,
      avatar_url: data.sitter.avatar_url,
      city: data.sitter.city,
    } : undefined,
    pet: data.pet ? {
      id: data.pet.id,
      name: data.pet.name,
      species: data.pet.species,
      breed: data.pet.breed,
      photo_url: data.pet.photo_url,
    } : undefined,
  };
}
