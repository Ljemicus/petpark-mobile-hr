// Breeder Earnings Screen
// Prikazuje pregled zarade

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
import { useAuth } from '../../../lib/auth-context';
import { getBreederStats, getBreederProfile } from '../../../lib/breeder-dashboard-db';
import type { BreederStats } from '../../../lib/breeder-dashboard-types';

export default function BreederEarningsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [stats, setStats] = useState<BreederStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    try {
      const profile = await getBreederProfile(userId);
      if (!profile) {
        setLoading(false);
        return;
      }

      const data = await getBreederStats(profile.id);
      setStats(data);
    } catch (err) {
      console.error('Error fetching earnings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  const earningsData = [
    { label: 'Ovaj mjesec', value: stats?.thisMonthEarnings || 0, icon: 'calendar', color: '#F97316' },
    { label: 'Prošli mjesec', value: 0, icon: 'calendar-outline', color: '#3B82F6' },
    { label: 'Ova godina', value: stats?.totalEarnings || 0, icon: 'trending-up', color: '#10B981' },
    { label: 'Ukupno', value: stats?.totalEarnings || 0, icon: 'cash', color: '#8B5CF6' },
  ];

  const statsData = [
    { label: 'Prodanih štenca', value: stats?.totalPuppies || 0 },
    { label: 'Aktivnih legla', value: stats?.activeLitters || 0 },
    { label: 'Upita', value: stats?.totalApplications || 0 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Zarada</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Earnings Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardLabel}>Dostupno za isplatu</Text>
          <Text style={styles.mainCardValue}>{stats?.totalEarnings || 0}€</Text>
          <TouchableOpacity style={styles.payoutButton}>
            <Text style={styles.payoutButtonText}>Zatraži isplatu</Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Grid */}
        <View style={styles.earningsGrid}>
          {earningsData.map((item, index) => (
            <View key={index} style={styles.earningsCard}>
              <View style={[styles.earningsIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={styles.earningsValue}>{item.value}€</Text>
              <Text style={styles.earningsLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistika</Text>
          <View style={styles.statsCard}>
            {statsData.map((stat, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={Colors.primary} />
            <Text style={styles.infoTitle}>Informacije o isplati</Text>
          </View>
          <Text style={styles.infoText}>
            Isplate se obrađuju unutar 3-5 radnih dana. Minimalni iznos za isplatu je 50€.
          </Text>
        </View>

        {/* Response Rate */}
        <View style={styles.responseCard}>
          <View style={styles.responseHeader}>
            <Text style={styles.responseTitle}>Stopa odgovora</Text>
            <Text style={styles.responseValue}>{stats?.responseRate || 0}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${stats?.responseRate || 0}%` }
              ]} 
            />
          </View>
          <Text style={styles.responseSubtext}>
            Prosječno vrijeme odgovora: {stats?.avgResponseTime || '-'}
          </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  scrollContent: {
    padding: 16,
  },
  mainCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  mainCardLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  mainCardValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
  },
  payoutButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  payoutButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  earningsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    width: '47%',
    alignItems: 'center',
  },
  earningsIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
  statsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  infoCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  infoText: {
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
  },
  responseCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  responseValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.success,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  responseSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  bottomPadding: {
    height: 40,
  },
});
