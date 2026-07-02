// Walk Details Screen - Detalji pojedine šetnje
// Prikazuje kompletne detalje završene šetnje

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import InlineErrorState from '../../components/shared/InlineErrorState';
import type { WalkWithDetails } from '../../lib/walk-types';
import {
  formatWalkDate,
  formatWalkTime,
  formatWalkDuration,
  calculateAverageSpeed,
  WALK_STATUS_LABELS,
} from '../../lib/walk-types';
import {
  getWalkById,
  getWalkDbLastError,
  clearWalkDbLastError,
} from '../../lib/walk-db';

// Stat kartica
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color={Colors.white} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Checkpoint kartica
function CheckpointCard({ checkpoint }: { checkpoint: any }) {
  return (
    <View style={styles.checkpointCard}>
      <Text style={styles.checkpointEmoji}>{checkpoint.emoji}</Text>
      <View style={styles.checkpointInfo}>
        <Text style={styles.checkpointLabel}>{checkpoint.label}</Text>
        <Text style={styles.checkpointTime}>
          {formatWalkTime(checkpoint.time)}
        </Text>
      </View>
    </View>
  );
}

export default function WalkDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [walk, setWalk] = useState<WalkWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadWalk();
  }, [id]);

  const loadWalk = async () => {
    setLoading(true);
    try {
      clearWalkDbLastError();
      setLoadError(null);
      // Prvo pokušaj dohvatiti iz walk by id
      let walkData = await getWalkById(id);
      const walkError = getWalkDbLastError();
      if (walkError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
      
      // Ako ne uspije, pokušaj pronaći u listi svih walkova
      if (!walkData) {
        // Ovaj fallback je za slučaj da getWalkById ne vrati podatke
        // U produkciji bi trebalo imati bolje upite
        console.log('Walk not found by ID, trying fallback...');
      }

      if (walkData) {
        // Dohvati dodatne detalje
        setWalk(walkData as WalkWithDetails);
      }
    } catch (err) {
      console.error('Error loading walk:', err);
      setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Detalji šetnje' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!walk) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Detalji šetnje' }} />
        <View style={styles.errorContainer}>
          {loadError ? <InlineErrorState message={loadError} onRetry={loadWalk} /> : null}
          <Ionicons name="alert-circle" size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>Šetnja nije pronađena</Text>
          <Text style={styles.errorText}>
            Nije moguće pronaći detalje za ovu šetnju.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/walk')}
          >
            <Text style={styles.backButtonText}>Natrag na šetnje</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isActive = walk.status === 'u_tijeku';
  const petEmoji =
    walk.petSpecies === 'dog' ? '🐕' : walk.petSpecies === 'cat' ? '🐈' : '🐾';

  const duration = walk.end_time
    ? Math.round(
        (new Date(walk.end_time).getTime() - new Date(walk.start_time).getTime()) /
          60000
      )
    : null;

  const elapsed = walk.end_time
    ? Math.round(
        (new Date(walk.end_time).getTime() - new Date(walk.start_time).getTime()) /
          1000
      )
    : Math.round(
        (Date.now() - new Date(walk.start_time).getTime()) / 1000
      );

  const avgSpeed = duration
    ? calculateAverageSpeed(walk.distance_km, duration * 60)
    : calculateAverageSpeed(walk.distance_km, elapsed);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Detalji šetnje' }} />

      <ScrollView style={styles.scrollView}>
        {loadError ? <InlineErrorState message={loadError} onRetry={loadWalk} /> : null}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonHeader}
            onPress={() => router.push('/walk')}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.petName}>
              {petEmoji} {walk.petName || 'Ljubimac'}
            </Text>
            <Text style={styles.sitterName}>Sitter: {walk.sitterName || 'Nepoznato'}</Text>

            <View
              style={[
                styles.statusBadge,
                isActive
                  ? { backgroundColor: Colors.primaryLight + '20' }
                  : { backgroundColor: Colors.success + '20' },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isActive ? Colors.primary : Colors.success,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isActive ? Colors.primary : Colors.success },
                ]}
              >
                {WALK_STATUS_LABELS[walk.status]}
              </Text>
            </View>
          </View>
        </View>

        {/* Date Card */}
        <View style={styles.dateCard}>
          <Ionicons name="calendar" size={20} color={Colors.primary} />
          <Text style={styles.dateText}>
            {formatWalkDate(walk.start_time)}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {formatWalkTime(walk.start_time)}
              {walk.end_time && ` - ${formatWalkTime(walk.end_time)}`}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              icon="time"
              value={formatWalkDuration(elapsed)}
              label="Trajanje"
              color="#3B82F6"
            />
            <StatCard
              icon="location"
              value={`${walk.distance_km.toFixed(2)} km`}
              label="Udaljenost"
              color={Colors.primary}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="speedometer"
              value={`${avgSpeed} km/h`}
              label="Prosj. brzina"
              color="#10B981"
            />
            <StatCard
              icon="flag"
              value={(walk.checkpoints?.length || 0).toString()}
              label="Checkpointi"
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Ruta šetnje</Text>
          <View style={styles.mapContainer}>
            <Ionicons name="map" size={48} color={Colors.primary} />
            <Text style={styles.mapText}>
              {walk.route?.length || 0} GPS točaka zabilježeno
            </Text>
            {walk.route && walk.route.length > 0 && (
              <View style={styles.routeInfo}>
                <Text style={styles.routeInfoText}>
                  Početak: {walk.route[0].lat.toFixed(4)},{' '}
                  {walk.route[0].lng.toFixed(4)}
                </Text>
                <Text style={styles.routeInfoText}>
                  Kraj:{' '}
                  {walk.route[walk.route.length - 1].lat.toFixed(4)},{' '}
                  {walk.route[walk.route.length - 1].lng.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Checkpoints */}
        {walk.checkpoints && walk.checkpoints.length > 0 && (
          <View style={styles.checkpointsSection}>
            <Text style={styles.sectionTitle}>
              Checkpointi ({walk.checkpoints.length})
            </Text>
            {walk.checkpoints.map((checkpoint, index) => (
              <CheckpointCard key={index} checkpoint={checkpoint} />
            ))}
          </View>
        )}

        {/* Prati uživo (ako je aktivna) */}
        {isActive && (
          <TouchableOpacity
            style={styles.liveButton}
            onPress={() => router.push(`/walk/active?walkId=${walk.id}`)}
          >
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.liveButtonText}>Prati šetnju uživo</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        )}

        {/* Poruka sitteru */}
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble" size={20} color={Colors.primary} />
          <Text style={styles.messageButtonText}>Pošalji poruku sitteru</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Header
  header: {
    padding: 16,
    paddingTop: 8,
  },
  backButtonHeader: {
    marginBottom: 12,
  },
  headerContent: {
    alignItems: 'center',
  },
  petName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  sitterName: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Date Card
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  timeContainer: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },

  // Stats
  statsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Map
  mapSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  mapContainer: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  mapText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 12,
    fontWeight: '500',
  },
  routeInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    width: '100%',
  },
  routeInfoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },

  // Checkpoints
  checkpointsSection: {
    padding: 16,
    paddingTop: 0,
  },
  checkpointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  checkpointEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  checkpointInfo: {
    flex: 1,
  },
  checkpointLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  checkpointTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Live button
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  liveIndicator: {
    marginRight: 12,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  liveButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },

  // Message button
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
});
