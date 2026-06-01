import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import type { ForumReply, ForumTopic } from '../../lib/domain-types';
import { getForumReplies, getForumTopicById } from '../../lib/db';

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reply, setReply] = useState('');
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      const [nextTopic, nextReplies] = await Promise.all([
        getForumTopicById(id),
        getForumReplies(id),
      ]);
      if (!mounted) return;
      setTopic(nextTopic);
      setReplies(nextReplies);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.mutedText}>Učitavam temu...</Text>
      </View>
    );
  }

  if (!topic) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Tema nije pronađena</Text>
        <Text style={styles.mutedText}>Možda je obrisana ili trenutno nije dostupna.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topicCard}>
          <Text style={styles.topicTitle}>{topic.title}</Text>
          <Text style={styles.topicPreview}>{topic.preview}</Text>
          <View style={styles.topicMeta}>
            <Text style={styles.topicAuthor}>{topic.author}</Text>
            <Text style={styles.topicTime}>{topic.lastActivity}</Text>
          </View>
        </View>

        <View style={styles.replies}>
          <Text style={styles.repliesTitle}>Odgovori ({topic.replyCount})</Text>
          {replies.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Još nema odgovora</Text>
              <Text style={styles.mutedText}>Budi prvi koji će pomoći u ovoj temi.</Text>
            </View>
          ) : (
            replies.map((r) => (
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
            ))
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Napiši odgovor..."
          placeholderTextColor={Colors.muted}
          value={reply}
          onChangeText={setReply}
          multiline
        />
        <TouchableOpacity style={[styles.sendButton, !reply.trim() && styles.sendButtonDisabled]} disabled={!reply.trim()}>
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
    backgroundColor: Colors.background,
    padding: 24,
  },
  mutedText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
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
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
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
    color: Colors.text,
    lineHeight: 20,
  },
  replyActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
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
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
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
  sendButtonDisabled: {
    opacity: 0.45,
  },
});
