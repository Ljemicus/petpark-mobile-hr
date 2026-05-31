// Breeder Litters Screen
// Prikazuje listu legla i omogućuje dodavanje novog

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import type { Litter } from '../../../lib/breeder-dashboard-types';
import { LITTER_STATUS_LABELS, LITTER_STATUS_COLORS } from '../../../lib/breeder-dashboard-types';
import { getBreederLitters, deleteLitter, getBreederProfile } from '../../../lib/breeder-dashboard-db';

export default function BreederLittersScreen() {
  const router = useRouter();
  const { action } = useLocalSearchParams();
  const { session } = useAuth();
  const [litters, setLitters] = useState<Litter[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  const userId = session?.user?.id;

  const fetchLitters = useCallback(async () => {
    if (!userId) return;

    try {
      const profile = await getBreederProfile(userId);
      if (!profile) {
        setLoading(false);
        return;
      }
      setProfileId(profile.id);

      const data = await getBreederLitters(profile.id);
      setLitters(data);
    } catch (err) {
      console.error('Error fetching litters:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLitters();
  }, [fetchLitters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLitters();
    setRefreshing(false);
  }, [fetchLitters]);

  const handleDeleteLitter = (litterId: string) => {
    Alert.alert(
      'Izbriši leglo',
      'Jeste li sigurni da želite izbrisati ovo leglo?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Izbriši',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteLitter(litterId);
            if (success) {
              setLitters(litters.filter((l) => l.id !== litterId));
            }
          },
        },
      ]
    );
  };

  const renderLitterCard = (litter: Litter) => {
    const statusStyle = LITTER_STATUS_COLORS[litter.status];

    return (
      <View key={litter.id} style={styles.litterCard}>
        <View style={styles.litterHeader}>
          <View>
            <Text style={styles.litterBreed}>{litter.breed}</Text>
            <Text style={styles.litterSubtitle}>
              {litter.species === 'dog' ? '🐕 Pas' : '🐈 Mačka'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {LITTER_STATUS_LABELS[litter.status]}
            </Text>
          </View>
        </View>

        <View style={styles.litterDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.detailText}>
              {litter.birth_date
                ? `Rođeni: ${new Date(litter.birth_date).toLocaleDateString('hr-HR')}`
                : litter.expected_date
                ? `Očekivano: ${new Date(litter.expected_date).toLocaleDateString('hr-HR')}`
                : 'Datum još nije poznat'}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{litter.total_puppies}</Text>
              <Text style={styles.statLabel}>Ukupno</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.success }]}>
                {litter.available_count}
              </Text>
              <Text style={styles.statLabel}>Dostupno</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {litter.reserved_count}
              </Text>
              <Text style={styles.statLabel}>Rezervirano</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {litter.sold_count}
              </Text>
              <Text style={styles.statLabel}>Prodano</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Cijena:</Text>
            <Text style={styles.priceValue}>
              {litter.price_from}€ - {litter.price_to}€
            </Text>
          </View>

          {litter.fci_registered && (
            <View style={styles.fciBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
              <Text style={styles.fciText}>FCI registrirano</Text>
            </View>
          )}
        </View>

        <View style={styles.litterActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push(`/dashboard/breeder/puppies?litterId=${litter.id}`)}
          >
            <Ionicons name="paw" size={18} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Štenci</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push(`/dashboard/breeder/litters?edit=${litter.id}`)}
          >
            <Ionicons name="create-outline" size={18} color="#FFF" />
            <Text style={styles.primaryButtonText}>Uredi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={() => handleDeleteLitter(litter.id)}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Moja legla</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/dashboard/breeder/litters?action=add')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {litters.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="paw-outline" size={48} color={Colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>Još nemate legla</Text>
            <Text style={styles.emptySubtitle}>
              Dodajte svoje prvo leglo da biste ga prikazali potencijalnim kupcima
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/dashboard/breeder/litters?action=add')}
            >
              <Text style={styles.emptyButtonText}>Dodaj leglo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.littersList}>
            {litters.map(renderLitterCard)}
          </View>
        )}

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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  littersList: {
    gap: 16,
  },
  litterCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  litterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  litterBreed: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  litterSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  litterDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  fciBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  fciText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  litterActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    flex: 1,
  },
  dangerButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
