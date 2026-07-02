// Walk List Screen - Povijest šetnji
// Prikazuje sve šetnje za vlasnika i sittera

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { useAuth } from '../../lib/auth-context';
import InlineErrorState from '../../components/shared/InlineErrorState';
import type { WalkWithDetails } from '../../lib/walk-types';
import {
  getWalksForUser,
  getActiveWalksForSitter,
  getWalkDbLastError,
  clearWalkDbLastError,
} from '../../lib/walk-db';
import {
  formatWalkDate,
  formatWalkDuration,
  calculateAverageSpeed,
  WALK_STATUS_LABELS,
} from '../../lib/walk-types';

type WalkFilter = 'all' | 'u_tijeku' | 'zavrsena';

// Statistika kartica
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

// Walk kartica
function WalkCard({
  walk,
  onPress,
}: {
  walk: WalkWithDetails;
  onPress: () => void;
}) {
  const isActive = walk.status === 'u_tijeku';
  
  const duration = walk.end_time
    ? Math.round(
        (new Date(walk.end_time).getTime() - new Date(walk.start_time).getTime()) / 60000
      )
    : null;

  const avgSpeed =
    duration && duration > 0
      ? calculateAverageSpeed(walk.distance_km, duration * 60)
      : '0.0';

  const petEmoji =
    walk.petSpecies === 'dog' ? '🐕' : walk.petSpecies === 'cat' ? '🐈' : '🐾';

  return (
    <TouchableOpacity style={styles.walkCard} onPress={onPress}>
      <View style={styles.walkCardContent}>
        {/* Icon */}
        <View
          style={[
            styles.walkIcon,
            isActive
              ? { backgroundColor: Colors.primaryLight }
              : { backgroundColor: Colors.success },
          ]}
        >
          <Ionicons
            name={isActive ? 'location' : 'navigate'}
            size={24}
            color={Colors.white}
          />
        </View>

        {/* Info */}
        <View style={styles.walkInfo}>
          <View style={styles.walkHeader}>
            <Text style={styles.petName}>
              {petEmoji} {walk.petName || 'Ljubimac'}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isActive
                    ? Colors.primaryLight + '20'
                    : Colors.success + '20',
                },
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

          <Text style={styles.walkMeta}>
            {formatWalkDate(walk.start_time)} • {walk.sitterName || 'Sitter'}
          </Text>

          <View style={styles.walkStats}>
            <Text style={styles.walkDistance}>{walk.distance_km.toFixed(2)} km</Text>
            <Text style={styles.walkDuration}>
              {duration ? `${duration} min` : 'U tijeku'} • {avgSpeed} km/h
            </Text>
          </View>
        </View>

        {/* Arrow */}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.muted}
          style={styles.arrow}
        />
      </View>
    </TouchableOpacity>
  );
}

