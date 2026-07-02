// Trainer Dashboard - Glavni screen
// Prikazuje pregled: statistika, brze akcije, rezervacije, programi

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
import InlineErrorState from '../../../components/shared/InlineErrorState';
import { useAuth } from '../../../lib/auth-context';
import type { TrainerProfile, TrainerBooking, TrainingProgram } from '../../../lib/trainer-dashboard-types';
import { TRAINING_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS } from '../../../lib/trainer-dashboard-types';
import {
  getTrainerProfile,
  getTrainerBookings,
  getTrainerPrograms,
  getUnreadMessagesCount,
  getTrainerDashboardDbLastError,
  clearTrainerDashboardDbLastError,
} from '../../../lib/trainer-dashboard-db';

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
  booking: TrainerBooking;
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
        <View style={styles.bookingClientInfo}>
          {booking.client?.avatar_url ? (
            <Image source={{ uri: booking.client.avatar_url }} style={styles.clientAvatar} />
          ) : (
            <View style={styles.clientAvatarPlaceholder}>
              <Text style={styles.clientAvatarText}>
                {booking.client?.name?.charAt(0) || 'K'}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.clientName}>{booking.client?.name || 'Klijent'}</Text>
            <Text style={styles.programName}>
              {booking.program?.name || 'Trening'} · {booking.pet_name || 'Ljubimac'}
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
        <Text style={styles.bookingDate}>
          {formatDate(booking.date)} · {booking.start_time?.slice(0, 5)} — {booking.end_time?.slice(0, 5)}
        </Text>
        <Text style={styles.bookingPrice}>{booking.program?.price || 0}€</Text>
      </View>
    </TouchableOpacity>
  );
}

// Program card komponenta
function ProgramCard({
  program,
  onPress,
}: {
  program: TrainingProgram;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.programCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.programHeader}>
        <View style={[styles.programIcon, { backgroundColor: '#EEF2FF' }]}>
          <Ionicons name="school" size={20} color="#6366F1" />
        </View>
        <View style={styles.programInfo}>
          <Text style={styles.programCardName} numberOfLines={1}>{program.name}</Text>
          <Text style={styles.programType}>{TRAINING_TYPE_LABELS[program.type]}</Text>
        </View>
      </View>
      <View style={styles.programFooter}>
        <Text style={styles.programMeta}>{program.duration_weeks} tj. · {program.sessions} sesija</Text>
        <Text style={styles.programPrice}>{program.price}€</Text>
      </View>
    </TouchableOpacity>
  );
}

// Glavni komponent
export default function TrainerDashboardScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [bookings, setBookings] = useState<TrainerBooking[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;
  const userName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Treneru';

  // Dohvati podatke
  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      clearTrainerDashboardDbLastError();
      const [profileData, bookingsData, programsData, unreadData] = await Promise.all([
        getTrainerProfile(userId),
        getTrainerBookings(userId),
        getTrainerPrograms(userId),
        getUnreadMessagesCount(userId),
      ]);

      setProfile(profileData);
      setBookings(bookingsData);
      setPrograms(programsData);
      setUnreadCount(unreadData);
    } catch (err) {
      console.error('Error fetching trainer dashboard data:', err);
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
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  
  // Prikaži samo prvih 3 rezervacije i programa na dashboardu
  const displayedBookings = bookings.slice(0, 3);
  const displayedPrograms = programs.slice(0, 3);

  const dashboardError = getTrainerDashboardDbLastError();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {dashboardError ? <InlineErrorState message="Ne možemo učitati podatke. Povuci za osvježavanje." onRetry={fetchData} /> : null}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Bok, {userName}!</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={Colors.star} />
              <Text style={styles.ratingText}>
                {profile?.rating?.toFixed(1) || '0.0'} ({profile?.review_count || 0} recenzija)
              </Text>
              {profile?.certified && (
                <View style={styles.certifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.certifiedText}>Certificiran</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/messages')}
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

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="calendar"
            label="Na čekanju"
            value={pendingBookings.length}
            color="#F59E0B"
          />
          <StatCard
            icon="checkmark-circle"
            label="Potvrđeno"
            value={confirmedBookings.length}
            color="#10B981"
          />
          <StatCard
            icon="school"
            label="Programa"
            value={programs.length}
            color="#6366F1"
          />
          <StatCard
            icon="trophy"
            label="Završeno"
            value={completedBookings.length}
            color="#3B82F6"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brze akcije</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionButton
              icon="add-circle"
              label="Novi program"
              onPress={() => router.push('/dashboard/trainer/programs')}
              color="#6366F1"
            />
            <QuickActionButton
              icon="time"
              label="Raspored"
              onPress={() => router.push('/dashboard/trainer/availability')}
              color="#10B981"
            />
            <QuickActionButton
              icon="calendar"
              label="Rezervacije"
              onPress={() => router.push('/dashboard/trainer/bookings')}
              color="#F59E0B"
            />
            <QuickActionButton
              icon="cash"
              label="Zarada"
              onPress={() => router.push('/dashboard/trainer/earnings')}
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Pending Bookings Banner */}
        {pendingBookings.length > 0 && (
          <TouchableOpacity
            style={styles.pendingBanner}
            onPress={() => router.push('/dashboard/trainer/bookings')}
            activeOpacity={0.9}
          >
            <View style={styles.pendingBannerContent}>
              <View style={styles.pendingIconContainer}>
                <Ionicons name="time" size={24} color="#FFF" />
              </View>
              <View style={styles.pendingTextContainer}>
                <Text style={styles.pendingTitle}>
                  {pendingBookings.length} {pendingBookings.length === 1 ? 'nova rezervacija' : 'nove rezervacije'} na čekanju
                </Text>
                <Text style={styles.pendingSubtitle}>Dotaknite za pregled</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Bookings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rezervacije</Text>
            <TouchableOpacity onPress={() => router.push('/dashboard/trainer/bookings')}>
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
                Postavite svoj raspored dostupnosti kako bi klijenti mogli rezervirati termine
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/dashboard/trainer/availability')}
              >
                <Text style={styles.emptyStateButtonText}>Postavi raspored</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bookingsContainer}>
              {displayedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onPress={() => router.push(`/dashboard/trainer/bookings?id=${booking.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Programs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Programi treniranja</Text>
            <TouchableOpacity onPress={() => router.push('/dashboard/trainer/programs')}>
              <Text style={styles.seeAllText}>Pogledaj sve</Text>
            </TouchableOpacity>
          </View>

          {programs.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="school-outline" size={40} color={Colors.muted} />
              </View>
              <Text style={styles.emptyStateTitle}>Nemate programa</Text>
              <Text style={styles.emptyStateSubtitle}>
                Kreirajte programe treniranja koje nudite svojim klijentima
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/dashboard/trainer/programs')}
              >
                <Text style={styles.emptyStateButtonText}>Dodaj program</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.programsContainer}>
              {displayedPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onPress={() => router.push(`/dashboard/trainer/programs?edit=${program.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Messages Section Preview */}
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.messagesBanner}
            onPress={() => router.push('/messages')}
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
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  certifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  certifiedText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
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
  pendingBanner: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    padding: 16,
  },
  pendingBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  pendingTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pendingSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
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
  bookingClientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  clientAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  programName: {
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
  bookingDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  programsContainer: {
    gap: 12,
  },
  programCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programInfo: {
    marginLeft: 12,
    flex: 1,
  },
  programCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  programType: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  programMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  programPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6366F1',
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
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  emptyStateButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
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
