import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';
import { Message } from './types';

export type MessageCallback = (message: Message) => void;

export function useRealtimeMessages(
  userId: string | null,
  onNewMessage: MessageCallback
) {
  const channelRef = useRef<any>(null);
  const callbackRef = useRef(onNewMessage);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    if (!userId) return;

    // Create realtime subscription
    const channel = supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          // Dohvati sender info
          const { data: sender } = await supabase
            .from('users')
            .select('id, name, avatar_url, role')
            .eq('id', newMsg.sender_id)
            .single();

          const messageWithSender: Message = {
            ...newMsg,
            sender: sender || undefined,
          };

          callbackRef.current(messageWithSender);
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

export function subscribeToMessages(
  userId: string,
  onNewMessage: MessageCallback
) {
  const channel = supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      async (payload) => {
        const newMsg = payload.new as Message;
        
        const { data: sender } = await supabase
          .from('users')
          .select('id, name, avatar_url, role')
          .eq('id', newMsg.sender_id)
          .single();

        onNewMessage({
          ...newMsg,
          sender: sender || undefined,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
