// Database funkcije za Owner Dashboard

import { supabase } from './supabase';
import type { Pet, Booking, Message, ConversationSummary } from './owner-dashboard-types';

function toPet(row: any): Pet {
  return {
    id: row.id,
    owner_id: row.owner_profile_id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    age: row.birth_date ? Math.max(0, new Date().getFullYear() - new Date(row.birth_date).getFullYear()) : null,
    weight: row.weight_kg,
    special_needs: row.special_needs,
    photo_url: null,
    created_at: row.created_at,
  };
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
    note: row.owner_note,
    payment_status: row.payment_status,
    created_at: row.created_at,
    sitter: row.provider
      ? { id: row.provider.id, name: row.provider.display_name || 'Pružatelj usluge', avatar_url: null }
      : undefined,
    pet: row.pet ? { id: row.pet.id, name: row.pet.name, species: row.pet.species } : undefined,
  } as Booking;
}

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

function toMessage(row: RemoteMessage, userId: string, partnerId: string, bookingId: string | null = null): Message {
  return {
    id: row.id,
    sender_id: row.sender_profile_id,
    receiver_id: row.sender_profile_id === userId ? partnerId : userId,
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
  const ids = (mine || []).map((row) => row.conversation_id);
  if (!ids.length) return null;
  const { data: theirs } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('profile_id', partnerId)
    .in('conversation_id', ids)
    .limit(1);
  return theirs?.[0]?.conversation_id || null;
}

async function getOrCreateConversation(userId: string, partnerId: string, bookingId?: string | null) {
  const existing = await findConversationBetween(userId, partnerId);
  if (existing) return existing;
  const { data, error } = await supabase
    .from('conversations')
    .insert({ created_by_profile_id: userId, booking_id: bookingId ?? null })
    .select('id')
    .single();
  if (error || !data) throw error;
  await supabase.from('conversation_participants').insert([
    { conversation_id: data.id, profile_id: userId },
    { conversation_id: data.id, profile_id: partnerId },
  ]);
  return data.id;
}

export async function getPetsByOwner(ownerId: string): Promise<Pet[]> {
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_profile_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toPet);
  } catch (err) {
    console.error('getPetsByOwner error:', err);
    return [];
  }
}

export async function createPet(petData: Omit<Pet, 'id' | 'created_at'>): Promise<Pet | null> {
  try {
    const { data, error } = await supabase
      .from('pets')
      .insert({
        owner_profile_id: petData.owner_id,
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        weight_kg: petData.weight,
        special_needs: petData.special_needs,
      })
      .select('*')
      .single();
    if (error || !data) throw error;
    return toPet(data);
  } catch (err) {
    console.error('createPet error:', err);
    return null;
  }
}

export async function updatePet(petId: string, updates: Partial<Pet>): Promise<Pet | null> {
  try {
    const { data, error } = await supabase
      .from('pets')
      .update({
        name: updates.name,
        species: updates.species,
        breed: updates.breed,
        weight_kg: updates.weight,
        special_needs: updates.special_needs,
      })
      .eq('id', petId)
      .select('*')
      .single();
    if (error || !data) throw error;
    return toPet(data);
  } catch (err) {
    console.error('updatePet error:', err);
    return null;
  }
}

export async function deletePet(petId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('pets').update({ is_active: false }).eq('id', petId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deletePet error:', err);
    return false;
  }
}

export async function getOwnerBookings(ownerId: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, owner_profile_id, provider_id, pet_id, primary_service_code,
        starts_at, ends_at, status, total_amount, owner_note, payment_status, created_at,
        provider:providers!bookings_provider_id_fkey(id, display_name),
        pet:pets!bookings_pet_id_fkey(id, name, species)
      `)
      .eq('owner_profile_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toBooking);
  } catch (err) {
    console.error('getOwnerBookings error:', err);
    return [];
  }
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

export async function getReviewedBookingIds(ownerId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('booking_id')
      .eq('reviewer_profile_id', ownerId);
    if (error) throw error;
    return (data || []).map((review) => review.booking_id);
  } catch (err) {
    console.error('getReviewedBookingIds error:', err);
    return [];
  }
}

export async function createReview(reviewData: {
  booking_id: string;
  owner_id: string;
  sitter_id: string;
  rating: number;
  comment: string;
}): Promise<boolean> {
  try {
    const { data: provider } = await supabase
      .from('providers')
      .select('id, profile_id')
      .eq('id', reviewData.sitter_id)
      .maybeSingle();

    const { error } = await supabase.from('reviews').insert({
      booking_id: reviewData.booking_id,
      reviewer_profile_id: reviewData.owner_id,
      reviewee_profile_id: provider?.profile_id || reviewData.sitter_id,
      provider_id: provider?.id || reviewData.sitter_id,
      rating: reviewData.rating,
      comment: reviewData.comment,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('createReview error:', err);
    return false;
  }
}

export async function getConversationSummaries(userId: string): Promise<ConversationSummary[]> {
  try {
    const { data: mine, error } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('profile_id', userId);
    if (error) throw error;
    const conversationIds = (mine || []).map((p) => p.conversation_id);
    if (!conversationIds.length) return [];

    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, profile_id')
      .in('conversation_id', conversationIds);
    const partners = (participants || []).filter((p) => p.profile_id !== userId);
    const partnerIds = partners.map((p) => p.profile_id);
    const { data: profiles } = partnerIds.length
      ? await supabase.from('profiles').select('id, display_name, avatar_url, email').in('id', partnerIds)
      : { data: [] as any[] };
    const { data: messages } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_profile_id, content, image_storage_path, message_type, created_at, deleted_at')
      .in('conversation_id', conversationIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    return partners.map((partner) => {
      const profile = (profiles || []).find((p: any) => p.id === partner.profile_id);
      const latest = ((messages || []) as RemoteMessage[]).find((m) => m.conversation_id === partner.conversation_id);
      const mineRow = (mine || []).find((p) => p.conversation_id === partner.conversation_id);
      const lastRead = mineRow?.last_read_at ? new Date(mineRow.last_read_at).getTime() : 0;
      const unreadCount = ((messages || []) as RemoteMessage[]).filter(
        (m) =>
          m.conversation_id === partner.conversation_id &&
          m.sender_profile_id !== userId &&
          new Date(m.created_at).getTime() > lastRead
      ).length;
      return {
        partnerId: partner.profile_id,
        partnerName: profile?.display_name || profile?.email || 'Korisnik',
        partnerAvatar: profile?.avatar_url || null,
        lastMessage: latest ? toMessage(latest, userId, partner.profile_id) : null,
        unreadCount,
      };
    });
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
    return ((data || []) as RemoteMessage[]).map((row) => toMessage(row, userId, partnerId));
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
    if (error || !data) throw error;
    await supabase.from('conversations').update({ last_message_at: data.created_at }).eq('id', conversationId);
    return toMessage(data as RemoteMessage, messageData.sender_id, messageData.receiver_id, messageData.booking_id);
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
  const summaries = await getConversationSummaries(userId);
  return summaries.reduce((sum, summary) => sum + summary.unreadCount, 0);
}
