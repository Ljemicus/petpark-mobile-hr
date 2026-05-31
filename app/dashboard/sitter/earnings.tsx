// Sitter Dashboard - Earnings Screen
// Prikazuje zaradu, statistiku i povijest plaćanja

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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import type { Booking, MonthlyEarnings } from '../../../lib/sitter-dashboard-types';
import { SERVICE_LABELS } from '../../../lib/sitter-dashboard-types';
import { getSitterEarnings } from '../../../lib/sitter-dashboard-db';

const { width } = Dimensions.get('window');

// Simple bar chart komponenta
function SimpleBarChart({ data }: { data: MonthlyEarnings[] }) {
  const maxValue = Math.max(...data.map((d) => d.amount), 1);
  const chartHeight = 150;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chart}>
        {data.map((item, index) => {
          const height = (item.amount / maxValue) * chartHeight;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(height, 4) },
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

// Transaction card komponenta
function TransactionCard({ booking }: { booking: Booking }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.ownerInfo}>
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
              {SERVICE_LABELS[booking.service_type]}
            </Text>
          </View>
        </View>
        <Text style={styles.transactionAmount}>+{booking.total_price}€</Text>
      </View>
      <View style={styles.transactionFooter}>
        <Text style={styles.transactionDate}>{formatDate(booking.end_date)}</Text>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#10B981" />
          <Text style={styles.statusText}>Završeno</Text>
        </View>
      </View>
    </View>
  );
}

// Glavni komponent
export default function SitterEarningsScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [earnings, setEarnings] = useState<{
    totalEarnings: number;
    thisMonthEarnings: number;
    monthlyEarnings: MonthlyEarnings[];
    completedBookings: Booking[];
  }>({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    monthlyEarnings: [],
    completedBookings: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year' | 'all'>('month');

  const userId = session?.user?.id;

  // Dohvati podatke o zaradi
  const fetchEarnings = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await getSitterEarnings(userId);
      setEarnings(data);
    } catch (err) {
      console.error('Error fetching earnings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  }, [fetchEarnings]);

  // Izračunaj prosječnu zaradu po rezervaciji
  const avgEarning =
    earnings.completedBookings.length > 0
      ? (earnings.totalEarnings / earnings.completedBookings.length).toFixed(0)
      : '0';

  // Izračunaj broj rezervacija ovaj mjesec
  const thisMonthBookings = earnings.monthlyEarnings[earnings.monthlyEarnings.length - 1]?.bookingCount || 0;

  // Filtriraj transakcije
  const filteredTransactions = earnings.completedBookings.slice(0, 10);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Earnings Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Ukupna zarada</Text>
          <Text style={styles.totalAmount}>{earnings.totalEarnings}€</Text>
          <View style={styles.totalStats}>
            <View style={styles.totalStat}>
              <Text style={styles.totalStatValue}>{earnings.thisMonthEarnings}€</Text>
              <Text style={styles.totalStatLabel}>Ovaj mjesec</Text>
            </View>
            <View style={styles.totalStatDivider} />
            <View style={styles.totalStat}>
              <Text style={styles.totalStatValue}>{earnings.completedBookings.length}</Text>
              <Text style={styles.totalStatLabel}>Rezervacija</Text>
            </View>
            <View style={styles.totalStatDivider} />
            <View style={styles.totalStat}>
              <Text style={styles.totalStatValue}>{avgEarning}€</Text>
              <Text style={styles.totalStatLabel}>Prosječno</Text>
            </View>
          </View>
        </View>

        {/* Monthly Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Zarada po mjesecima</Text>
          </View>
          <View style={styles.chartCard}>
            {earnings.monthlyEarnings.length > 0 ? (
              <SimpleBarChart data={earnings.monthlyEarnings} />
            ) : (
              <View style={styles.emptyChart}>
                <Ionicons name="trending-up" size={40} color={Colors.muted} />
                <Text style={styles.emptyChartText}>Nema podataka o zaradi</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistika</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#10B98115' }]}>
                <Ionicons name="calendar" size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{thisMonthBookings}</Text>
              <Text style={styles.statLabel}>Rezervacija ovaj mjesec</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#3B82F615' }]}>
                <Ionicons name="star" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{avgEarning}€</Text>
              <Text style={styles.statLabel}>Prosječna zarada</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F59E0B15' }]}>
                <Ionicons name="trending-up" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>
                {earnings.monthlyEarnings.length > 1
                  ? `${(
                      ((earnings.monthlyEarnings[earnings.monthlyEarnings.length - 1]?.amount || 0) -
                        (earnings.monthlyEarnings[earnings.monthlyEarnings.length - 2]?.amount || 0)) /
                      Math.max(earnings.monthlyEarnings[earnings.monthlyEarnings.length - 2]?.amount || 1, 1) *
                      100
                    ).toFixed(0)}%`
                  : '0%'}
              </Text>
              <Text style={styles.statLabel}>Rast (mjesec)</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#8B5CF615' }]}>
                <Ionicons name="wallet" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>
                {earnings.completedBookings.filter(
                  (b) => new Date(b.end_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).reduce((sum, b) => sum + b.total_price, 0)}€
              </Text>
              <Text style={styles.statLabel}>Zadnjih 7 dana</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nedavne transakcije</Text>
          </View>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="cash-outline" size={40} color={Colors.muted} />
              </View>
              <Text style={styles.emptyStateTitle}>Nema transakcija</Text>
              <Text style={styles.emptyStateSubtitle}>
                Kada završite rezervacije, zarada će se prikazati ovdje
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {filteredTransactions.map((booking) => (
                <TransactionCard key={booking.id} booking={booking} />
              ))}
            </View>
          )}
        </View>

        {/* Wallet Link */}
        <TouchableOpacity
          style={styles.walletCard}
          onPress={() => router.push('/payments/wallet')}
        >
          <View style={styles.walletIconContainer}>
            <Ionicons name="wallet" size={24} color={Colors.primary} />
          </View>
          <View style={styles.walletContent}>
            <Text style={styles.walletTitle}>Novčanik</Text>
            <Text style={styles.walletSubtitle}>
              Upravljajte dostupnim sredstvima i zatražite isplatu
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
        </TouchableOpacity>

        {/* Payout Info */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutIconContainer}>
            <Ionicons name="card" size={24} color={Colors.primary} />
          </View>
          <View style={styles.payoutContent}>
            <Text style={styles.payoutTitle}>Isplata zarade</Text>
            <Text style={styles.payoutSubtitle}>
              Isplate se obrađuju automatski svakog 1. u mjesecu na vaš bankovni račun
            </Text>
          </View>
        </View>

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
  totalCard: {
    backgroundColor: Colors.primary,
    margin: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 8,
  },
  totalStats: {
    flexDirection: 'row',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  totalStat: {
    flex: 1,
    alignItems: 'center',
  },
  totalStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  totalStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  totalStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  section: {
    marginTop: 8,
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
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  chartContainer: {
    height: 200,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    paddingBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    justifyContent: 'flex-end',
    height: 150,
  },
  bar: {
    width: 24,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  barEmpty: {
    backgroundColor: '#E5E7EB',
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  barValue: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyChart: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    width: (width - 44) / 2,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  payoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutContent: {
    flex: 1,
    marginLeft: 14,
  },
  payoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  payoutSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletContent: {
    flex: 1,
    marginLeft: 14,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  walletSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
