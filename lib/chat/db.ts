import { supabase } from '../supabase';
import { Message, ConversationState } from './types';

export async function getConversations(userId: string): Promise<ConversationState[]> {
  try {
    // Dohvati sve poruke korisnika
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, name, avatar_url, role),
        receiver:users!receiver_id(id, name, avatar_url, role)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error || !messages) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Grupiraj po partneru
    const grouped = new Map<string, Message[]>();
    
    for (const message of messages as Message[]) {
      const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      if (!grouped.has(partnerId)) {
        grouped.set(partnerId, []);
      }
      grouped.get(partnerId)!.push(message);
    }

    // Kreiraj ConversationState za svakog partnera
    return Array.from(grouped.entries())
      .map(([partnerId, msgs]) => {
        const sorted = msgs.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const lastMessage = sorted[sorted.length - 1];
        const partner = lastMessage?.sender_id === userId 
          ? lastMessage?.receiver 
          : lastMessage?.sender;

        return {
          partnerId,
          partnerName: partner?.name || 'Korisnik',
          partnerAvatar: partner?.avatar_url || null,
          messages: sorted,
          lastMessage,
          unreadCount: sorted.filter(m => !m.read && m.receiver_id === userId).length,
        };
      })
      .sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
}

export async function getConversationMessages(
  userId: string, 
  partnerId: string
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, name, avatar_url, role)
      `)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching conversation:', error);
      return [];
    }

    return (data as Message[]) || [];
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  bookingId?: string | null
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
        booking_id: bookingId || null,
        read: false,
      })
      .select(`
        *,
        sender:users!sender_id(id, name, avatar_url, role)
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data as Message;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
}

export async function markMessagesAsRead(
  userId: string,
  partnerId: string
): Promise<void> {
  try {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', userId)
      .eq('read', false);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}

export async function searchUsers(query: string, currentUserId: string): Promise<{
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
}[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, role')
      .ilike('name', `%${query}%`)
      .neq('id', currentUserId)
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return [];
  }
}

export async function getUserById(userId: string): Promise<{
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
}