// Empty state
function EmptyState({ onStartWalk }: { onStartWalk?: () => void }) {
  const { user } = useAuth();
  const isSitter = user?.role === 'sitter';

  return (
    <View style={styles.emptyState}>
      <Ionicons name="walk" size={64} color={Colors.muted} />
      <Text style={styles.emptyTitle}>Još nema šetnji</Text>
      <Text style={styles.emptyText}>
        {isSitter
          ? 'Započnite šetnju s jednim od svojih ljubimaca'
          : 'Vaši ljubimci još nisu bili na šetnji'}
      </Text>
      {isSitter && (
        <TouchableOpacity style={styles.startButton} onPress={onStartWalk}>
          <Text style={styles.startButtonText}>Započni šetnju</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function WalkListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [walks, setWalks] = useState<WalkWithDetails[]>([]);
  const [activeWalks, setActiveWalks] = useState<WalkWithDetails[]>([]);
  const [filter, setFilter] = useState<WalkFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isSitter = user?.role === 'sitter';

  const loadWalks = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      clearWalkDbLastError();
      setLoadError(null);
      const [allWalks, active] = await Promise.all([
        getWalksForUser(user.id),
        isSitter ? getActiveWalksForSitter(user.id) : Promise.resolve([]),
      ]);

      setWalks(allWalks);
      setActiveWalks(active);
      const walkError = getWalkDbLastError();
      if (walkError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } catch (err) {
      console.error('Error loading walks:', err);
      setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isSitter]);

  useEffect(() => {
    loadWalks();
  }, [loadWalks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWalks();
    setRefreshing(false);
  }, [loadWalks]);

  const filteredWalks =
    filter === 'all'
      ? walks
      : walks.filter((w) => w.status === filter);

  // Statistike
  const completedWalks = walks.filter((w) => w.status === 'zavrsena');
  const totalDistance = completedWalks.reduce((sum, w) => sum + w.distance_km, 0);
  const totalWalks = completedWalks.length;

  const navigateToWalk = (walkId: string) => {
    router.push(`/walk/${walkId}`);
  };

  const navigateToActiveWalk = (walkId: string) => {
    router.push(`/walk/active?walkId=${walkId}`);
  };

  const startNewWalk = () => {
    router.push('/walk/active');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Šetnje',
          headerRight: () =>
            isSitter && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={startNewWalk}
              >
                <Ionicons name="add" size={24} color={Colors.primary} />
              </TouchableOpacity>
            ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loadError ? <InlineErrorState message={loadError} onRetry={loadWalks} /> : null}

        {/* Aktivne šetnje (prikazane prve ako postoje) */}
        {activeWalks.length > 0 && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionTitle}>Aktivne šetnje</Text>
            {activeWalks.map((walk) => (
              <TouchableOpacity
                key={walk.id}
                style={styles.activeWalkCard}
                onPress={() => navigateToActiveWalk(walk.id)}
              >
                <View style={styles.activeWalkIndicator}>
                  <View style={styles.pulseDot} />
                </View>
                <Text style={styles.activeWalkText}>
                  🐕 {walk.petName || 'Ljubimac'} - Šetnja u tijeku
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Statistike */}
        {totalWalks > 0 && (
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <StatCard
                icon="trophy"
                value={totalWalks.toString()}
                label="Završenih šetnji"
                color={Colors.primary}
              />
              <StatCard
                icon="navigate"
                value={`${totalDistance.toFixed(1)} km`}
                label="Ukupno pređeno"
                color={Colors.primaryLight}
              />
            </View>
          </View>
        )}

        {/* Filteri */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {(['all', 'u_tijeku', 'zavrsena'] as WalkFilter[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterButton,
                  filter === f && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === f && styles.filterButtonTextActive,
                  ]}
                >
                  {f === 'all'
                    ? 'Sve'
                    : f === 'u_tijeku'
                    ? 'U tijeku'
                    : 'Završene'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lista šetnji */}
        {filteredWalks.length > 0 ? (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Povijest šetnji</Text>
            {filteredWalks.map((walk) => (
              <WalkCard
                key={walk.id}
                walk={walk}
                onPress={() => navigateToWalk(walk.id)}
              />
            ))}
          </View>
        ) : (
          !loading && (
            <EmptyState onStartWalk={isSitter ? startNewWalk : undefined} />
          )
        )}
      </ScrollView>

      {/* FAB za sittera */}
      {isSitter && (
        <TouchableOpacity style={styles.fab} onPress={startNewWalk}>
          <Ionicons name="play" size={28} color={Colors.white} />
        </TouchableOpacity>
      )}
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
  headerButton: {
    padding: 8,
  },

  // Active section
  activeSection: {
    padding: 16,
    paddingBottom: 8,
  },
  activeWalkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  activeWalkIndicator: {
    marginRight: 12,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
  },
  activeWalkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },

  // Stats
  statsSection: {
    padding: 16,
    paddingTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Filters
  filterSection: {
    paddingVertical: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },

  // List
  listSection: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },

  // Walk Card
  walkCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  walkCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  walkIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walkInfo: {
    flex: 1,
  },
  walkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  walkMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  walkStats: {
    flexDirection: 'row',
    gap: 12,
  },
  walkDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  walkDuration: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  arrow: {
    marginLeft: 8,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
