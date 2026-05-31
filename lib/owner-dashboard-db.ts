// Database funkcije za Owner Dashboard

import { supabase } from './supabase';
import type { Pet, Booking, Message, ConversationSummary } from './owner-dashboard-types';

// ─── Pets ─────────────────────────────────────────────────────────

export async function getPetsByOwner(ownerId: string): Promise<Pet[]> {
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getPetsByOwner error:', err);
    return [];
  }
}

export async function createPet(petData: Omit<Pet, 'id' | 'created_at'>): Promise<Pet | null> {
  try {
    const { data, error } = await supabase
      .from('pets')
      .insert(petData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('createPet error:', err);
    return null;
  }
}

export async function updatePet(petId: string, updates: Partial<Pet>): Promise<Pet | null> {
  try {
    const { data, error } = await supabase
      .from('pets')
      .update(updates)
      .eq('id', petId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('updatePet error:', err);
    return null;
  }
}

export async function deletePet(petId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deletePet error:', err);
    return false;
  }
}

// ─── Bookings ─────────────────────────────────────────────────────

export async function getOwnerBookings(ownerId: string): Promise<Booking[]> {
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
        note,
        payment_status,
        created_at,
        sitter:users!sitter_id(id, name, avatar_url),
        pet:pets(id, name, species)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((row: any) => ({
      ...row,
      sitter: row.sitter ? {
        id: row.sitter.id,
        name: row.sitter.name,
        avatar_url: row.sitter.avatar_url,
      } : undefined,
      pet: row.pet ? {
        id: row.pet.id,
        name: row.pet.name,
        species: row.pet.species,
      } : undefined,
    }));
  } catch (err) {
    console.error('getOwnerBookings error:', err);
    return [];
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

export async function getReviewedBookingIds(ownerId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('booking_id')
      .eq('owner_id', ownerId);

    if (error) throw error;
    return (data || []).map((r: any) => r.booking_id);
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
    const { error } = await supabase
      .from('reviews')
      .insert(reviewData);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('createReview error:', err);
    return false;
  }
}

// ─── Messages ─────────────────────────────────────────────────────

export async function getConversationSummaries(userId: string): Promise<ConversationSummary[]> {
  try {
    // Pokušaj koristiti RPC funkciju ako postoji
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_message_conversation_summaries', {
        p_user_id: userId,
      });

    if (!rpcError && rpcData) {
      return (rpcData as any[]).map((row) => ({
        partnerId: row.partner_id,
        partnerName: row.partner_name || 'Korisnik',
        partnerAvatar: row.partner_avatar,
        lastMessage: row.last_message_id ? {
          id: row.last_message_id,
          sender_id: row.last_message_sender_id || userId,
          receiver_id: row.last_message_receiver_id || row.partner_id,
          booking_id: row.last_message_booking_id,
          content: row.last_message_content,
          image_url: row.last_message_image_url,
          read: row.last_message_read ?? true,
          created_at: row.last_message_created_at || new Date().toISOString(),
        } : null,
        unreadCount: row.unread_count ?? 0,
      }));
    }

    // Fallback: ručno grupiranje poruka
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        booking_id,
        content,
        image_url,
        read,
        created_at,
        sender:users!sender_id(id, name, avatar_url, role)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const messages = (data || []).map((item: any) => ({
      ...item,
      sender: Array.isArray(item.sender) ? item.sender[0] : item.sender,
    })) as Message[];
    const grouped = new Map<string, Message[]>();

    for (const message of messages) {
      const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const existing = grouped.get(partnerId) || [];
      existing.push(message);
      grouped.set(partnerId, existing);
    }

    return Array.from(grouped.entries())
      .map(([partnerId, convoMessages]) => {
        const sorted = convoMessages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const lastMessage = sorted[sorted.length - 1] || null;
        const partnerName = lastMessage?.sender_id === userId
          ? 'Korisnik'
          : (lastMessage?.sender?.name || 'Korisnik');
        const partnerAvatar = lastMessage?.sender_id === userId
          ? null
          : (lastMessage?.sender?.avatar_url || null);
        const unreadCount = sorted.filter((msg) => !msg.read && msg.receiver_id === userId).length;

        return {
          partnerId,
          partnerName,
          partnerAvatar,
          lastMessage,
          unreadCount,
        };
      })
      .sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bTime - aTime;
      });
  } catch (err) {
    console.error('getConversationSummaries error:', err);
    return [];
  }
}

export async function getMessagesForConversation(userId: string, partnerId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        booking_id,
        content,
        image_url,
        read,
        created_at,
        sender:users!sender_id(id, name, avatar_url, role)
      `)
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map((item: any) => ({
      ...item,
      sender: Array.isArray(item.sender) ? item.sender[0] : item.sender,
    })) as Message[];
  } catch (err) {
    console.error('getMessagesForConversation error:', err);
    return [];
  }
}

export async function sendMessage(messageData: Omit<Message, 'id' | 'created_at'>): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('sendMessage error:', err);
    return null;
  }
}

export async function markMessagesAsRead(userId: string, partnerId: string): Promise<void> {
  try {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', userId)
      .eq('read', false);
  } catch (err) {
    console.error('markMessagesAsRead error:', err);
  }
}

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
