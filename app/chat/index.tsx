import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../lib/colors';
import InlineErrorState from '../../components/shared/InlineErrorState';
import { supabase } from '../../lib/supabase';
import { ConversationState, Message } from '../../lib/chat/types';
import {
  getConversations,
  markMessagesAsRead,
  getChatDbLastError,
  clearChatDbLastError,
} from '../../lib/chat/db';
import { useRealtimeMessages } from '../../lib/chat/realtime';
import { upsertConversation, formatMessageTime } from '../../lib/chat/utils';

interface ConversationItemProps {
  conversation: ConversationState;
  onPress: () => void;
}

function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const avatarUrl = conversation.partnerAvatar;
  const initial = conversation.partnerName.charAt(0).toUpperCase();
  const hasUnread = conversation.unreadCount > 0;
  
  return (
    <TouchableOpacity style={styles.conversationItem} onPress={onPress}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        {hasUnread && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.partnerName, hasUnread && styles.partnerNameUnread]}>
            {conversation.partnerName}
          </Text>
          {conversation.lastMessage && (
            <Text style={styles.timeText}>
              {formatMessageTime(conversation.lastMessage.created_at)}
            </Text>
          )}
        </View>
        
        <View style={styles.messagePreview}>
          <Text 
            style={[styles.messageText, hasUnread && styles.messageTextUnread]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {conversation.lastMessage?.content || 'Nova poruka'}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatListScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationState[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Dohvati trenutnog korisnika
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, []);

  // Dohvati razgovore
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    
    try {
      clearChatDbLastError();
      setLoadError(null);
      const convs = await getConversations(userId);
      setConversations(convs);
      const chatError = getChatDbLastError();
      if (chatError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId, loadConversations]);

  // Realtime subscription za nove poruke
  useRealtimeMessages(userId, useCallback((newMessage: Message) => {
    setConversations(prev => 
      upsertConversation(prev, newMessage.sender_id, existing => ({
        partnerId: newMessage.sender_id,
        partnerName: newMessage.sender?.name || existing?.partnerName || 'Korisnik',
        partnerAvatar: newMessage.sender?.avatar_url || existing?.partnerAvatar || null,
        messages: existing?.messages ? [...existing.messages, newMessage] : [newMessage],
        lastMessage: newMessage,
        unreadCount: (existing?.unreadCount || 0) + 1,
      }))
    );
  }, []));

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleConversationPress = async (conversation: ConversationState) => {
    // Označi kao pročitano
    if (userId && conversation.unreadCount > 0) {
      await markMessagesAsRead(userId, conversation.partnerId);
      setConversations(prev => 
        prev.map(c => 
          c.partnerId === conversation.partnerId 
            ? { ...c, unreadCount: 0 } 
            : c
        )
      );
    }
    
    // Navigiraj na chat
    router.push(`/chat/${conversation.partnerId}?name=${encodeURIComponent(conversation.partnerName)}&avatar=${encodeURIComponent(conversation.partnerAvatar || '')}`);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Poruke</Text>
          {totalUnread > 0 && (
            <Text style={styles.headerSubtitle}>
              {totalUnread} nepročitanih
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.newChatButton}
          onPress={() => router.push('/chat/new-chat')}
        >
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loadError ? <InlineErrorState message={loadError} onRetry={loadConversations} /> : null}

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={Colors.muted} />
          <Text style={styles.emptyTitle}>Nemate poruka</Text>
          <Text style={styles.emptySubtitle}>
            Započnite razgovor s sitterom ili vlasnikom
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push('/chat/new-chat')}
          >
            <Text style={styles.emptyButtonText}>Nova poruka</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.partnerId}
          renderItem={({ item }) => (
            <ConversationItem 
              conversation={item} 
              onPress={() => handleConversationPress(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.white,
  },
  unreadDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  partnerNameUnread: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: Colors.muted,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  messageTextUnread: {
    color: Colors.text,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 84,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
