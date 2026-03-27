import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { forumTopics } from '../../lib/mock-data';

const demoReplies = [
  { id: '1', author: 'Dr. Vera M.', text: 'Preporučujem posjet veterinaru ako traje dulje od 24 sata. Može biti mnogo uzroka.', time: 'Prije 1 sat', isExpert: true },
  { id: '2', author: 'Petar K.', text: 'Moj pas je imao isto, pokazalo se da je bio problem sa zubima.', time: 'Prije 2 sata', isExpert: false },
  { id: '3', author: 'Ana T.', text: 'Probajte zagrijati hranu ili dodati malo pileće juhe. Ponekad promjena temperature pomaže.', time: 'Prije 3 sata', isExpert: false },
  { id: '4', author: 'Marina S.', text: 'Je li cijepljen nedavno? Ponekad nakon cijepljenja mogu biti neraspoloženi dan-dva.', time: 'Prije 4 sata', isExpert: false },
];

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reply, setReply] = useState('');
  const topic = forumTopics.find((t) => t.id === id);

  if (!topic) {
    return (
      <View style={styles.center}>
        <Text>Tema nije pronađena</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Topic */}
        <View style={styles.topicCard}>
          <Text style={styles.topicTitle}>{topic.title}</Text>
          <Text style={styles.topicPreview}>{topic.preview}</Text>
          <View style={styles.topicMeta}>
            <Text style={styles.topicAuthor}>{topic.author}</Text>
            <Text style={styles.topicTime}>{topic.lastActivity}</Text>
          </View>
        </View>

        {/* Replies */}
        <View style={styles.replies}>
          <Text style={styles.repliesTitle}>Odgovori ({topic.replyCount})</Text>
          {demoReplies.map((r) => (
            <View key={r.id} style={styles.replyCard}>
              <View style={styles.replyHeader}>
                <View style={styles.replyAuthorRow}>
                  <Text style={styles.replyAuthor}>{r.author}</Text>
                  {r.isExpert && (
                    <View style={styles.expertBadge}>
                      <Text style={styles.expertText}>Stručnjak</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.replyTime}>{r.time}</Text>
              </View>
              <Text style={styles.replyText}>{r.text}</Text>
              <View style={styles.replyActions}>
                <TouchableOpacity style={styles.replyAction}>
                  <Ionicons name="heart-outline" size={16} color={Colors.muted} />
                  <Text style={styles.replyActionText}>Sviđa mi se</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.replyAction}>
                  <Ionicons name="chatbubble-outline" size={16} color={Colors.muted} />
                  <Text style={styles.replyActionText}>Odgovori</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Reply input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Napiši odgovor..."
          placeholderTextColor={Colors.muted}
          value={reply}
          onChangeText={setReply}
          multiline
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  topicCard: {
    padding: 20,
    backgroundColor: Colors.card,
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  topicPreview: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  topicMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topicAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  topicTime: {
    fontSize: 13,
    color: Colors.muted,
  },
  replies: {
    padding: 20,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  replyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  expertBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  expertText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  replyTime: {
    fontSize: 12,
    color: Colors.muted,
  },
  replyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  replyActions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  replyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyActionText: {
    fontSize: 12,
    color: Colors.muted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 30,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: Colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
