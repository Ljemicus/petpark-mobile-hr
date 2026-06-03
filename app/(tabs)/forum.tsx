import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors } from '../../lib/colors';
import type { ForumCategory, ForumTopic } from '../../lib/domain-types';
import { getForumCategories, getForumTopics } from '../../lib/db';
import ForumTopicCard from '../../components/ForumTopicCard';

export default function ForumScreen() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [nextCategories, nextTopics] = await Promise.all([
        getForumCategories(),
        getForumTopics(),
      ]);
      setCategories(nextCategories);
      setTopics(nextTopics);
    } catch {
      setError('Forum trenutno nije dostupan. Pokušajte ponovno.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.helperText}>Učitavam forum...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      {error && (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Greška</Text>
          <Text style={styles.noticeText}>{error}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kategorije</Text>
        {categories.length === 0 ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Forum uskoro</Text>
            <Text style={styles.noticeText}>PetPark zajednica je spremna u aplikaciji, ali forum tablice čekaju odobrenu remote migraciju.</Text>
          </View>
        ) : (
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryCount}>{cat.topicCount} tema</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popularne teme</Text>
        {topics.length === 0 ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Teme uskoro</Text>
            <Text style={styles.noticeText}>Ne prikazujemo mock podatke; teme se uključuju čim se odobri forum schema.</Text>
          </View>
        ) : (
          topics.map((topic) => <ForumTopicCard key={topic.id} topic={topic} />)
        )}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: 10,
  },
  helperText: {
    color: Colors.textSecondary,
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
  noticeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  noticeText: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
