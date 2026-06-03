// Database funkcije za Booking sistem — aligned to the remote Supabase schema.

import { supabase } from './supabase';
import type { Booking, CreateBookingInput, SitterInfo, ServiceType, Availability, Species, PaymentStatus } from './booking-types';
import { DEFAULT_SERVICE_PRICES, PLATFORM_FEE_PERCENTAGE } from './booking-types';

function asServiceType(value: string | null | undefined): ServiceType {
  const allowed: ServiceType[] = ['boarding', 'walking', 'house-sitting', 'drop-in', 'daycare'];
  return allowed.includes(value as ServiceType) ? (value as ServiceType) : 'boarding';
}

function asSpecies(value: string | null | undefined): Species {
  return value === 'cat' || value === 'other' ? value : 'dog';
}

function asPaymentStatus(value: string | null | undefined): PaymentStatus {
  const allowed: PaymentStatus[] = ['unpaid', 'pending', 'paid', 'failed', 'refunded'];
  return allowed.includes(value as PaymentStatus) ? (value as PaymentStatus) : 'unpaid';
}

function transformBookingData(data: any): Booking {
  const provider = data.provider || data.sitter;
  const pet = data.pet;
  return {
    id: data.id,
    owner_id: data.owner_profile_id,
    sitter_id: data.provider_id,
    pet_id: data.pet_id,
    service_type: asServiceType(data.primary_service_code),
    start_date: data.starts_at,
    end_date: data.ends_at,
    status: data.status,
    total_price: data.total_amount ?? 0,
    platform_fee: data.platform_fee_amount ?? data.platform_fee ?? 0,
    note: data.owner_note ?? null,
    payment_status: asPaymentStatus(data.payment_status),
    created_at: data.created_at,
    sitter: provider
      ? {
          id: provider.id,
          name: provider.display_name || provider.name || 'Pružatelj usluge',
          avatar_url: provider.avatar_url || null,
          city: provider.city || '',
          bio: provider.bio || '',
          price_per_hour: provider.base_price || undefined,
          services: undefined,
          rating: provider.rating_avg || 0,
          review_count: provider.review_count || 0,
        }
      : undefined,
    pet: pet
      ? {
          id: pet.id,
          name: pet.name,
          species: asSpecies(pet.species),
          breed: pet.breed ?? null,
          photo_url: null,
        }
      : undefined,
  };
}

async function getProviderBasePrices(providerId: string): Promise<Record<ServiceType, number>> {
  const { data } = await supabase
    .from('provider_services')
    .select('service_code, base_price')
    .eq('provider_id', providerId)
    .eq('is_active', true);

  const prices: Record<ServiceType, number> = { ...DEFAULT_SERVICE_PRICES };
  for (const row of data || []) {
    const service = asServiceType(row.service_code);
    prices[service] = row.base_price || prices[service];
  }
  return prices;
}

export async function createBooking(ownerId: string, input: CreateBookingInput, pricePerDay: number): Promise<Booking | null> {
  try {
    const start = new Date(input.start_date);
    const end = new Date(input.end_date);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = pricePerDay * days;
    const platformFee = totalPrice * PLATFORM_FEE_PERCENTAGE;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        owner_profile_id: ownerId,
        provider_id: input.sitter_id,
        provider_kind: 'sitter',
        pet_id: input.pet_id,
        primary_service_code: input.service_type,
        starts_at: input.start_date,
        ends_at: input.end_date,
        subtotal_amount: totalPrice,
        total_amount: totalPrice,
        platform_fee_amount: platformFee,
        payment_status: 'unpaid',
        owner_note: input.note || null,
        status: 'pending',
      })
      .select('*, provider:providers!bookings_provider_id_fkey(id, display_name, city, bio, rating_avg, review_count), pet:pets!bookings_pet_id_fkey(id, name, species, breed)')
      .single();

    if (error || !data) throw error;
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
      .select('*, provider:providers!bookings_provider_id_fkey(id, display_name, city, bio, rating_avg, review_count), pet:pets!bookings_pet_id_fkey(id, name, species, breed)')
      .eq('id', bookingId)
      .single();
    if (error || !data) throw error;
    return transformBookingData(data);
  } catch (err) {
    console.error('getBookingById error:', err);
    return null;
  }
}

export async function getBookingByIdWithSitterDetails(bookingId: string): Promise<Booking | null> {
  return getBookingById(bookingId);
}

export async function cancelBooking(bookingId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('cancelBooking error:', err);
    return false;
  }
}

export async function getSitterAvailability(sitterId: string, startDate: string, endDate: string): Promise<Availability[]> {
  try {
    const { data, error } = await supabase
      .from('availability_slots')
      .select('id, provider_id, starts_at, status')
      .eq('provider_id', sitterId)
      .gte('starts_at', startDate)
      .lte('starts_at', endDate);
    if (error) throw error;
    return (data || []).map((slot) => ({
      id: slot.id,
      sitter_id: slot.provider_id,
      date: slot.starts_at.split('T')[0],
      available: slot.status !== 'blocked',
    }));
  } catch (err) {
    console.error('getSitterAvailability error:', err);
    return [];
  }
}

export async function checkSitterAvailability(sitterId: string, startDate: string, endDate: string): Promise<boolean> {
  try {
    const { data: blocked, error: slotsError } = await supabase
      .from('availability_slots')
      .select('id')
      .eq('provider_id', sitterId)
      .eq('status', 'blocked')
      .lte('starts_at', endDate)
      .gte('ends_at', startDate);
    if (slotsError) throw slotsError;
    if (blocked && blocked.length > 0) return false;

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('provider_id', sitterId)
      .eq('status', 'accepted')
      .or(`and(starts_at.lte.${endDate},ends_at.gte.${startDate})`);
    if (bookingsError) throw bookingsError;
    return !(bookings && bookings.length > 0);
  } catch (err) {
    console.error('checkSitterAvailability error:', err);
    return false;
  }
}

export async function getSitterForBooking(sitterId: string): Promise<SitterInfo | null> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('id, display_name, city, bio, rating_avg, review_count, verified_status')
      .eq('id', sitterId)
      .eq('provider_kind', 'sitter')
      .maybeSingle();
    if (error || !data) throw error;
    const prices = await getProviderBasePrices(sitterId);
    return {
      id: data.id,
      name: data.display_name,
      avatar_url: null,
      city: data.city || '',
      bio: data.bio || '',
      price_per_hour: prices.boarding,
      services: Object.keys(prices) as ServiceType[],
      rating: data.rating_avg || 0,
      review_count: data.review_count || 0,
    };
  } catch (err) {
    console.error('getSitterForBooking error:', err);
    return null;
  }
}

export async function getSitterPrices(sitterId: string): Promise<Record<ServiceType, number> | null> {
  try {
    return await getProviderBasePrices(sitterId);
  } catch (err) {
    console.error('getSitterPrices error:', err);
    return null;
  }
}

export async function getOwnerPets(ownerId: string) {
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('id, name, species, breed, created_at')
      .eq('owner_profile_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: asSpecies(pet.species),
      breed: pet.breed ?? null,
      photo_url: null,
    }));
  } catch (err) {
    console.error('getOwnerPets error:', err);
    return [];
  }
}
