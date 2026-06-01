import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../lib/colors';
import type { ForumTopic } from '../lib/domain-types';

interface ForumTopicCardProps {
  topic: ForumTopic;
}

export default function ForumTopicCard({ topic }: ForumTopicCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/topic/${topic.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{topic.title}</Text>
        <Text style={styles.preview} numberOfLines={2}>{topic.preview}</Text>
        <View style={styles.meta}>
          <Text style={styles.author}>{topic.author}</Text>
          <View style={styles.metaRight}>
            <View style={styles.metaItem}>
              <Ionicons name="chatbubble-outline" size={14} color={Colors.muted} />
              <Text style={styles.metaText}>{topic.replyCount}</Text>
            </View>
            <Text style={styles.time}>{topic.lastActivity}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  content: {},
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  preview: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.muted,
  },
  time: {
    fontSize: 12,
    color: Colors.muted,
  },
});
