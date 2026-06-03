// Database funkcije za Sitter Dashboard

import { supabase } from './supabase';
import type {
  Booking,
  Review,
  Availability,
  PetUpdate,
  SitterProfile,
  Message,
  ConversationSummary,
} from './sitter-dashboard-types';

type RemoteMessage = {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  content: string | null;
  image_storage_path: string | null;
  message_type: string;
  created_at: string;
  deleted_at: string | null;
};

type ConversationParticipant = {
  conversation_id: string;
  profile_id: string;
  last_read_at: string | null;
  created_at: string;
};

function toMessage(row: RemoteMessage, partnerId: string, bookingId: string | null = null): Message {
  return {
    id: row.id,
    sender_id: row.sender_profile_id,
    receiver_id: row.sender_profile_id === partnerId ? '' : partnerId,
    booking_id: bookingId,
    content: row.content,
    image_url: row.image_storage_path,
    read: true,
    created_at: row.created_at,
  };
}

async function findConversationBetween(userId: string, partnerId: string): Promise<string | null> {
  const { data: mine } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('profile_id', userId);

  const conversationIds = (mine || []).map((row) => row.conversation_id);
  if (conversationIds.length === 0) return null;

  const { data: theirs } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('profile_id', partnerId)
    .in('conversation_id', conversationIds)
    .limit(1);

  return theirs?.[0]?.conversation_id || null;
}

async function getOrCreateConversation(userId: string, partnerId: string, bookingId?: string | null) {
  const existingId = await findConversationBetween(userId, partnerId);
  if (existingId) return existingId;

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({ created_by_profile_id: userId, booking_id: bookingId ?? null })
    .select('id')
    .single();

  if (error || !conversation) throw error;

  await supabase.from('conversation_participants').insert([
    { conversation_id: conversation.id, profile_id: userId },
    { conversation_id: conversation.id, profile_id: partnerId },
  ]);

  return conversation.id;
}

function toBooking(row: any): Booking {
  return {
    id: row.id,
    owner_id: row.owner_profile_id,
    sitter_id: row.provider_id,
    pet_id: row.pet_id,
    service_type: row.primary_service_code || 'boarding',
    start_date: row.starts_at,
    end_date: row.ends_at,
    status: row.status,
    total_price: row.total_amount ?? 0,
    note: row.provider_note,
    address: null,
    message: row.owner_note,
    created_at: row.created_at,
    owner: row.owner
      ? {
          id: row.owner.id,
          name: row.owner.display_name || row.owner.email || 'Korisnik',
          avatar_url: row.owner.avatar_url,
          email: row.owner.email,
        }
      : undefined,
    pet: row.pet
      ? {
          id: row.pet.id,
          name: row.pet.name,
          species: row.pet.species,
          breed: row.pet.breed,
          special_needs: row.pet.special_needs,
        }
      : undefined,
  } as Booking;
}

// ─── Sitter Profile ───────────────────────────────────────────────

export async function getSitterProfile(userId: string): Promise<SitterProfile | null> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*, provider_sitter_settings(*)')
      .eq('profile_id', userId)
      .eq('provider_kind', 'sitter')
      .maybeSingle();

    if (error || !data) return null;
    const settings = Array.isArray((data as any).provider_sitter_settings)
      ? (data as any).provider_sitter_settings[0]
      : (data as any).provider_sitter_settings;

    return {
      user_id: data.profile_id,
      bio: data.bio,
      experience_years: data.experience_years ?? 0,
      services: ['boarding', 'walking', 'house-sitting', 'drop-in', 'daycare'],
      prices: {
        boarding: 0,
        walking: 0,
        'house-sitting': 0,
        'drop-in': 0,
        daycare: 0,
      },
      verified: data.verified_status === 'verified',
      rating_avg: data.rating_avg,
      review_count: data.review_count,
      city: data.city,
      instant_booking: data.instant_booking_enabled,
      created_at: data.created_at,
      ...settings,
    } as SitterProfile;
  } catch (err) {
    console.error('getSitterProfile error:', err);
    return null;
  }
}

export async function updateSitterProfile(
  userId: string,
  updates: Partial<SitterProfile>
): Promise<SitterProfile | null> {
  try {
    const providerUpdates = {
      bio: updates.bio ?? undefined,
      city: updates.city ?? undefined,
      experience_years: updates.experience_years ?? undefined,
      instant_booking_enabled: updates.instant_booking ?? undefined,
    };

    const { error } = await supabase
      .from('providers')
      .update(providerUpdates)
      .eq('profile_id', userId)
      .eq('provider_kind', 'sitter');

    if (error) throw error;
    return getSitterProfile(userId);
  } catch (err) {
    console.error('updateSitterProfile error:', err);
    return null;
  }
}

// ─── Bookings ─────────────────────────────────────────────────────

