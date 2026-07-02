import { supabase } from '../supabase';
import type { ChatUser, ConversationState, Message } from './types';
import {
  getConversationSummaries,
  getMessagesForConversation,
  sendMessage as sendOwnerMessage,
  markMessagesAsRead as markOwnerMessagesAsRead,
  getOwnerDashboardLastError,
} from '../owner-dashboard-db';
import { captureAppError } from '../sentry';

export type ChatDbErrorKind = 'network' | 'auth' | 'unknown';

type ChatDbLastError = {
  kind: ChatDbErrorKind;
  message: string;
  source: string;
  at: string;
};

let chatDbLastError: ChatDbLastError | null = null;

function classifyChatDbError(err: unknown): ChatDbErrorKind {
  const message = err instanceof Error ? err.message.toLowerCase() : String(err ?? '').toLowerCase();
  if (message.includes('jwt') || message.includes('auth') || message.includes('permission') || message.includes('rls')) return 'auth';
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) return 'network';
  return 'unknown';
}

function recordChatDbError(source: string, err: unknown) {
  const message = err instanceof Error ? err.message : 'Nepoznata greška';
  chatDbLastError = {
    kind: classifyChatDbError(err),
    message,
    source,
    at: new Date().toISOString(),
  };
  console.error(`[chat-db] ${source} failed:`, err);
  captureAppError(`chat-db.${source}`, err);
}

export function getChatDbLastError() {
  return chatDbLastError;
}

export function clearChatDbLastError() {
  chatDbLastError = null;
}

export async function getConversations(userId: string): Promise<ConversationState[]> {
  const summaries = await getConversationSummaries(userId);
  const ownerError = getOwnerDashboardLastError();
  if (ownerError) recordChatDbError('getConversations', new Error(ownerError.message));
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
  const messages = (await getMessagesForConversation(userId, partnerId)) as Message[];
  const ownerError = getOwnerDashboardLastError();
  if (ownerError) recordChatDbError('getConversationMessages', new Error(ownerError.message));
  return messages;
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  bookingId?: string | null,
  imageUrl?: string | null
): Promise<Message | null> {
  const message = (await sendOwnerMessage({
    sender_id: senderId,
    receiver_id: receiverId,
    booking_id: bookingId ?? null,
    content,
    image_url: imageUrl ?? null,
    read: false,
  })) as Message | null;
  const ownerError = getOwnerDashboardLastError();
  if (ownerError) recordChatDbError('sendMessage', new Error(ownerError.message));
  return message;
}

export async function markMessagesAsRead(userId: string, partnerId: string): Promise<void> {
  await markOwnerMessagesAsRead(userId, partnerId);
  const ownerError = getOwnerDashboardLastError();
  if (ownerError) recordChatDbError('markMessagesAsRead', new Error(ownerError.message));
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
    recordChatDbError('searchUsers', error);
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
    recordChatDbError('getUserById', error);
    return null;
  }
}
