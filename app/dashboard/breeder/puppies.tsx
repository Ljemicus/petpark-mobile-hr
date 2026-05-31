// Breeder Puppies Screen
// Prikazuje listu štenca unutar legla

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
import type { Puppy, Litter } from '../../../lib/breeder-dashboard-types';
import { PUPPY_STATUS_LABELS, PUPPY_STATUS_COLORS } from '../../../lib/breeder-dashboard-types';
import { getLitterPuppies, getBreederLitters, updatePuppy } from '../../../lib/breeder-dashboard-db';

export default function BreederPuppiesScreen() {
  const router = useRouter();
  const { litterId } = useLocalSearchParams();
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [litter, setLitter] = useState<Litter | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!litterId) return;

    try {
      // Get puppies for this litter
      const puppiesData = await getLitterPuppies(litterId as string);
      setPuppies(puppiesData);

      // Get litter details (we need to find it from all litters)
      // This is a workaround since we don't have a direct getLitter function
      const litters = await getBreederLitters(''); // This won't work without breederId
      // For now, we'll just show puppies without litter details
    } catch (err) {
      console.error('Error fetching puppies:', err);
    } finally {
      setLoading(false);
    }
  }, [litterId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleStatusChange = async (puppyId: string, newStatus: Puppy['status']) => {
    const success = await updatePuppy(puppyId, { status: newStatus });
    if (success) {
      setPuppies(puppies.map(p => p.id === puppyId ? { ...p, status: newStatus } : p));
    }
  };

  const renderPuppyCard = (puppy: Puppy) => {
    const statusStyle = PUPPY_STATUS_COLORS[puppy.status];

    return (
      <View key={puppy.id} style={styles.puppyCard}>
        <View style={styles.puppyHeader}>
          <View style={styles.puppyInfo}>
            <Text style={styles.puppyName}>
              {puppy.name || `Štene #${puppy.id.slice(-4)}`}
            </Text>
            <View style={styles.puppyMeta}>
              <Ionicons
                name={puppy.gender === 'male' ? 'male' : 'female'}
                size={16}
                color={puppy.gender === 'male' ? '#3B82F6' : '#EC4899'}
              />
              <Text style={styles.puppyMetaText}>
                {puppy.gender === 'male' ? 'Muško' : 'Žensko'}
              </Text>
              <Text style={styles.puppyMetaDot}>·</Text>
              <Text style={styles.puppyMetaText}>{puppy.color}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {PUPPY_STATUS_LABELS[puppy.status]}
            </Text>
          </View>
        </View>

        {puppy.microchip && (
          <View style={styles.microchipRow}>
            <Ionicons name="hardware-chip-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.microchipText}>Microchip: {puppy.microchip}</Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Cijena:</Text>
          <Text style={styles.priceValue}>{puppy.price}€</Text>
        </View>

        {puppy.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.notesText}>{puppy.notes}</Text>
          </View>
        )}

        <View style={styles.puppyActions}>
          <TouchableOpacity
            style={[styles.actionButton, puppy.status === 'available' && styles.activeAction]}
            onPress={() => handleStatusChange(puppy.id, 'available')}
          >
            <Text style={[styles.actionText, puppy.status === 'available' && styles.activeActionText]}>
              Dostupan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, puppy.status === 'reserved' && styles.activeAction]}
            onPress={() => handleStatusChange(puppy.id, 'reserved')}
          >
            <Text style={[styles.actionText, puppy.status === 'reserved' && styles.activeActionText]}>
              Rezerviran
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, puppy.status === 'sold' && styles.activeAction]}
            onPress={() => handleStatusChange(puppy.id, 'sold')}
          >
            <Text style={[styles.actionText, puppy.status === 'sold' && styles.activeActionText]}>
              Prodan
            </Text>
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>Štenci</Text>
          {litter && <Text style={styles.subtitle}>{litter.breed}</Text>}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Dodaj štene', 'Funkcionalnost uskoro dostupna')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {puppies.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="paw-outline" size={48} color={Colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>Još nema štenca</Text>
            <Text style={styles.emptySubtitle}>
              Dodajte štence za ovo leglo
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => Alert.alert('Dodaj štene', 'Funkcionalnost uskoro dostupna')}
            >
              <Text style={styles.emptyButtonText}>Dodaj štene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.puppiesList}>
            {puppies.map(renderPuppyCard)}
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
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
  puppiesList: {
    gap: 16,
  },
  puppyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  puppyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  puppyInfo: {
    flex: 1,
  },
  puppyName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  puppyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  puppyMetaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  puppyMetaDot: {
    fontSize: 14,
    color: Colors.muted,
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
  microchipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  microchipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
  },
  puppyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  activeAction: {
    backgroundColor: Colors.primary,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeActionText: {
    color: '#FFF',
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