export async function getSitterBookings(sitterId: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, owner_profile_id, provider_id, pet_id, primary_service_code,
        starts_at, ends_at, status, total_amount, provider_note, owner_note, created_at,
        owner:profiles!bookings_owner_profile_id_fkey(id, display_name, avatar_url, email),
        pet:pets!bookings_pet_id_fkey(id, name, species, breed, special_needs)
      `)
      .eq('provider_id', sitterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(toBooking);
  } catch (err) {
    console.error('getSitterBookings error:', err);
    return [];
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'accepted' | 'rejected' | 'completed'
): Promise<boolean> {
  try {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('updateBookingStatus error:', err);
    return false;
  }
}

// ─── Availability ─────────────────────────────────────────────────

export async function getAvailability(sitterId: string): Promise<Availability[]> {
  try {
    const { data, error } = await supabase
      .from('availability_slots')
      .select('id, provider_id, starts_at, status, created_at')
      .eq('provider_id', sitterId)
      .order('starts_at', { ascending: true });

    if (error) throw error;
    return (data || []).map((slot) => ({
      id: slot.id,
      sitter_id: slot.provider_id,
      date: slot.starts_at.slice(0, 10),
      available: slot.status === 'available',
      created_at: slot.created_at,
    }));
  } catch (err) {
    console.error('getAvailability error:', err);
    return [];
  }
}

export async function toggleAvailability(
  sitterId: string,
  dateStr: string,
  available: boolean
): Promise<boolean> {
  try {
    const startsAt = `${dateStr}T00:00:00.000Z`;
    const endsAt = `${dateStr}T23:59:59.000Z`;
    const { data: existing } = await supabase
      .from('availability_slots')
      .select('id')
      .eq('provider_id', sitterId)
      .gte('starts_at', startsAt)
      .lte('starts_at', endsAt)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('availability_slots')
        .update({ status: available ? 'available' : 'unavailable' })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('availability_slots').insert({
        provider_id: sitterId,
        starts_at: startsAt,
        ends_at: endsAt,
        status: available ? 'available' : 'unavailable',
      });
      if (error) throw error;
    }

    return true;
  } catch (err) {
    console.error('toggleAvailability error:', err);
    return false;
  }
}

export async function setBulkAvailability(
  sitterId: string,
  dates: string[],
  available: boolean
): Promise<boolean> {
  try {
    for (const date of dates) {
      const ok = await toggleAvailability(sitterId, date, available);
      if (!ok) return false;
    }
    return true;
  } catch (err) {
    console.error('setBulkAvailability error:', err);
    return false;
  }
}

// ─── Reviews ──────────────────────────────────────────────────────

export async function getSitterReviews(sitterId: string): Promise<Review[]> {
  try {
    const { data: provider } = await supabase
      .from('providers')
      .select('profile_id')
      .eq('id', sitterId)
      .maybeSingle();
    const revieweeProfileId = provider?.profile_id || sitterId;

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, booking_id, reviewer_profile_id, rating, comment, created_at,
        reviewer:profiles!reviews_reviewer_profile_id_fkey(display_name, avatar_url)
      `)
      .eq('reviewee_profile_id', revieweeProfileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      booking_id: row.booking_id,
      reviewer_id: row.reviewer_profile_id,
      rating: row.rating,
      comment: row.comment,
      created_at: row.created_at,
      reviewer: row.reviewer
        ? {
            name: row.reviewer.display_name || 'Korisnik',
            avatar_url: row.reviewer.avatar_url,
          }
        : undefined,
    }));
  } catch (err) {
    console.error('getSitterReviews error:', err);
    return [];
  }
}

// ─── Pet Updates ──────────────────────────────────────────────────
// Remote schema does not have draft pet update rows yet. Keep the MVP safe and quiet.

export async function getRecentUpdates(_sitterId: string): Promise<PetUpdate[]> {
  return [];
}

export async function createPetUpdate(_updateData: {
  booking_id: string;
  sitter_id: string;
  type: 'photo' | 'video' | 'text';
  emoji: string;
  caption: string;
  photo_url: string | null;
}): Promise<PetUpdate | null> {
  return null;
}

// ─── Earnings ─────────────────────────────────────────────────────

export interface MonthlyEarnings {
  month: string;
  amount: number;
  bookingCount: number;
}

