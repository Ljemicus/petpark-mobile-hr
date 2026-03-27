import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../lib/colors';
import { forumCategories, forumTopics } from '../../lib/mock-data';
import ForumTopicCard from '../../components/ForumTopicCard';

export default function ForumScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kategorije</Text>
        <View style={styles.categoriesGrid}>
          {forumCategories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryCount}>{cat.topicCount} tema</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Popular Topics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popularne teme</Text>
        {forumTopics.map((topic) => (
          <ForumTopicCard key={topic.id} topic={topic} />
        ))}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
});
