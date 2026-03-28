import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

const autoReplies = [
  'Bok! Kako vam mogu pomoći? 🐾',
  'Naravno, rado ću vam pomoći s vašim ljubimcem!',
  'Preporučujem da posjetite našu stranicu s itterima za više informacija.',
  'Vaš ljubimac je u sigurnim rukama! 😊',
  'Imate li još pitanja? Tu sam za vas!',
  'Hvala na poruci! Javim vam se uskoro.',
  'Super! Provjerite i naš Shop za najbolje proizvode.',
  'Drago mi je što koristite Šapicu! 🧡',
];

function getTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Dobrodošli u PetPark chat! 🐾\nKako vam možemo pomoći?', sender: 'bot', timestamp: getTime() },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const replyIndex = useRef(0);

  // Typing indicator animation
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const animateDots = useCallback(() => {
    const createDotAnimation = (dot: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          ])
        ),
      ]);

    Animated.parallel([
      createDotAnimation(dot1, 0),
      createDotAnimation(dot2, 150),
      createDotAnimation(dot3, 300),
    ]).start();
  }, [dot1, dot2, dot3]);

  useEffect(() => {
    if (isTyping) {
      animateDots();
    } else {
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    }
  }, [isTyping, animateDots, dot1, dot2, dot3]);

  const sendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: getTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Show typing indicator, then auto-reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: autoReplies[replyIndex.current % autoReplies.length],
        sender: 'bot',
        timestamp: getTime(),
      };
      replyIndex.current++;
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowBot]}>
        {!isUser && <Text style={styles.botAvatar}>🐾</Text>}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.text}</Text>
          <Text style={[styles.timestamp, isUser && styles.timestampUser]}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isTyping ? (
            <View style={[styles.bubbleRow, styles.bubbleRowBot]}>
              <Text style={styles.botAvatar}>🐾</Text>
              <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
                <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
                <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
              </View>
            </View>
          ) : null
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Napišite poruku..."
          placeholderTextColor={Colors.muted}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowBot: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    fontSize: 24,
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
    color: Colors.text,
  },
  bubbleTextUser: {
    color: Colors.white,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.muted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.muted,
  },
});
