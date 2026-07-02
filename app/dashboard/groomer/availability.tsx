// Groomer Availability Screen
// Upravljanje rasporedom i dostupnošću termina

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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import InlineErrorState from '../../../components/shared/InlineErrorState';
import { useAuth } from '../../../lib/auth-context';
import type { GroomerAvailabilitySlot, GroomerProfile } from '../../../lib/groomer-dashboard-types';
import {
  getGroomerProfile,
  getGroomerAvailability,
  generateDefaultSlots,
  deleteAvailabilitySlot,
  getGroomerDashboardDbLastError,
  clearGroomerDashboardDbLastError,
} from '../../../lib/groomer-dashboard-db';

export default function GroomerAvailabilityScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [profile, setProfile] = useState<GroomerProfile | null>(null);
  const [availability, setAvailability] = useState<GroomerAvailabilitySlot[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userId = session?.user?.id;

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      clearGroomerDashboardDbLastError();
      const profileData = await getGroomerProfile(userId);
      if (profileData) {
        setProfile(profileData);
        const availabilityData = await getGroomerAvailability(profileData.id);
        setAvailability(availabilityData);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
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

  const handleGenerateSlots = async () => {
    if (!profile) return;

    Alert.alert(
      'Generiraj termine',
      'Ovo će dodati standardne radne termine (Pon-Pet, 09-17h) za sljedećih 4 tjedna. Postojeći termini će biti ažurirani.',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Generiraj',
          style: 'default',
          onPress: async () => {
            setGenerating(true);
            try {
              const count = await generateDefaultSlots(profile.id, [1, 2, 3, 4, 5], '09:00', '17:00');
              Alert.alert('Uspjeh', `Dodano ${count} termina`);
              await fetchData();
            } catch (err) {
              console.error('Error generating slots:', err);
              Alert.alert('Greška', 'Nije moguće generirati termine');
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteSlot = async (slotId: string) => {
    Alert.alert(
      'Obriši termin',
      'Jeste li sigurni da želite obrisati ovaj termin?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(slotId);
            try {
              const success = await deleteAvailabilitySlot(slotId);
              if (success) {
                await fetchData();
              } else {
                Alert.alert('Greška', 'Nije moguće obrisati termin');
              }
            } catch (err) {
              console.error('Error deleting slot:', err);
              Alert.alert('Greška', 'Došlo je do pogreške');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // Grupiraj termine po datumu
  const groupedAvailability = availability.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, GroomerAvailabilitySlot[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00');
    return date.toLocaleDateString('hr-HR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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
        <Text style={styles.title}>Raspored</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Generate Button */}
      <View style={styles.generateContainer}>
        <TouchableOpacity
          style={[styles.generateButton, generating && styles.generateButtonDisabled]}
          onPress={handleGenerateSlots}
          disabled={generating}
        >
          <Ionicons name="sparkles" size={20} color="#FFF" />
          <Text style={styles.generateButtonText}>
            {generating ? 'Generiranje...' : 'Primijeni radne sate'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.generateHint}>
          Dodaje standardne termine (Pon-Pet, 09-17h) za sljedećih 4 tjedna
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {dashboardError ? <InlineErrorState message="Ne možemo učitati podatke. Povuci za osvježavanje." onRetry={fetchData} /> : null}

        {availability.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={Colors.muted} />
            <Text style={styles.emptyTitle}>Nema termina</Text>
            <Text style={styles.emptySubtitle}>
              Koristite gumb iznad za generiranje radnog rasporeda
            </Text>
          </View>
        ) : (
          Object.entries(groupedAvailability).map(([date, slots]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateTitle}>{formatDate(date)}</Text>
              <View style={styles.slotsContainer}>
                {slots.map((slot) => (
                  <View key={slot.id} style={styles.slotCard}>
                    <View style={styles.slotInfo}>
                      <Ionicons name="time-outline" size={18} color={Colors.primary} />
                      <Text style={styles.slotTime}>
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteSlot(slot.id)}
                      disabled={deletingId === slot.id}
                    >
                      {deletingId === slot.id ? (
                        <Ionicons name="refresh" size={18} color={Colors.error} />
                      ) : (
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Stats Footer */}
      {availability.length > 0 && (
        <View style={styles.statsFooter}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{availability.length}</Text>
            <Text style={styles.statLabel}>Ukupno termina</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Object.keys(groupedAvailability).length}</Text>
            <Text style={styles.statLabel}>Dana</Text>
          </View>
        </View>
      )}
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
  generateContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  generateHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
  dateGroup: {
    marginBottom: 20,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  deleteButton: {
    padding: 4,
  },
  bottomPadding: {
    height: 40,
  },
  statsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
});
