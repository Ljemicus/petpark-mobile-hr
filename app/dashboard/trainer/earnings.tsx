// Trainer Earnings Screen
// Prikazuje zaradu, statistiku i povijest

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
import type { TrainerBooking, MonthlyEarnings } from '../../../lib/trainer-dashboard-types';
import {
  getTrainerEarnings,
  getTrainerBookings,
} from '../../../lib/trainer-dashboard-db';

const { width } = Dimensions.get('window');

// Simple bar chart component
function EarningsChart({ data }: { data: MonthlyEarnings[] }) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          const heightPercent = item.amount > 0 ? (item.amount / maxAmount) * 100 : 5;
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { height: `${heightPercent}%` },
                    item.amount === 0 && styles.barEmpty,
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.month}</Text>
              {item.amount > 0 && (
                <Text style={styles.barValue}>{item.amount}€</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Stat card component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: `${color}15` }]}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color="#FFF" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

// Completed booking card
function CompletedBookingCard({ booking }: { booking: TrainerBooking }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        {booking.client?.avatar_url ? (
          <Image source={{ uri: booking.client.avatar_url }} style={styles.clientAvatar} />
        ) : (
          <View style={styles.clientAvatarPlaceholder}>
            <Text style={styles.clientAvatarText}>
              {booking.client?.name?.charAt(0) || 'K'}
            </Text>
          </View>
        )}
        <View style={styles.bookingInfo}>
          <Text style={styles.clientName}>{booking.client?.name || 'Klijent'}</Text>
          <Text style={styles.programName}>
            {booking.program?.name || 'Trening'} · {booking.pet_name || 'Ljubimac'}
          </Text>
        </View>
        <View style={styles.earningsBadge}>
          <Text style={styles.earningsAmount}>+{booking.program?.price || 0}€</Text>
        </View>
      </View>
      <View style={styles.bookingFooter}>
        <Text style={styles.bookingDate}>{formatDate(booking.date)}</Text>
        <Text style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={12} color="#10B981" /> Završeno
        </Text>
      </View>
    </View>
  );
}

export default function TrainerEarningsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings[]>([]);
  const [completedBookings, setCompletedBookings] = useState<TrainerBooking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  // Dohvati podatke
  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      const earningsData = await getTrainerEarnings(userId);
      setTotalEarnings(earningsData.totalEarnings);
      setThisMonthEarnings(earningsData.thisMonthEarnings);
      setMonthlyEarnings(earningsData.monthlyEarnings);
      setCompletedBookings(earningsData.completedBookings);
    } catch (err) {
      console.error('Error fetching earnings:', err);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zarada</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Earnings Card */}
        <View style={styles.totalEarningsCard}>
          <Text style={styles.totalEarningsLabel}>Ukupna zarada</Text>
          <Text style={styles.totalEarningsValue}>{totalEarnings}€</Text>
          <View style={styles.thisMonthBadge}>
            <Ionicons name="trending-up" size={16} color="#10B981" />
            <Text style={styles.thisMonthText}>
              Ovaj mjesec: {thisMonthEarnings}€
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="checkmark-done"
            label="Završenih treninga"
            value={String(completedBookings.length)}
            color="#10B981"
          />
          <StatCard
            icon="calendar"
            label="Prosječno/mjesečno"
            value={`${Math.round(totalEarnings / 6)}€`}
            color="#3B82F6"
          />
        </View>

        {/* Earnings Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zarada po mjesecima</Text>
          {monthlyEarnings.length > 0 && (
            <EarningsChart data={monthlyEarnings} />
          )}
        </View>

        {/* Recent Earnings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nedavna završena treninga</Text>
            <Text style={styles.seeAllText}>
              {completedBookings.length} ukupno
            </Text>
          </View>

          {completedBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="cash-outline" size={40} color={Colors.muted} />
              </View>
              <Text style={styles.emptyStateTitle}>Nema završenih treninga</Text>
              <Text style={styles.emptyStateSubtitle}>
                Kada označite rezervacije kao završene, pojavit će se ovdje
              </Text>
            </View>
          ) : (
            <View style={styles.bookingsList}>
              {completedBookings.slice(0, 5).map((booking) => (
                <CompletedBookingCard key={booking.id} booking={booking} />
              ))}
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Savjet za veću zaradu</Text>
              <Text style={styles.tipText}>
                Dodajte više programa treniranja različitih težina kako biste privukli više klijenata
              </Text>
            </View>
          </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  totalEarningsCard: {
    margin: 16,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  totalEarningsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  totalEarningsValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFF',
    marginVertical: 8,
  },
  thisMonthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  thisMonthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    marginLeft: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
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
    color: Colors.textSecondary,
  },
  chartContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: 30,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    width: 24,
    height: 100,
    justifyContent: 'flex-end',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    width: '100%',
  },
  barEmpty: {
    backgroundColor: '#E5E7EB',
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  barValue: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
    position: 'absolute',
    top: -18,
  },
  bookingsList: {
    gap: 12,
    marginTop: 8,
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
    alignItems: 'center',
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
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  programName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  earningsBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  earningsAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
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
  completedBadge: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginTop: 8,
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
  tipsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#A16207',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
