import { supabase } from './supabase';
import type { ChatContact, ForumCategory, ForumReply, ForumTopic, Sitter } from './domain-types';
import type { Pet, PetPassport, PetWithPassport, Appointment, PetDocument } from './types';

interface SitterFilters {
  city?: string;
  search?: string;
  service?: string;
  minRating?: number;
}

type ProviderRow = {
  id: string;
  display_name: string;
  city: string | null;
  bio: string | null;
  rating_avg: number | null;
  review_count: number | null;
  verified_status: string | null;
  provider_kind: string | null;
  service_listings?: Array<{ title: string | null; display_category: string | null; short_description: string | null; photos: unknown }> | null;
  provider_services?: Array<{ service_code: string | null; base_price: number | null; is_active: boolean | null }> | null;
  profiles?: { avatar_url: string | null } | null;
};

function arrayFromJson(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function firstPhoto(value: unknown): string {
  const photos = arrayFromJson(value);
  return photos[0] ?? '';
}

function mapProviderToSitter(row: ProviderRow): Sitter {
  const activeServices = row.provider_services?.filter((service) => service.is_active !== false) ?? [];
  const listing = row.service_listings?.[0];
  const services = activeServices
    .map((service) => service.service_code)
    .filter((service): service is string => !!service);
  const price = activeServices[0]?.base_price ?? 0;

  return {
    id: row.id,
    name: row.display_name,
    city: row.city ?? 'Hrvatska',
    rating: row.rating_avg ?? 0,
    reviewCount: row.review_count ?? 0,
    pricePerHour: price,
    bio: row.bio ?? listing?.short_description ?? '',
    services: services.length > 0 ? services : [listing?.display_category ?? listing?.title ?? 'Čuvanje ljubimaca'],
    avatar: row.profiles?.avatar_url ?? firstPhoto(listing?.photos),
    verified: row.verified_status === 'verified',
  };
}

export async function getSitters(filters?: SitterFilters): Promise<Sitter[]> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        id,
        display_name,
        city,
        bio,
        rating_avg,
        review_count,
        verified_status,
        provider_kind,
        profiles(avatar_url),
        provider_services(service_code, base_price, is_active),
        service_listings(title, display_category, short_description, photos)
      `)
      .eq('provider_kind', 'sitter')
      .eq('public_status', 'published')
      .limit(50);

    if (error) throw error;

    const normalizedSearch = filters?.search?.trim().toLowerCase();
    return ((data ?? []) as unknown as ProviderRow[])
      .map(mapProviderToSitter)
      .filter((sitter) => {
        if (filters?.city && filters.city !== 'Svi' && sitter.city !== filters.city) return false;
        if (filters?.service && filters.service !== 'Sve' && !sitter.services.includes(filters.service)) return false;
        if (filters?.minRating && filters.minRating > 0 && sitter.rating < filters.minRating) return false;
        if (normalizedSearch) {
          const haystack = `${sitter.name} ${sitter.city} ${sitter.bio} ${sitter.services.join(' ')}`.toLowerCase();
          if (!haystack.includes(normalizedSearch)) return false;
        }
        return true;
      });
  } catch {
    return [];
  }
}

export async function getSitterById(id: string): Promise<Sitter | null> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        id,
        display_name,
        city,
        bio,
        rating_avg,
        review_count,
        verified_status,
        provider_kind,
        profiles(avatar_url),
        provider_services(service_code, base_price, is_active),
        service_listings(title, display_category, short_description, photos)
      `)
      .eq('id', id)
      .eq('provider_kind', 'sitter')
      .maybeSingle();

    if (error) throw error;
    return data ? mapProviderToSitter(data as unknown as ProviderRow) : null;
  } catch {
    return null;
  }
}

// ─── Admin: Verification Queue ───────────────────────────────────────

export interface PendingSitter {
  id: string;
  name: string;
  city: string;
  avatar: string;
  verificationStatus: string;
  verificationNotes: string;
  verificationDocuments: string[];
  submittedAt: string | null;
}

export async function getPendingSitters(): Promise<PendingSitter[]> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('id, display_name, city, verified_status, created_at, profiles(avatar_url)')
      .eq('provider_kind', 'sitter')
      .eq('verified_status', 'pending');

    if (error) throw error;
    return ((data ?? []) as unknown as Array<ProviderRow & { created_at?: string }>).map((row) => ({
      id: row.id,
      name: row.display_name,
      city: row.city ?? 'Hrvatska',
      avatar: row.profiles?.avatar_url ?? '',
      verificationStatus: row.verified_status ?? 'pending',
      verificationNotes: '',
      verificationDocuments: [],
      submittedAt: row.created_at ?? null,
    }));
  } catch {
    return [];
  }
}

