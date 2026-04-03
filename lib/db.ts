import { supabase } from './supabase';
import {
  Sitter,
  Product,
  ForumTopic,
  sitters as mockSitters,
  products as mockProducts,
  forumTopics as mockForumTopics,
} from './mock-data';

interface SitterFilters {
  city?: string;
  search?: string;
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
    // Fallback na mock podatke
    let result = mockSitters;
    if (filters?.city && filters.city !== 'Svi') {
      result = result.filter((s) => s.city === filters.city);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.services.some((svc) => svc.toLowerCase().includes(q))
      );
    }
    return result;
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
    // Fallback na mock podatke
    return mockSitters.find((s) => s.id === id) ?? null;
  }
}

// Shop ostaje mock (Supabase nema te tablice još)
export async function getProducts(): Promise<Product[]> {
  return mockProducts;
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

// Forum ostaje mock (Supabase nema te tablice još)
export async function getForumTopics(): Promise<ForumTopic[]> {
  return mockForumTopics;
}
