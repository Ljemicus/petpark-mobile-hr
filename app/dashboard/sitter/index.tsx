// Sitter Dashboard - Glavni screen
// Prikazuje pregled: statistika, brze akcije, rezervacije, zarada

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import InlineErrorState from '../../../components/shared/InlineErrorState';
import type { Booking, Review, SitterProfile } from '../../../lib/sitter-dashboard-types';
import { SERVICE_LABELS, STATUS_LABELS, STATUS_COLORS } from '../../../lib/sitter-dashboard-types';
import {
  getSitterProfile,
  getSitterBookings,
  getSitterReviews,
  getUnreadMessagesCount,
  getSitterEarnings,
  getSitterDashboardLastError,
  clearSitterDashboardLastError,
} from '../../../lib/sitter-dashboard-db';

const { width } = Dimensions.get('window');

// Stat card komponenta
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

// Quick action button
function QuickActionButton({
  icon,
  label,
  onPress,
  color = Colors.primary,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// Booking card komponenta
function BookingCard({
  booking,
  onPress,
}: {
  booking: Booking;
  onPress: () => void;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const statusStyle = STATUS_COLORS[booking.status];

  return (
    <TouchableOpacity style={styles.bookingCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingOwnerInfo}>
          {booking.owner?.avatar_url ? (
            <Image source={{ uri: booking.owner.avatar_url }} style={styles.ownerAvatar} />
          ) : (
            <View style={styles.ownerAvatarPlaceholder}>
              <Text style={styles.ownerAvatarText}>
                {booking.owner?.name?.charAt(0) || 'V'}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.ownerName}>{booking.owner?.name || 'Vlasnik'}</Text>
            <Text style={styles.serviceType}>
              {SERVICE_LABELS[booking.service_type]} · {booking.pet?.name}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {STATUS_LABELS[booking.status]}
          </Text>
        </View>
      </View>
      <View style={styles.bookingFooter}>
        <Text style={styles.bookingDates}>
          {formatDate(booking.start_date)} — {formatDate(booking.end_date)}
        </Text>
        <Text style={styles.bookingPrice}>{booking.total_price}€</Text>
      </View>
      {booking.message && (
        <View style={styles.messageContainer}>
          <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.messageText} numberOfLines={1}>
            "{booking.message}"
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Glavni komponent
export default function SitterDashboardScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<SitterProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const userId = session?.user?.id;
  const userName = user?.name?.split(' ')[0] || 'Sitter';

  // Provjeri je li sitter nov (nepotpuni profil)
  const isNewSitter = !profile || !profile.bio || profile.services.length === 0;

  // Dohvati podatke
  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      clearSitterDashboardLastError();
      setLoadError(null);
      const [profileData, bookingsData, reviewsData, earningsData, unreadData] = await Promise.all([
        getSitterProfile(userId),
        getSitterBookings(userId),
        getSitterReviews(userId),
        getSitterEarnings(userId),
        getUnreadMessagesCount(userId),
      ]);

      setProfile(profileData);
      setBookings(bookingsData);
      setReviews(reviewsData);
      setEarnings(earningsData);
      setUnreadCount(unreadData);
      const sitterError = getSitterDashboardLastError();
      if (sitterError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } catch (err) {
      console.error('Error fetching sitter dashboard data:', err);
      setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Izračunaj statistiku
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'accepted' && new Date(b.start_date) >= new Date()
  );
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  // Prosječna ocjena
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  // Prikaži samo prvih 3 rezervacije na dashboardu
  const displayedBookings = bookings.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bok, {userName}!</Text>
            <Text style={styles.subtitle}>
              Upravljaj rezervacijama, dostupnošću i profilom
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/dashboard/sitter/messages')}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {loadError ? <InlineErrorState message={loadError} onRetry={fetchData} /> : null}

        {/* New Sitter Banner */}
        {isNewSitter && (
          <View style={styles.newSitterBanner}>
            <View style={styles.newSitterIcon}>
              <Ionicons name="star" size={24} color="#FFF" />
            </View>
            <View style={styles.newSitterContent}>
              <Text style={styles.newSitterTitle}>Dovršite svoj profil</Text>
              <Text style={styles.newSitterSubtitle}>
                Dodajte opis, usluge i cijene da biste privukli više klijenata
              </Text>
            </View>
            <TouchableOpacity style={styles.newSitterButton}>
              <Text style={styles.newSitterButtonText}>Uredi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="star"
            label="Ocjena"
            value={avgRating}
            color="#F59E0B"
          />
          <StatCard
            icon="time-outline"
            label="Na čekanju"
            value={pendingBookings.length}
            color="#F97316"
          />
          <StatCard
            icon="calendar-outline"
            label="Nadolazeće"
            value={upcomingBookings.length}
            color="#3B82F6"
          />
          <StatCard
            icon="cash-outline"
            label="Zarada (mjesec)"
            value={`${earnings.thisMonthEarnings}€`}
            color="#10B981"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brze akcije</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionButton
              icon="calendar"
              label="Dostupnost"
              onPress={() => router.push('/dashboard/sitter/availability')}
              color="#F97316"
            />
            <QuickActionButton
              icon="list"
              label="Rezervacije"
              onPress={() => router.push('/dashboard/sitter/bookings')}
              color="#3B82F6"
            />
            <QuickActionButton
              icon="cash"
              label="Zarada"
              onPress={() => router.push('/dashboard/sitter/earnings')}
              color="#10B981"
            />
            <QuickActionButton
              icon="chatbubble"
              label="Poruke"
              onPress={() => router.push('/dashboard/sitter/messages')}
              color="#8B5CF6"
            />
            <QuickActionButton
              icon="walk"
              label="Šetnje"
              onPress={() => router.push('/walk')}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Pending Bookings Section */}
        {pendingBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Novi zahtjevi ({pendingBookings.length})
              </Text>
            </View>
            <View style={styles.bookingsContainer}>
              {pendingBookings.slice(0, 2).map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onPress={() => router.push(`/dashboard/sitter/bookings?id=${booking.id}`)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Recent Bookings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nedavne rezervacije</Text>
            <TouchableOpacity onPress={() => router.push('/dashboard/sitter/bookings')}>
              <Text style={styles.seeAllText}>Pogledaj sve</Text>
            </TouchableOpacity>
          </View>

          {bookings.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="calendar-outline" size={40} color={Colors.muted} />
              </View>
              <Text style={styles.emptyStateTitle}>Nemate rezervacija</Text>
              <Text style={styles.emptyStateSubtitle}>
                Kada vlasnici rezerviraju vaše usluge, vidjet ćete ih ovdje
              </Text>
            </View>
          ) : (
            <View style={styles.bookingsContainer}>
              {displayedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onPress={() => router.push(`/dashboard/sitter/bookings?id=${booking.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Earnings Preview Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Zarada</Text>
            <TouchableOpacity onPress={() => router.push('/dashboard/sitter/earnings')}>
              <Text style={styles.seeAllText}>Detalji</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.earningsCard}>
            <View style={styles.earningsRow}>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsValue}>{earnings.thisMonthEarnings}€</Text>
                <Text style={styles.earningsLabel}>Ovaj mjesec</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsValue}>{earnings.totalEarnings}€</Text>
                <Text style={styles.earningsLabel}>Ukupno</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsValue}>{completedBookings.length}</Text>
                <Text style={styles.earningsLabel}>Završenih</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reviews Preview */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recenzije</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reviewsScroll}
            >
              {reviews.slice(0, 3).map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatarPlaceholder}>
                      <Text style={styles.reviewAvatarText}>
                        {review.reviewer?.name?.charAt(0) || 'K'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.reviewName}>{review.reviewer?.name || 'Korisnik'}</Text>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= review.rating ? 'star' : 'star-outline'}
                            size={12}
                            color="#FBBF24"
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment} numberOfLines={2}>
                      "{review.comment}"
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Messages Section Preview */}
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.messagesBanner}
            onPress={() => router.push('/dashboard/sitter/messages')}
            activeOpacity={0.9}
          >
            <View style={styles.messagesBannerContent}>
              <View style={styles.messagesIconContainer}>
                <Ionicons name="chatbubble" size={24} color="#FFF" />
              </View>
              <View style={styles.messagesTextContainer}>
                <Text style={styles.messagesTitle}>Imate {unreadCount} nepročitanih poruka</Text>
                <Text style={styles.messagesSubtitle}>Dotaknite za pregled</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Bottom padding */}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  newSitterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  newSitterIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newSitterContent: {
    flex: 1,
    marginLeft: 14,
  },
  newSitterTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  newSitterSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  newSitterButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newSitterButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    width: (width - 40) / 2,
    borderLeftWidth: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    marginLeft: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    alignItems: 'center',
    width: (width - 56) / 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  bookingsContainer: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingOwnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  ownerAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  serviceType: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookingDates: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  messageText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.card,
    borderRadius: 16,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 24,
  },
  earningsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  earningsItem: {
    alignItems: 'center',
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  earningsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  earningsDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  reviewsScroll: {
    paddingRight: 16,
    gap: 12,
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    width: 250,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 10,
    fontStyle: 'italic',
  },
  messagesBanner: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
  },
  messagesBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  messagesTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  messagesSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
});
