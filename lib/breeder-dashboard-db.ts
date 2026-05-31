// Database funkcije za Breeder Dashboard

import { supabase } from './supabase';
import type {
  BreederProfile,
  Litter,
  Puppy,
  Application,
  BreederReview,
  BreederDocument,
  BreederStats,
} from './breeder-dashboard-types';

// ─── Breeder Profile ─────────────────────────────────────────────────────────

export async function getBreederProfile(userId: string): Promise<BreederProfile | null> {
  try {
    const { data, error } = await supabase
      .from('publisher_profiles')
      .select(`
        id,
        user_id,
        display_name,
        bio,
        city,
        phone,
        avatar_url,
        breeds,
        species,
        years_experience,
        fci_registered,
        certified,
        verified,
        verification_status,
        profile_completeness_pct,
        created_at,
        updated_at,
        user:users!user_id(email)
      `)
      .eq('user_id', userId)
      .eq('type', 'uzgajivač')
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      email: (data.user as any)?.email || '',
    } as BreederProfile;
  } catch (err) {
    console.error('getBreederProfile error:', err);
    return null;
  }
}

export async function updateBreederProfile(
  profileId: string,
  updates: Partial<BreederProfile>
): Promise<BreederProfile | null> {
  try {
    const { data, error } = await supabase
      .from('publisher_profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return data as BreederProfile;
  } catch (err) {
    console.error('updateBreederProfile error:', err);
    return null;
  }
}

// ─── Litters ─────────────────────────────────────────────────────────────────

export async function getBreederLitters(breederId: string): Promise<Litter[]> {
  try {
    const { data, error } = await supabase
      .from('litters')
      .select('*')
      .eq('breeder_id', breederId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((litter: any) => ({
      ...litter,
      images: litter.images || [],
    })) as Litter[];
  } catch (err) {
    console.error('getBreederLitters error:', err);
    return [];
  }
}

export async function createLitter(
  litterData: Omit<Litter, 'id' | 'created_at' | 'updated_at'>
): Promise<Litter | null> {
  try {
    const { data, error } = await supabase
      .from('litters')
      .insert(litterData)
      .select()
      .single();

    if (error) throw error;
    return data as Litter;
  } catch (err) {
    console.error('createLitter error:', err);
    return null;
  }
}

export async function updateLitter(
  litterId: string,
  updates: Partial<Litter>
): Promise<Litter | null> {
  try {
    const { data, error } = await supabase
      .from('litters')
      .update(updates)
      .eq('id', litterId)
      .select()
      .single();

    if (error) throw error;
    return data as Litter;
  } catch (err) {
    console.error('updateLitter error:', err);
    return null;
  }
}

export async function deleteLitter(litterId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('litters')
      .delete()
      .eq('id', litterId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteLitter error:', err);
    return false;
  }
}

// ─── Puppies ─────────────────────────────────────────────────────────────────

export async function getLitterPuppies(litterId: string): Promise<Puppy[]> {
  try {
    const { data, error } = await supabase
      .from('puppies')
      .select('*')
      .eq('litter_id', litterId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as Puppy[];
  } catch (err) {
    console.error('getLitterPuppies error:', err);
    return [];
  }
}

export async function getBreederPuppies(breederId: string): Promise<Puppy[]> {
  try {
    // First get all litters for this breeder
    const { data: litters, error: littersError } = await supabase
      .from('litters')
      .select('id')
      .eq('breeder_id', breederId);

    if (littersError) throw littersError;
    if (!litters || litters.length === 0) return [];

    const litterIds = litters.map((l: any) => l.id);

    const { data, error } = await supabase
      .from('puppies')
      .select('*')
      .in('litter_id', litterIds)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as Puppy[];
  } catch (err) {
    console.error('getBreederPuppies error:', err);
    return [];
  }
}

export async function createPuppy(
  puppyData: Omit<Puppy, 'id' | 'created_at' | 'updated_at'>
): Promise<Puppy | null> {
  try {
    const { data, error } = await supabase
      .from('puppies')
      .insert(puppyData)
      .select()
      .single();

    if (error) throw error;
    return data as Puppy;
  } catch (err) {
    console.error('createPuppy error:', err);
    return null;
  }
}

export async function updatePuppy(
  puppyId: string,
  updates: Partial<Puppy>
): Promise<Puppy | null> {
  try {
    const { data, error } = await supabase
      .from('puppies')
      .update(updates)
      .eq('id', puppyId)
      .select()
      .single();

    if (error) throw error;
    return data as Puppy;
  } catch (err) {
    console.error('updatePuppy error:', err);
    return null;
  }
}

// ─── Applications ────────────────────────────────────────────────────────────

export async function getBreederApplications(breederId: string): Promise<Application[]> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('breeder_id', breederId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Application[];
  } catch (err) {
    console.error('getBreederApplications error:', err);
    return [];
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: Application['status']
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('updateApplicationStatus error:', err);
    return false;
  }
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function getBreederReviews(breederId: string): Promise<BreederReview[]> {
  try {
    const { data, error } = await supabase
      .from('breeder_reviews')
      .select('*')
      .eq('breeder_id', breederId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as BreederReview[];
  } catch (err) {
    console.error('getBreederReviews error:', err);
    return [];
  }
}

// ─── Documents ───────────────────────────────────────────────────────────────

export async function getBreederDocuments(breederId: string): Promise<BreederDocument[]> {
  try {
    const { data, error } = await supabase
      .from('breeder_documents')
      .select('*')
      .eq('breeder_id', breederId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return (data || []) as BreederDocument[];
  } catch (err) {
    console.error('getBreederDocuments error:', err);
    return [];
  }
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getBreederStats(breederId: string): Promise<BreederStats> {
  try {
    // Get litters count
    const { data: litters, error: littersError } = await supabase
      .from('litters')
      .select('id, status, total_puppies, available_count')
      .eq('breeder_id', breederId);

    if (littersError) throw littersError;

    // Get applications count
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('id, status')
      .eq('breeder_id', breederId);

    if (appsError) throw appsError;

    // Calculate stats
    const totalLitters = litters?.length || 0;
    const activeLitters = litters?.filter((l: any) => l.status === 'available').length || 0;
    const totalPuppies = litters?.reduce((sum: number, l: any) => sum + (l.total_puppies || 0), 0) || 0;
    const availablePuppies = litters?.reduce((sum: number, l: any) => sum + (l.available_count || 0), 0) || 0;
    const totalApplications = applications?.length || 0;
    const newApplications = applications?.filter((a: any) => a.status === 'new').length || 0;

    return {
      totalLitters,
      activeLitters,
      totalPuppies,
      availablePuppies,
      totalApplications,
      newApplications,
      totalViews: 0, // Would need analytics table
      responseRate: 95, // Mock for now
      avgResponseTime: '< 2h', // Mock for now
      totalEarnings: 0, // Would need earnings table
      thisMonthEarnings: 0,
    };
  } catch (err) {
    console.error('getBreederStats error:', err);
    return {
      totalLitters: 0,
      activeLitters: 0,
      totalPuppies: 0,
      availablePuppies: 0,
      totalApplications: 0,
      newApplications: 0,
      totalViews: 0,
      responseRate: 0,
      avgResponseTime: '-',
      totalEarnings: 0,
      thisMonthEarnings: 0,
    };
  }
}

// ─── Messages ────────────────────────────────────────────────────────────────

export async function getUnreadMessagesCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('getUnreadMessagesCount error:', err);
    return 0;
  }
}
