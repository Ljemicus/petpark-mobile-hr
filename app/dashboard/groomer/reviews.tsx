// Groomer Reviews Screen
// Prikaz recenzija klijenata

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import InlineErrorState from '../../../components/shared/InlineErrorState';
import { useAuth } from '../../../lib/auth-context';
import type { GroomerReview, GroomerProfile } from '../../../lib/groomer-dashboard-types';
import {
  getGroomerProfile,
  getGroomerReviews,
  getGroomerDashboardDbLastError,
  clearGroomerDashboardDbLastError,
} from '../../../lib/groomer-dashboard-db';

export default function GroomerReviewsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [profile, setProfile] = useState<GroomerProfile | null>(null);
  const [reviews, setReviews] = useState<GroomerReview[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const userId = session?.user?.id;

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      clearGroomerDashboardDbLastError();
      const profileData = await getGroomerProfile(userId);
      if (profileData) {
        setProfile(profileData);
        const reviewsData = await getGroomerReviews(profileData.id);
        setReviews(reviewsData);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Izračunaj statistiku ocjena
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const dashboardError = getGroomerDashboardDbLastError();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Recenzije</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {dashboardError ? <InlineErrorState message="Ne možemo učitati podatke. Povuci za osvježavanje." onRetry={fetchData} /> : null}

        {/* Rating Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.ratingContainer}>
            <Text style={styles.avgRating}>{avgRating}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(parseFloat(avgRating)) ? 'star' : 'star-outline'}
                  size={24}
                  color="#FBBF24"
                />
              ))}
            </View>
            <Text style={styles.totalReviews}>
              {reviews.length} {reviews.length === 1 ? 'recenzija' : 'recenzija'}
            </Text>
          </View>

          {/* Rating Distribution */}
          {reviews.length > 0 && (
            <View style={styles.distribution}>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingCounts[rating] || 0;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <View key={rating} style={styles.distributionRow}>
                    <Text style={styles.distributionNumber}>{rating}</Text>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <View style={styles.distributionBar}>
                      <View
                        style={[styles.distributionFill, { width: `${percentage}%` }]}
                      />
                    </View>
                    <Text style={styles.distributionCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Reviews List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sve recenzije</Text>
          {reviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={64} color={Colors.muted} />
              <Text style={styles.emptyTitle}>Još nema recenzija</Text>
              <Text style={styles.emptySubtitle}>
                Nakon što klijenti ocijene vaše usluge, vidjet ćete recenzije ovdje
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerAvatarText}>
                        {review.reviewer?.name?.charAt(0) || 'K'}
                      </Text>
                    </View>
                    <View style={styles.reviewMeta}>
                      <Text style={styles.reviewerName}>
                        {review.reviewer?.name || 'Klijent'}
                      </Text>
                      <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={14} color="#FBBF24" />
                      <Text style={styles.ratingText}>{review.rating}.0</Text>
                    </View>
                  </View>
                  {review.comment && (
                    <View style={styles.reviewContent}>
                      <Text style={styles.reviewComment}>"{review.comment}"</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avgRating: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.text,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  distribution: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distributionNumber: {
    width: 20,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    backgroundColor: '#FBBF24',
    borderRadius: 4,
  },
  distributionCount: {
    width: 30,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  reviewMeta: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  reviewContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
