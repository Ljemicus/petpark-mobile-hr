import { supabase } from './supabase';
import type { ChatContact, ForumCategory, ForumReply, ForumTopic, Sitter } from './domain-types';
import type { Pet, PetPassport, PetWithPassport, Appointment, PetDocument } from './types';

interface SitterFilters {
  city?: string;
  search?: string;
  service?: string;
  minRating?: number;
}

export async function getSitters(filters?: SitterFilters): Promise<Sitter[]> {
  try {
    let query = supabase
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
        users!inner (
          full_name,
          city
        )
      `);

    if (filters?.city && filters.city !== 'Svi') {
      query = query.eq('users.city', filters.city);
    }

    if (filters?.search) {
      query = query.or(
        `bio.ilike.%${filters.search}%,users.full_name.ilike.%${filters.search}%`
      );
    }

    if (filters?.service && filters.service !== 'Sve') {
      query = query.contains('services', [filters.service]);
    }

    if (filters?.minRating && filters.minRating > 0) {
      query = query.gte('rating', filters.minRating);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Nema podataka');

    return data.map((row: any) => ({
      id: row.id,
      name: row.users.full_name,
      city: row.users.city,
      rating: row.rating ?? 0,
      reviewCount: row.review_count ?? 0,
      pricePerHour: row.price_per_hour ?? 0,
      bio: row.bio ?? '',
      services: row.services ?? [],
      avatar: row.avatar ?? '',
      verified: row.verified ?? false,
    }));
  } catch {
    return [];
  }
}

export async function getSitterById(id: string): Promise<Sitter | null> {
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
        users!inner (
          full_name,
          city
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Nije pronađen');

    return {
      id: data.id,
      name: (data as any).users.full_name,
      city: (data as any).users.city,
      rating: data.rating ?? 0,
      reviewCount: data.review_count ?? 0,
      pricePerHour: data.price_per_hour ?? 0,
      bio: data.bio ?? '',
      services: data.services ?? [],
      avatar: data.avatar ?? '',
      verified: data.verified ?? false,
    };
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
      .from('sitter_profiles')
      .select(`
        id,
        avatar,
        verification_status,
        verification_notes,
        verification_documents,
        created_at,
        users!inner (
          full_name,
          city
        )
      `)
      .eq('verification_status', 'pending');

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      name: row.users.full_name,
      city: row.users.city,
      avatar: row.avatar ?? '',
      verificationStatus: row.verification_status ?? 'pending',
      verificationNotes: row.verification_notes ?? '',
      verificationDocuments: row.verification_documents ?? [],
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
  try {
    const status = approved ? 'verified' : 'rejected';
    const { error } = await supabase
      .from('sitter_profiles')
      .update({
        verification_status: status,
        verified: approved,
        ...(adminNotes ? { admin_notes: adminNotes } : {}),
      })
      .eq('id', sitterId);

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

export async function getForumCategories(): Promise<ForumCategory[]> {
  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('id, name, emoji, description, sort_order, forum_topics(count)')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      emoji: row.emoji ?? '💬',
      description: row.description ?? '',
      topicCount: row.forum_topics?.[0]?.count ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getForumTopics(categoryId?: string): Promise<ForumTopic[]> {
  try {
    let query = supabase
      .from('forum_topics')
      .select('id, category_id, author_name, title, preview, reply_count, last_activity_at')
      .order('last_activity_at', { ascending: false });

    if (categoryId) query = query.eq('category_id', categoryId);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      categoryId: row.category_id ?? '',
      title: row.title,
      author: row.author_name ?? 'PetPark korisnik',
      replyCount: row.reply_count ?? 0,
      lastActivity: relativeTime(row.last_activity_at),
      preview: row.preview ?? '',
    }));
  } catch {
    return [];
  }
}

export async function getForumTopicById(topicId: string): Promise<ForumTopic | null> {
  const topics = await getForumTopics();
  return topics.find((topic) => topic.id === topicId) ?? null;
}

export async function getForumReplies(topicId: string): Promise<ForumReply[]> {
  try {
    const { data, error } = await supabase
      .from('forum_replies')
      .select('id, author_name, body, is_expert, created_at')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      author: row.author_name ?? 'PetPark korisnik',
      text: row.body,
      time: relativeTime(row.created_at),
      isExpert: !!row.is_expert,
    }));
  } catch {
    return [];
  }
}

export async function getChatContacts(search?: string): Promise<ChatContact[]> {
  const normalized = search?.trim().toLowerCase() ?? '';

  try {
    const [sittersResult, usersResult] = await Promise.all([
      supabase
        .from('sitter_profiles')
        .select('id, services, avatar, users!inner(full_name, city)')
        .limit(20),
      supabase
        .from('users')
        .select('id, full_name, name, city, role, avatar')
        .limit(20),
    ]);

    if (sittersResult.error) throw sittersResult.error;
    if (usersResult.error) throw usersResult.error;

    const providers: ChatContact[] = (sittersResult.data ?? []).map((row: any) => ({
      id: row.id,
      name: row.users?.full_name ?? 'PetPark provider',
      subtitle: `${row.users?.city ?? 'Hrvatska'} · ${(row.services ?? []).slice(0, 2).join(', ') || 'Usluge za ljubimce'}`,
      avatar: row.avatar || undefined,
      type: 'provider',
    }));

    const users: ChatContact[] = (usersResult.data ?? []).map((row: any) => ({
      id: row.id,
      name: row.full_name ?? row.name ?? 'PetPark korisnik',
      subtitle: `${row.city ?? 'Hrvatska'} · ${row.role ?? 'korisnik'}`,
      avatar: row.avatar && row.avatar.startsWith('http') ? row.avatar : undefined,
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
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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
    return data;
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
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (data) {
      return {
        pet_id: data.pet_id,
        vaccinations: data.vaccinations || [],
        allergies: data.allergies || [],
        medications: data.medications || [],
        vet_info: data.vet_info || { name: '', phone: '', address: '', emergency: false },
        notes: data.notes || '',
      };
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
        ...passport,
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

export async function getPetAppointments(petId: string): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('pet_appointments')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function getUpcomingAppointments(ownerId: string): Promise<Appointment[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('pet_appointments')
      .select(`
        *,
        pets!inner(owner_id)
      `)
      .eq('pets.owner_id', ownerId)
      .gte('date', today)
      .eq('status', 'upcoming')
      .order('date', { ascending: true })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function getPetDocuments(petId: string): Promise<PetDocument[]> {
  try {
    const { data, error } = await supabase
      .from('pet_documents')
      .select('*')
      .eq('pet_id', petId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}
