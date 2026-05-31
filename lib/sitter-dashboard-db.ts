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

// ─── Sitter Profile ───────────────────────────────────────────────

export async function getSitterProfile(userId: string): Promise<SitterProfile | null> {
  try {
    const { data, error } = await supabase
      .from('sitter_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as SitterProfile;
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
    const { data, error } = await supabase
      .from('sitter_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as SitterProfile;
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
        address,
        message,
        created_at,
        owner:users!owner_id(id, name, avatar_url, email),
        pet:pets(id, name, species, breed, special_needs)
      `)
      .eq('sitter_id', sitterId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...row,
      owner: row.owner
        ? {
            id: row.owner.id,
            name: row.owner.name,
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
    }));
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
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

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
      .from('availability')
      .select('*')
      .eq('sitter_id', sitterId);

    if (error) throw error;
    return data || [];
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
    // Provjeri postoji li zapis za taj datum
    const { data: existing } = await supabase
      .from('availability')
      .select('id')
      .eq('sitter_id', sitterId)
      .eq('date', dateStr)
      .single();

    if (existing) {
      // Ažuriraj postojeći
      const { error } = await supabase
        .from('availability')
        .update({ available })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Kreiraj novi
      const { error } = await supabase.from('availability').insert({
        sitter_id: sitterId,
        date: dateStr,
        available,
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
    const records = dates.map((date) => ({
      sitter_id: sitterId,
      date,
      available,
    }));

    const { error } = await supabase.from('availability').upsert(records, {
      onConflict: 'sitter_id,date',
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('setBulkAvailability error:', err);
    return false;
  }
}

// ─── Reviews ──────────────────────────────────────────────────────

export async function getSitterReviews(sitterId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        booking_id,
        reviewer_id,
        rating,
        comment,
        created_at,
        reviewer:users!reviewer_id(name, avatar_url)
      `)
      .eq('reviewee_id', sitterId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...row,
      reviewer: row.reviewer
        ? {
            name: row.reviewer.name,
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

export async function getRecentUpdates(sitterId: string): Promise<PetUpdate[]> {
  try {
    const { data, error } = await supabase
      .from('pet_updates')
      .select(`
        id,
        booking_id,
        type,
        emoji,
        caption,
        photo_url,
        created_at
      `)
      .eq('sitter_id', sitterId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return (data || []) as PetUpdate[];
  } catch (err) {
    console.error('getRecentUpdates error:', err);
    return [];
  }
}

export async function createPetUpdate(updateData: {
  booking_id: string;
  sitter_id: string;
  type: 'photo' | 'video' | 'text';
  emoji: string;
  caption: string;
  photo_url: string | null;
}): Promise<PetUpdate | null> {
  try {
    const { data, error } = await supabase
      .from('pet_updates')
      .insert(updateData)
      .select()
      .single();

    if (error) throw error;
    return data as PetUpdate;
  } catch (err) {
    console.error('createPetUpdate error:', err);
    return null;
  }
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
        id,
        owner_id,
        sitter_id,
        pet_id,
        service_type,
        start_date,
        end_date,
        status,
        total_price,
        created_at,
        owner:users!owner_id(id, name, avatar_url, email),
        pet:pets(id, name, species, breed, special_needs)
      `)
      .eq('sitter_id', sitterId)
      .eq('status', 'completed');

    if (error) throw error;

    const completedBookings = (data || []).map((row: any) => ({
      ...row,
      owner: row.owner
        ? {
            id: row.owner.id,
            name: row.owner.name,
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
    })) as Booking[];

    const totalEarnings = completedBookings.reduce((sum, b) => sum + b.total_price, 0);

    const now = new Date();
    const thisMonthEarnings = completedBookings
      .filter((b) => {
        const bd = new Date(b.end_date);
        return bd.getMonth() === now.getMonth() && bd.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + b.total_price, 0);

    // Monthly earnings for last 6 months
    const monthlyEarnings: MonthlyEarnings[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleDateString('hr-HR', { month: 'short' });
      const monthBookings = completedBookings.filter((b) => {
        const bd = new Date(b.end_date);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      });
      const amount = monthBookings.reduce((sum, b) => sum + b.total_price, 0);
      monthlyEarnings.push({
        month: monthStr,
        amount,
        bookingCount: monthBookings.length,
      });
    }

    return {
      totalEarnings,
      thisMonthEarnings,
      monthlyEarnings,
      completedBookings,
    };
  } catch (err) {
    console.error('getSitterEarnings error:', err);
    return {
      totalEarnings: 0,
      thisMonthEarnings: 0,
      monthlyEarnings: [],
      completedBookings: [],
    };
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
        lastMessage: row.last_message_id
          ? {
              id: row.last_message_id,
              sender_id: row.last_message_sender_id || userId,
              receiver_id: row.last_message_receiver_id || row.partner_id,
              booking_id: row.last_message_booking_id,
              content: row.last_message_content,
              image_url: row.last_message_image_url,
              read: row.last_message_read ?? true,
              created_at: row.last_message_created_at || new Date().toISOString(),
            }
          : null,
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
        const sorted = convoMessages.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const lastMessage = sorted[sorted.length - 1] || null;
        const partnerName =
          lastMessage?.sender_id === userId
            ? 'Korisnik'
            : lastMessage?.sender?.name || 'Korisnik';
        const partnerAvatar =
          lastMessage?.sender_id === userId ? null : lastMessage?.sender?.avatar_url || null;
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

export async function getMessagesForConversation(
  userId: string,
  partnerId: string
): Promise<Message[]> {
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

export async function sendMessage(
  messageData: Omit<Message, 'id' | 'created_at'>
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;
    return data as Message;
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