export async function getSitterEarnings(sitterId: string): Promise<{
  totalEarnings: number;
  thisMonthEarnings: number;
  monthlyEarnings: MonthlyEarnings[];
  completedBookings: Booking[];
}> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, owner_profile_id, provider_id, pet_id, primary_service_code,
        starts_at, ends_at, status, total_amount, provider_note, owner_note, created_at,
        owner:profiles!bookings_owner_profile_id_fkey(id, display_name, avatar_url, email),
        pet:pets!bookings_pet_id_fkey(id, name, species, breed, special_needs)
      `)
      .eq('provider_id', sitterId)
      .eq('status', 'completed');

    if (error) throw error;
    const completedBookings = (data || []).map(toBooking);
    const totalEarnings = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
    const now = new Date();
    const thisMonthEarnings = completedBookings
      .filter((b) => {
        const bd = new Date(b.end_date);
        return bd.getMonth() === now.getMonth() && bd.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + b.total_price, 0);

    const monthlyEarnings: MonthlyEarnings[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleDateString('hr-HR', { month: 'short' });
      const monthBookings = completedBookings.filter((b) => {
        const bd = new Date(b.end_date);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      });
      monthlyEarnings.push({
        month: monthStr,
        amount: monthBookings.reduce((sum, b) => sum + b.total_price, 0),
        bookingCount: monthBookings.length,
      });
    }

    return { totalEarnings, thisMonthEarnings, monthlyEarnings, completedBookings };
  } catch (err) {
    console.error('getSitterEarnings error:', err);
    return { totalEarnings: 0, thisMonthEarnings: 0, monthlyEarnings: [], completedBookings: [] };
  }
}

// ─── Messages ─────────────────────────────────────────────────────

export async function getConversationSummaries(userId: string): Promise<ConversationSummary[]> {
  try {
    const { data: participants, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, profile_id, last_read_at, created_at')
      .eq('profile_id', userId);

    if (participantError) throw participantError;
    const conversationIds = (participants || []).map((p) => p.conversation_id);
    if (conversationIds.length === 0) return [];

    const { data: allParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, profile_id, last_read_at, created_at')
      .in('conversation_id', conversationIds);

    const partnerIds = (allParticipants || [])
      .filter((p) => p.profile_id !== userId)
      .map((p) => p.profile_id);

    const { data: profiles } = partnerIds.length
      ? await supabase.from('profiles').select('id, display_name, avatar_url, email').in('id', partnerIds)
      : { data: [] as any[] };

    const { data: messages } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_profile_id, content, image_storage_path, message_type, created_at, deleted_at')
      .in('conversation_id', conversationIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    return conversationIds
      .map((conversationId) => {
        const conversationParticipants = (allParticipants || []).filter(
          (p) => p.conversation_id === conversationId
        ) as ConversationParticipant[];
        const partner = conversationParticipants.find((p) => p.profile_id !== userId);
        if (!partner) return null;

        const profile = (profiles || []).find((p: any) => p.id === partner.profile_id);
        const convoMessages = ((messages || []) as RemoteMessage[]).filter(
          (m) => m.conversation_id === conversationId
        );
        const last = convoMessages[0];
        const mine = conversationParticipants.find((p) => p.profile_id === userId);
        const lastReadAt = mine?.last_read_at ? new Date(mine.last_read_at).getTime() : 0;
        const unreadCount = convoMessages.filter(
          (m) => m.sender_profile_id !== userId && new Date(m.created_at).getTime() > lastReadAt
        ).length;

        return {
          partnerId: partner.profile_id,
          partnerName: profile?.display_name || profile?.email || 'Korisnik',
          partnerAvatar: profile?.avatar_url || null,
          lastMessage: last ? toMessage(last, partner.profile_id) : null,
          unreadCount,
        } satisfies ConversationSummary;
      })
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a?.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bTime = b?.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bTime - aTime;
      }) as ConversationSummary[];
  } catch (err) {
    console.error('getConversationSummaries error:', err);
    return [];
  }
}

export async function getMessagesForConversation(userId: string, partnerId: string): Promise<Message[]> {
  try {
    const conversationId = await findConversationBetween(userId, partnerId);
    if (!conversationId) return [];

    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_profile_id, content, image_storage_path, message_type, created_at, deleted_at')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return ((data || []) as RemoteMessage[]).map((row) => {
      const message = toMessage(row, partnerId);
      message.receiver_id = row.sender_profile_id === userId ? partnerId : userId;
      return message;
    });
  } catch (err) {
    console.error('getMessagesForConversation error:', err);
    return [];
  }
}

export async function sendMessage(messageData: Omit<Message, 'id' | 'created_at'>): Promise<Message | null> {
  try {
    const conversationId = await getOrCreateConversation(
      messageData.sender_id,
      messageData.receiver_id,
      messageData.booking_id
    );
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_profile_id: messageData.sender_id,
        content: messageData.content,
        image_storage_path: messageData.image_url,
        message_type: messageData.image_url ? 'image' : 'text',
      })
      .select('id, conversation_id, sender_profile_id, content, image_storage_path, message_type, created_at, deleted_at')
      .single();

    if (error) throw error;

    await supabase
      .from('conversations')
      .update({ last_message_at: data.created_at })
      .eq('id', conversationId);

    const message = toMessage(data as RemoteMessage, messageData.receiver_id, messageData.booking_id);
    message.receiver_id = messageData.receiver_id;
    return message;
  } catch (err) {
    console.error('sendMessage error:', err);
    return null;
  }
}

export async function markMessagesAsRead(userId: string, partnerId: string): Promise<void> {
  try {
    const conversationId = await findConversationBetween(userId, partnerId);
    if (!conversationId) return;
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('profile_id', userId);
  } catch (err) {
    console.error('markMessagesAsRead error:', err);
  }
}

export async function getUnreadMessagesCount(userId: string): Promise<number> {
  try {
    const summaries = await getConversationSummaries(userId);
    return summaries.reduce((sum, summary) => sum + summary.unreadCount, 0);
  } catch (err) {
    console.error('getUnreadMessagesCount error:', err);
    return 0;
  }
}
