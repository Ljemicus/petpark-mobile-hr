import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../lib/colors';
import InlineErrorState from '../../components/shared/InlineErrorState';
import { supabase } from '../../lib/supabase';
import { Message } from '../../lib/chat/types';
import {
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getChatDbLastError,
  clearChatDbLastError,
} from '../../lib/chat/db';
import { useRealtimeMessages } from '../../lib/chat/realtime';
import { groupMessagesByDate, formatFullDate, formatMessageTime } from '../../lib/chat/utils';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar: boolean;
  partnerAvatar?: string | null;
}

function MessageBubble({ message, isMine, showAvatar, partnerAvatar }: MessageBubbleProps) {
  const hasImage = !!message.image_url;
  
  return (
    <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
      {!isMine && showAvatar && (
        <View style={styles.avatarContainerSmall}>
          {partnerAvatar ? (
            <Image source={{ uri: partnerAvatar }} style={styles.avatarSmall} />
          ) : (
            <View style={[styles.avatarSmall, styles.avatarFallbackSmall]}>
              <Text style={styles.avatarTextSmall}>?</Text>
            </View>
          )}
        </View>
      )}
      {!isMine && !showAvatar && <View style={styles.avatarSpacer} />}
      
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {hasImage && message.image_url && (
          <Image source={{ uri: message.image_url }} style={styles.messageImage} />
        )}
        {message.content && (
          <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
            {message.content}
          </Text>
        )}
        <View style={styles.bubbleFooter}>
          <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>
            {formatMessageTime(message.created_at)}
          </Text>
          {isMine && (
            <Ionicons 
              name={message.read ? "checkmark-done" : "checkmark"} 
              size={14} 
              color={message.read ? Colors.white : 'rgba(255,255,255,0.6)'} 
              style={styles.readReceipt}
            />
          )}
        </View>
      </View>
    </View>
  );
}

interface DateHeaderProps {
  date: string;
}

function DateHeader({ date }: DateHeaderProps) {
  return (
    <View style={styles.dateHeader}>
      <View style={styles.dateLine} />
      <Text style={styles.dateText}>{formatFullDate(date)}</Text>
      <View style={styles.dateLine} />
    </View>
  );
}

export default function ChatScreen() {
  const { userId: partnerId, name: partnerName, avatar: partnerAvatarParam } = useLocalSearchParams<{
    userId: string;
    name: string;
    avatar: string;
  }>();
  
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [partnerAvatar, setPartnerAvatar] = useState<string | null>(partnerAvatarParam || null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Dohvati trenutnog korisnika
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!userId || !partnerId) return;

    setLoading(true);
    try {
      clearChatDbLastError();
      setLoadError(null);
      const msgs = await getConversationMessages(userId, partnerId);
      setMessages(msgs);
      const chatError = getChatDbLastError();
      if (chatError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');

      // Označi kao pročitano
      await markMessagesAsRead(userId, partnerId);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } finally {
      setLoading(false);
    }
  }, [userId, partnerId]);

  // Dohvati povijest poruka
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Realtime subscription
  useRealtimeMessages(userId, useCallback((newMessage: Message) => {
    if (newMessage.sender_id === partnerId) {
      setMessages(prev => {
        // Provjeri da li već postoji
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      
      // Označi kao pročitano jer smo u chatu
      if (userId) {
        markMessagesAsRead(userId, partnerId);
      }
    }
  }, [partnerId, userId]));

  // Scroll to bottom kad se učitaju poruke
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [loading, messages.length]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !userId || !partnerId || sending) return;

    setSending(true);
    setInputText('');

    // Optimistički dodaj poruku
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      sender_id: userId,
      receiver_id: partnerId,
      booking_id: null,
      content: trimmed,
      image_url: null,
      read: false,
      created_at: new Date().toISOString(),
      sender: {
        id: userId,
        name: 'Vi',
        avatar_url: null,
        role: 'owner',
      },
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);

    // Pošalji na server
    const sentMessage = await sendMessage(userId, partnerId, trimmed);
    
    if (sentMessage) {
      // Zamijeni temp poruku s pravom
      setMessages(prev => 
        prev.map(m => m.id === tempId ? sentMessage : m)
      );
    } else {
      // Označi kao failed
      setMessages(prev => 
        prev.map(m => m.id === tempId ? { ...m, failed: true } as Message : m)
      );
    }
    
    setSending(false);
  };

  const groupedMessages = groupMessagesByDate(messages);

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isMine = item.sender_id === userId;
    const isFirstInGroup = index === 0 || 
      messages[index - 1]?.sender_id !== item.sender_id;
    
    return (
      <MessageBubble
        message={item}
        isMine={isMine}
        showAvatar={!isMine && isFirstInGroup}
        partnerAvatar={partnerAvatar}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          {partnerAvatar ? (
            <Image source={{ uri: partnerAvatar }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarFallback]}>
              <Text style={styles.headerAvatarText}>
                {partnerName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text style={styles.headerName} numberOfLines={1}>
            {partnerName || 'Korisnik'}
          </Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListHeaderComponent={() => (
            <>
              {loadError ? <InlineErrorState message={loadError} onRetry={loadMessages} /> : null}
              {groupedMessages.map((group, gi) => (
                <View key={gi}>
                  <DateHeader date={group.date} />
                  {group.messages.map((msg, mi) => {
                    const globalIndex = messages.findIndex(m => m.id === msg.id);
                    const isMine = msg.sender_id === userId;
                    const isFirstInGroup = mi === 0 || 
                      group.messages[mi - 1]?.sender_id !== msg.sender_id;
                    
                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isMine={isMine}
                        showAvatar={!isMine && isFirstInGroup}
                        partnerAvatar={partnerAvatar}
                      />
                    );
                  })}
                </View>
              ))}
            </>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>
                Započnite razgovor s {partnerName || 'korisnikom'}
              </Text>
            </View>
          )}
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="camera-outline" size={24} color={Colors.muted} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Napišite poruku..."
            placeholderTextColor={Colors.muted}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={Colors.white} 
            />
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
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerAvatarFallback: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    maxWidth: 200,
  },
  headerRight: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.muted,
    marginTop: 12,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dateText: {
    fontSize: 12,
    color: Colors.muted,
    fontWeight: '500',
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubbleRowTheirs: {
    justifyContent: 'flex-start',
  },
  avatarContainerSmall: {
    marginRight: 8,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarFallbackSmall: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  avatarSpacer: {
    width: 36,
  },
  bubble: {
    maxWidth: '72%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.text,
  },
  bubbleTextMine: {
    color: Colors.white,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  bubbleTime: {
    fontSize: 11,
    color: Colors.muted,
  },
  bubbleTimeMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  readReceipt: {
    marginLeft: 2,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.muted,
  },
});
