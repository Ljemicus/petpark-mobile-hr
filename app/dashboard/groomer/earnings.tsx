// Groomer Earnings Screen
// Prikaz zarade i statistike

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
import type { GroomerProfile, MonthlyEarnings, GroomerBooking } from '../../../lib/groomer-dashboard-types';
import { GROOMING_SERVICE_LABELS } from '../../../lib/groomer-dashboard-types';
import {
  getGroomerProfile,
  getGroomerEarnings,
  getGroomerDashboardDbLastError,
  clearGroomerDashboardDbLastError,
} from '../../../lib/groomer-dashboard-db';

export default function GroomerEarningsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [profile, setProfile] = useState<GroomerProfile | null>(null);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    monthlyEarnings: [] as MonthlyEarnings[],
    completedBookings: [] as GroomerBooking[],
  });
  const [refreshing, setRefreshing] = useState(false);

  const userId = session?.user?.id;

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      clearGroomerDashboardDbLastError();
      const profileData = await getGroomerProfile(userId);
      if (profileData) {
        setProfile(profileData);
        const earningsData = await getGroomerEarnings(profileData.id);
        setEarnings(earningsData);
      }
    } catch (err) {
      console.error('Error fetching earnings:', err);
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

  // Izračunaj prosječnu cijenu po terminu
  const avgPrice =
    earnings.completedBookings.length > 0
      ? (earnings.totalEarnings / earnings.completedBookings.length).toFixed(0)
      : '0';

  // Najpopularnija usluga
  const serviceCounts = earnings.completedBookings.reduce((acc, booking) => {
    acc[booking.service] = (acc[booking.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopularService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'short',
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
        <Text style={styles.title}>Zarada</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {dashboardError ? <InlineErrorState message="Ne možemo učitati podatke. Povuci za osvježavanje." onRetry={fetchData} /> : null}

        {/* Total Earnings Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Ukupna zarada</Text>
          <Text style={styles.totalAmount}>{earnings.totalEarnings}€</Text>
          <View style={styles.totalDetails}>
            <View style={styles.totalDetail}>
              <Text style={styles.totalDetailValue}>{earnings.thisMonthEarnings}€</Text>
              <Text style={styles.totalDetailLabel}>Ovaj mjesec</Text>
            </View>
            <View style={styles.totalDetailDivider} />
            <View style={styles.totalDetail}>
              <Text style={styles.totalDetailValue}>{earnings.completedBookings.length}</Text>
              <Text style={styles.totalDetailLabel}>Termina</Text>
            </View>
            <View style={styles.totalDetailDivider} />
            <View style={styles.totalDetail}>
              <Text style={styles.totalDetailValue}>{avgPrice}€</Text>
              <Text style={styles.totalDetailLabel}>Prosjek</Text>
            </View>
          </View>
        </View>

        {/* Monthly Earnings */}
        {earnings.monthlyEarnings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zarada po mjesecima</Text>
            <View style={styles.monthlyCard}>
              {earnings.monthlyEarnings.map((month, index) => (
                <View key={month.month} style={styles.monthRow}>
                  <Text style={styles.monthName}>{month.month}</Text>
                  <View style={styles.monthBarContainer}>
                    <View
                      style={[
                        styles.monthBar,
                        {
                          width: `${Math.min(
                            (month.amount /
                              Math.max(...earnings.monthlyEarnings.map((m) => m.amount))) *
                              100,
                            100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.monthAmount}>{month.amount}€</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Popular Service */}
        {mostPopularService && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Najpopularnija usluga</Text>
            <View style={styles.popularCard}>
              <View style={styles.popularIcon}>
                <Ionicons name="trophy" size={24} color={Colors.primary} />
              </View>
              <View style={styles.popularInfo}>
                <Text style={styles.popularName}>
                  {GROOMING_SERVICE_LABELS[mostPopularService[0] as keyof typeof GROOMING_SERVICE_LABELS]}
                </Text>
                <Text style={styles.popularCount}>{mostPopularService[1]} završenih termina</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Completed Bookings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Završeni termini</Text>
          {earnings.completedBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cash-outline" size={48} color={Colors.muted} />
              <Text style={styles.emptyTitle}>Nema završenih termina</Text>
              <Text style={styles.emptySubtitle}>
                Nakon što završite termine, vidjet ćete ih ovdje
              </Text>
            </View>
          ) : (
            <View style={styles.bookingsList}>
              {earnings.completedBookings.slice(0, 10).map((booking) => (
                <View key={booking.id} style={styles.bookingItem}>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingService}>
                      {GROOMING_SERVICE_LABELS[booking.service]}
                    </Text>
                    <Text style={styles.bookingDate}>{formatDate(booking.date)}</Text>
                  </View>
                  <Text style={styles.bookingPrice}>{booking.price}€</Text>
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
  totalCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 24,
  },
  totalDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  totalDetail: {
    alignItems: 'center',
  },
  totalDetailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  totalDetailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  totalDetailDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  monthlyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthName: {
    width: 60,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  monthBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  monthBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  monthAmount: {
    width: 60,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
  },
  popularCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  popularIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularInfo: {
    marginLeft: 16,
  },
  popularName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  popularCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  bookingsList: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingService: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  bookingDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomPadding: {
    height: 40,
  },
});