export async function setSitterVerification(
  sitterId: string,
  approved: boolean,
  adminNotes?: string,
): Promise<boolean> {
  void adminNotes;
  try {
    const { error } = await supabase
      .from('providers')
      .update({ verified_status: approved ? 'verified' : 'rejected' })
      .eq('id', sitterId)
      .eq('provider_kind', 'sitter');

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

function relativeTime(value?: string | null) {
  if (!value) return 'Upravo sada';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return 'Upravo sada';
  if (minutes < 60) return `Prije ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Prije ${hours} h`;
  const days = Math.round(hours / 24);
  return `Prije ${days} d`;
}

// Forum tables are not present on the remote schema yet. Keep navigation intact and render Uskoro/empty states.
export async function getForumCategories(): Promise<ForumCategory[]> {
  return [];
}

export async function getForumTopics(_categoryId?: string): Promise<ForumTopic[]> {
  return [];
}

export async function getForumTopicById(_topicId: string): Promise<ForumTopic | null> {
  return null;
}

export async function getForumReplies(_topicId: string): Promise<ForumReply[]> {
  return [];
}

export async function getChatContacts(search?: string): Promise<ChatContact[]> {
  const normalized = search?.trim().toLowerCase() ?? '';

  try {
    const [providersResult, profilesResult] = await Promise.all([
      supabase
        .from('providers')
        .select('id, display_name, city, provider_kind, profiles(avatar_url), provider_services(service_code, is_active)')
        .eq('public_status', 'published')
        .limit(20),
      supabase
        .from('profiles')
        .select('id, display_name, city, avatar_url')
        .limit(20),
    ]);

    if (providersResult.error) throw providersResult.error;
    if (profilesResult.error) throw profilesResult.error;

    const providers: ChatContact[] = ((providersResult.data ?? []) as unknown as ProviderRow[]).map((row) => ({
      id: row.id,
      name: row.display_name,
      subtitle: `${row.city ?? 'Hrvatska'} · ${row.provider_kind ?? 'provider'}`,
      avatar: row.profiles?.avatar_url || undefined,
      type: 'provider',
    }));

    const users: ChatContact[] = (profilesResult.data ?? []).map((row) => ({
      id: row.id,
      name: row.display_name ?? 'PetPark korisnik',
      subtitle: `${row.city ?? 'Hrvatska'} · korisnik`,
      avatar: row.avatar_url ?? undefined,
      type: 'user',
    }));

    const merged = [...providers, ...users];
    return normalized
      ? merged.filter((contact) =>
          contact.name.toLowerCase().includes(normalized) ||
          contact.subtitle.toLowerCase().includes(normalized)
        )
      : merged;
  } catch {
    return [];
  }
}

// ─── Pet Passport ───────────────────────────────────────────────────

export async function getOwnerPets(ownerId: string): Promise<Pet[]> {
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_profile_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Pet[];
  } catch {
    return [];
  }
}

export async function getPetById(petId: string): Promise<Pet | null> {
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (error) throw error;
    return data as unknown as Pet;
  } catch {
    return null;
  }
}

export async function getPetPassport(petId: string): Promise<PetPassport | null> {
  try {
    const { data, error } = await supabase
      .from('pet_passports')
      .select('*')
      .eq('pet_id', petId)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      const raw = typeof data.raw_json === 'object' && data.raw_json && !Array.isArray(data.raw_json) ? data.raw_json as Record<string, unknown> : {};
      return {
        pet_id: data.pet_id,
        vaccinations: Array.isArray(raw.vaccinations) ? raw.vaccinations : [],
        allergies: Array.isArray(raw.allergies) ? raw.allergies : [],
        medications: Array.isArray(raw.medications) ? raw.medications : [],
        vet_info: {
          name: data.vet_name ?? '',
          phone: data.vet_phone ?? '',
          address: data.vet_address ?? '',
          emergency: false,
        },
        notes: data.notes || '',
      } as PetPassport;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getPetWithPassport(petId: string): Promise<PetWithPassport | null> {
  try {
    const [pet, passport] = await Promise.all([
      getPetById(petId),
      getPetPassport(petId),
    ]);

    if (!pet) return null;

    return {
      ...pet,
      passport: passport || {
        pet_id: petId,
        vaccinations: [],
        allergies: [],
        medications: [],
        vet_info: { name: '', phone: '', address: '', emergency: false },
        notes: '',
      },
    };
  } catch {
    return null;
  }
}

export async function savePetPassport(
  petId: string,
  passport: Partial<PetPassport>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pet_passports')
      .upsert({
        pet_id: petId,
        vet_name: passport.vet_info?.name ?? null,
        vet_phone: passport.vet_info?.phone ?? null,
        vet_address: passport.vet_info?.address ?? null,
        notes: passport.notes ?? null,
        raw_json: {
          vaccinations: passport.vaccinations ?? [],
          allergies: passport.allergies ?? [],
          medications: passport.medications ?? [],
        } as any,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'pet_id',
      });

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

// Pet appointment/document tables are part of the additive draft plan; keep screens safely empty until approved.
export async function getPetAppointments(_petId: string): Promise<Appointment[]> {
  return [];
}

export async function getUpcomingAppointments(_ownerId: string): Promise<Appointment[]> {
  return [];
}

export async function getPetDocuments(_petId: string): Promise<PetDocument[]> {
  return [];
}
