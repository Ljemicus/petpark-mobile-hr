import { supabase } from '../supabase';
import type { ChatUser, ConversationState, Message } from './types';
import {
  getConversationSummaries,
  getMessagesForConversation,
  sendMessage as sendOwnerMessage,
  markMessagesAsRead as markOwnerMessagesAsRead,
} from '../owner-dashboard-db';

export async function getConversations(userId: string): Promise<ConversationState[]> {
  const summaries = await getConversationSummaries(userId);
  return summaries.map((summary) => ({
    partnerId: summary.partnerId,
    partnerName: summary.partnerName,
    partnerAvatar: summary.partnerAvatar,
    messages: [],
    lastMessage: summary.lastMessage as Message | null,
    unreadCount: summary.unreadCount,
  }));
}

export async function getConversationMessages(
  userId: string,
  partnerId: string
): Promise<Message[]> {
  return (await getMessagesForConversation(userId, partnerId)) as Message[];
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  bookingId?: string | null,
  imageUrl?: string | null
): Promise<Message | null> {
  return (await sendOwnerMessage({
    sender_id: senderId,
    receiver_id: receiverId,
    booking_id: bookingId ?? null,
    content,
    image_url: imageUrl ?? null,
    read: false,
  })) as Message | null;
}

export async function markMessagesAsRead(userId: string, partnerId: string): Promise<void> {
  await markOwnerMessagesAsRead(userId, partnerId);
}

export async function searchUsers(query: string, currentUserId: string): Promise<ChatUser[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .neq('id', currentUserId)
      .ilike('display_name', `%${query}%`)
      .limit(20);

    if (error) throw error;
    return (data || []).map((profile) => ({
      id: profile.id,
      name: profile.display_name || 'Korisnik',
      avatar_url: profile.avatar_url,
      role: 'owner',
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

export async function getUserById(userId: string): Promise<ChatUser | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      name: data.display_name || 'Korisnik',
      avatar_url: data.avatar_url,
      role: 'owner',
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}
