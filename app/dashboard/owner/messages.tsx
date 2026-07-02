// Owner Dashboard - Messages Screen
// Prikazuje razgovore i omogućuje slanje poruka

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import InlineErrorState from '../../../components/shared/InlineErrorState';
import type { ConversationSummary, Message } from '../../../lib/owner-dashboard-types';
import {
  getConversationSummaries,
  getMessagesForConversation,
  sendMessage,
  markMessagesAsRead,
  getOwnerDashboardLastError,
  clearOwnerDashboardLastError,
} from '../../../lib/owner-dashboard-db';

// Conversation List Item
function ConversationItem({
  conversation,
  onPress,
}: {
  conversation: ConversationSummary;
  onPress: () => void;
}) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'numeric' });
  };

  const lastMessageText = conversation.lastMessage?.content || 'Nema poruka';
  const isUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity
      style={[styles.conversationItem, isUnread && styles.conversationItemUnread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {conversation.partnerAvatar ? (
        <Image source={{ uri: conversation.partnerAvatar }} style={styles.conversationAvatar} />
      ) : (
        <View style={styles.conversationAvatarPlaceholder}>
          <Text style={styles.conversationAvatarText}>
            {conversation.partnerName.charAt(0)}
          </Text>
        </View>
      )}
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationName, isUnread && styles.conversationNameUnread]}>
            {conversation.partnerName}
          </Text>
          <Text style={styles.conversationTime}>
            {conversation.lastMessage ? formatTime(conversation.lastMessage.created_at) : ''}
          </Text>
        </View>
        
        <View style={styles.conversationFooter}>
          <Text
            style={[styles.conversationMessage, isUnread && styles.conversationMessageUnread]}
            numberOfLines={1}
          >
            {lastMessageText}
          </Text>
          {isUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Chat Message Bubble
function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('hr-HR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.messageBubble, isOwn ? styles.ownMessage : styles.otherMessage]}>
      {message.content && (
        <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
          {message.content}
        </Text>
      )}
      <Text style={[styles.messageTime, isOwn ? styles.ownMessageTime : styles.otherMessageTime]}>
        {formatTime(message.created_at)}
      </Text>
    </View>
  );
}

// Glavni komponent
export default function MessagesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, session } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const userId = session?.user?.id;
  const userName = user?.name || 'Korisnik';

  // Učitaj razgovore
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      clearOwnerDashboardLastError();
      setLoadError(null);
      const data = await getConversationSummaries(userId);
      setConversations(data);
      const ownerError = getOwnerDashboardLastError();
      if (ownerError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Provjeri parametre za otvaranje razgovora
  useEffect(() => {
    if (params.partnerId && conversations.length > 0) {
      const conversation = conversations.find((c) => c.partnerId === params.partnerId);
      if (conversation) {
        openConversation(conversation);
      }
    }
  }, [params, conversations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, [fetchConversations]);

  // Otvori razgovor
  const openConversation = async (conversation: ConversationSummary) => {
    setActiveConversation(conversation);
    if (userId) {
      clearOwnerDashboardLastError();
      setLoadError(null);
      const msgs = await getMessagesForConversation(userId, conversation.partnerId);
      setMessages(msgs);
      const ownerError = getOwnerDashboardLastError();
      if (ownerError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
      // Označi kao pročitano
      await markMessagesAsRead(userId, conversation.partnerId);
      // Osvježi listu razgovora
      fetchConversations();
    }
  };

  // Zatvori razgovor
  const closeConversation = () => {
    setActiveConversation(null);
    setMessages([]);
    fetchConversations();
  };

  // Pošalji poruku
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeConversation) return;

    const messageData = {
      sender_id: userId,
      receiver_id: activeConversation.partnerId,
      booking_id: (params.bookingId as string) || null,
      content: newMessage.trim(),
      image_url: null,
      read: false,
    };

    const sentMessage = await sendMessage(messageData);
    if (sentMessage) {
      setMessages([...messages, { ...sentMessage, sender: { id: userId, name: userName, avatar_url: null, role: 'owner' } }]);
      setNewMessage('');
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Prikaz liste razgovora
  if (!activeConversation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Poruke</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Conversations List */}
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.partnerId}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.conversationsList}
          ListEmptyComponent={
            loadError ? <InlineErrorState message={loadError} onRetry={fetchConversations} /> : <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="chatbubbles-outline" size={60} color={Colors.muted} />
              </View>
              <Text style={styles.emptyStateTitle}>Nema poruka</Text>
              <Text style={styles.emptyStateSubtitle}>
                Pošaljite prvu poruku sitteru nakon rezervacije
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              onPress={() => openConversation(item)}
            />
          )}
        />
      </SafeAreaView>
    );
  }

  // Prikaz aktivnog razgovora
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={closeConversation} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          
          {activeConversation.partnerAvatar ? (
            <Image source={{ uri: activeConversation.partnerAvatar }} style={styles.chatHeaderAvatar} />
          ) : (
            <View style={styles.chatHeaderAvatarPlaceholder}>
              <Text style={styles.chatHeaderAvatarText}>
                {activeConversation.partnerName.charAt(0)}
              </Text>
            </View>
          )}
          
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{activeConversation.partnerName}</Text>
            <Text style={styles.chatHeaderStatus}>Online</Text>
          </View>
        </View>

        {loadError ? <InlineErrorState message={loadError} onRetry={() => openConversation(activeConversation)} /> : null}

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.sender_id === userId}
            />
          )}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Napišite poruku..."
            placeholderTextColor={Colors.muted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  conversationsList: {
    padding: 12,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  conversationItemUnread: {
    backgroundColor: '#FFF7ED',
  },
  conversationAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  conversationAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationAvatarText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 14,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  conversationNameUnread: {
    fontWeight: '800',
  },
  conversationTime: {
    fontSize: 12,
    color: Colors.muted,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  conversationMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  conversationMessageUnread: {
    color: Colors.text,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
  },
  chatHeaderAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  chatHeaderAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  chatHeaderInfo: {
    marginLeft: 12,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: Colors.success,
  },
  messagesList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  ownMessage: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: Colors.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: Colors.muted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.muted,
  },
});
