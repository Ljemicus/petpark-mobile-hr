import { useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Message } from './types';

export type MessageCallback = (message: Message) => void;

type RemoteMessage = {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  content: string | null;
  image_storage_path: string | null;
  created_at: string;
};

function toLegacyMessage(row: RemoteMessage, userId: string): Message {
  return {
    id: row.id,
    sender_id: row.sender_profile_id,
    receiver_id: row.sender_profile_id === userId ? '' : userId,
    booking_id: null,
    content: row.content,
    image_url: row.image_storage_path,
    read: true,
    created_at: row.created_at,
  };
}

async function userParticipates(conversationId: string, userId: string) {
  const { data } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('profile_id', userId)
    .maybeSingle();
  return Boolean(data);
}

export function useRealtimeMessages(userId: string | null, onNewMessage: MessageCallback) {
  const channelRef = useRef<any>(null);
  const callbackRef = useRef(onNewMessage);

  useEffect(() => {
    callbackRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const remote = payload.new as RemoteMessage;
          if (!(await userParticipates(remote.conversation_id, userId))) return;
          callbackRef.current(toLegacyMessage(remote, userId));
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId]);
}

export function subscribeToMessages(userId: string, onNewMessage: MessageCallback) {
  const channel = supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      async (payload) => {
        const remote = payload.new as RemoteMessage;
        if (!(await userParticipates(remote.conversation_id, userId))) return;
        onNewMessage(toLegacyMessage(remote, userId));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
