// Sitter Dashboard - Messages Screen
// Prikazuje listu razgovora i chat sučelje

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import InlineErrorState from '../../../components/shared/InlineErrorState';
import type { Message, ConversationSummary } from '../../../lib/sitter-dashboard-types';
import {
  getConversationSummaries,
  getMessagesForConversation,
  sendMessage,
  markMessagesAsRead,
  getSitterDashboardLastError,
  clearSitterDashboardLastError,
} from '../../../lib/sitter-dashboard-db';

// Conversation list item
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
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Jučer';
    } else if (days < 7) {
      return date.toLocaleDateString('hr-HR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <TouchableOpacity style={styles.conversationItem} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatarContainer}>
        {conversation.partnerAvatar ? (
          <Image source={{ uri: conversation.partnerAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {conversation.partnerName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {conversation.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.partnerName}>{conversation.partnerName}</Text>
          {conversation.lastMessage && (
            <Text style={styles.timeText}>
              {formatTime(conversation.lastMessage.created_at)}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.lastMessage,
            conversation.unreadCount > 0 && styles.unreadMessage,
          ]}
          numberOfLines={1}
        >
          {conversation.lastMessage?.content || 'Nema poruka'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Chat message bubble
function ChatMessage({
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
    <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        {message.image_url && (
          <Image source={{ uri: message.image_url }} style={styles.messageImage} />
        )}
        {message.content && (
          <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
            {message.content}
          </Text>
        )}
      </View>
      <Text style={styles.messageTime}>{formatTime(message.created_at)}</Text>
    </View>
  );
}

// Glavni komponent
export default function SitterMessagesScreen() {
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

  // Dohvati razgovore
  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    try {
      clearSitterDashboardLastError();
      setLoadError(null);
      const data = await getConversationSummaries(userId);
      setConversations(data);
      const sitterError = getSitterDashboardLastError();
      if (sitterError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Dohvati poruke za aktivni razgovor
  const fetchMessages = useCallback(async () => {
    if (!userId || !activeConversation) return;

    try {
      clearSitterDashboardLastError();
      setLoadError(null);
      const data = await getMessagesForConversation(userId, activeConversation.partnerId);
      setMessages(data);
      const sitterError = getSitterDashboardLastError();
      if (sitterError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
      // Označi kao pročitano
      await markMessagesAsRead(userId, activeConversation.partnerId);
      // Osvježi listu razgovora
      fetchConversations();
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [userId, activeConversation, fetchConversations]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Osvježi poruke kada se promijeni aktivni razgovor
  useEffect(() => {
    if (activeConversation) {
      fetchMessages();
    }
  }, [activeConversation, fetchMessages]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, [fetchConversations]);

  // Pošalji poruku
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeConversation) return;

    const messageData = {
      sender_id: userId,
      receiver_id: activeConversation.partnerId,
      booking_id: null,
      content: newMessage.trim(),
      image_url: null,
      read: false,
    };

    const sent = await sendMessage(messageData);
    if (sent) {
      setNewMessage('');
      fetchMessages();
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Ako je aktivan razgovor, prikaži chat
  if (activeConversation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setActiveConversation(null)}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            {activeConversation.partnerAvatar ? (
              <Image
                source={{ uri: activeConversation.partnerAvatar }}
                style={styles.chatHeaderAvatar}
              />
            ) : (
              <View style={styles.chatHeaderAvatarPlaceholder}>
                <Text style={styles.chatHeaderAvatarText}>
                  {activeConversation.partnerName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.chatHeaderName}>{activeConversation.partnerName}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {loadError ? <InlineErrorState message={loadError} onRetry={fetchMessages} /> : null}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatMessage message={item} isOwn={item.sender_id === userId} />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Napišite poruku..."
              value={newMessage}
              onChangeText={setNewMessage}
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

  // Lista razgovora
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Poruke</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.partnerId}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={() => setActiveConversation(item)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.conversationsList}
        ListEmptyComponent={
          loadError ? <InlineErrorState message={loadError} onRetry={fetchConversations} /> : <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="chatbubble-outline" size={60} color={Colors.muted} />
            </View>
            <Text style={styles.emptyStateTitle}>Nema poruka</Text>
            <Text style={styles.emptyStateSubtitle}>
              Kada vlasnici pošalju poruku, vidjet ćete je ovdje
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  conversationsList: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 11,
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
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  timeText: {
    fontSize: 12,
    color: Colors.muted,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  unreadMessage: {
    fontWeight: '600',
    color: Colors.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
  // Chat styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  chatHeaderAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  chatHeaderName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  headerSpacer: {
    width: 40,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFF',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 40,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
