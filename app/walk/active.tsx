// Active Walk Screen - GPS Tracking
// Glavni screen za praćenje šetnje u realnom vremenu

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../../lib/colors';
import { useAuth } from '../../lib/auth-context';
import type { Walk, WalkCheckpoint } from '../../lib/walk-types';
import {
  formatWalkDuration,
  calculateAverageSpeed,
  calculateDistance,
  CHECKPOINT_OPTIONS,
} from '../../lib/walk-types';
import {
  createWalk,
  updateWalk,
  endWalk,
  getAvailableBookingsForWalk,
  getWalkById,
  subscribeToWalk,
  unsubscribeFromWalk,
} from '../../lib/walk-db';

type WalkState = 'idle' | 'active' | 'paused' | 'finished';

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface BookingOption {
  id: string;
  pet_id: string;
  pet?: {
    id: string;
    name: string;
    species: 'dog' | 'cat' | 'other';
  };
  start_date: string;
  end_date: string;
}

// Statistika kartica (veća za easy reading while walking)
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
        <Ionicons name={icon as any} size={24} color={Colors.white} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Booking selektor (kada sitter bira koju šetnju započinje)
function BookingSelector({
  bookings,
  selectedId,
  onSelect,
}: {
  bookings: BookingOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Odaberite ljubimca za šetnju</Text>
      {bookings.map((booking) => {
        const petEmoji =
          booking.pet?.species === 'dog'
            ? '🐕'
            : booking.pet?.species === 'cat'
            ? '🐈'
            : '🐾';
        const isSelected = selectedId === booking.id;

        return (
          <TouchableOpacity
            key={booking.id}
            style={[
              styles.bookingOption,
              isSelected && styles.bookingOptionSelected,
            ]}
            onPress={() => onSelect(booking.id)}
          >
            <View style={styles.bookingInfo}>
              <Text style={styles.petName}>
                {petEmoji} {booking.pet?.name || 'Ljubimac'}
              </Text>
              <Text style={styles.bookingDates}>
                {new Date(booking.start_date).toLocaleDateString('hr-HR')} -{' '}
                {new Date(booking.end_date).toLocaleDateString('hr-HR')}
              </Text>
            </View>
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark" size={20} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Checkpoint modal
function CheckpointModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string, label: string) => void;
}) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Dodaj checkpoint</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>
            Označite važnu točku na šetnji
          </Text>
          <View style={styles.checkpointGrid}>
            {CHECKPOINT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={styles.checkpointButton}
                onPress={() => onSelect(option.emoji, option.label)}
              >
                <Text style={styles.checkpointEmoji}>{option.emoji}</Text>
                <Text style={styles.checkpointLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// End walk modal
function EndWalkModal({
  visible,
  onClose,
  onEnd,
  duration,
  distance,
}: {
  visible: boolean;
  onClose: () => void;
  onEnd: (note: string) => void;
  duration: number;
  distance: number;
}) {
  const [note, setNote] = useState('');

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Završi šetnju?</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>
                {formatWalkDuration(duration)}
              </Text>
              <Text style={styles.summaryLabel}>Trajanje</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>{distance.toFixed(2)} km</Text>
              <Text style={styles.summaryLabel}>Udaljenost</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Bilješka (opcionalno)</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            numberOfLines={3}
            placeholder="Npr. Pas je bio veseo, pili smo vodu u parku..."
            value={note}
            onChangeText={setNote}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Odustani</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.endButton}
              onPress={() => onEnd(note)}
            >
              <Text style={styles.endButtonText}>Završi šetnju</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Simplified Map Component (bez vanjske biblioteke)
function SimpleMap({
  routePoints,
  checkpoints,
  currentLocation,
}: {
  routePoints: RoutePoint[];
  checkpoints: WalkCheckpoint[];
  currentLocation: { lat: number; lng: number } | null;
}) {
  // Jednostavna vizualizacija rute - prikazuje broj točaka i udaljenost
  const hasRoute = routePoints.length > 0;
  
  return (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={48} color={Colors.primary} />
        <Text style={styles.mapTitle}>
          {hasRoute ? 'GPS praćenje aktivno' : 'Čekam GPS signal...'}
        </Text>
        {hasRoute && (
          <>
            <Text style={styles.mapStats}>
              {routePoints.length} točaka zabilježeno
            </Text>
            {checkpoints.length > 0 && (
              <View style={styles.checkpointList}>
                <Text style={styles.checkpointTitle}>Checkpointi:</Text>
                <View style={styles.checkpointRow}>
                  {checkpoints.slice(-5).map((cp, i) => (
                    <Text key={i} style={styles.checkpointItem}>
                      {cp.emoji}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
        {currentLocation && (
          <View style={styles.locationBadge}>
            <Ionicons name="location" size={14} color={Colors.success} />
            <Text style={styles.locationText}>
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ActiveWalkScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { walkId: existingWalkId } = useLocalSearchParams<{ walkId?: string }>();

  const [walkState, setWalkState] = useState<WalkState>('idle');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [availableBookings, setAvailableBookings] = useState<BookingOption[]>([]);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [checkpoints, setCheckpoints] = useState<WalkCheckpoint[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentWalkId, setCurrentWalkId] = useState<string | null>(existingWalkId || null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const walkSubscriptionRef = useRef<any>(null);

  // Traži dozvolu za lokaciju
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        // Dohvati trenutnu poziciju
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } else {
        Alert.alert(
          'Lokacija potrebna',
          'Za praćenje šetnje potrebna je dozvola za pristup lokaciji.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Error requesting location permission:', err);
    }
  };

  // Učitaj dostupne booking-e ako je nova šetnja
  useEffect(() => {
    if (!existingWalkId && user?.id) {
      loadAvailableBookings();
    } else if (existingWalkId) {
      loadExistingWalk(existingWalkId);
    }
  }, [existingWalkId, user?.id]);

  const loadAvailableBookings = async () => {
    setLoading(true);
    try {
      const bookings = await getAvailableBookingsForWalk(user!.id);
      setAvailableBookings(bookings);
      if (bookings.length > 0) {
        setSelectedBookingId(bookings[0].id);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingWalk = async (id: string) => {
    setLoading(true);
    try {
      const walk = await getWalkById(id);
      if (walk) {
        setCurrentWalkId(walk.id);
        setRoutePoints(walk.route.map((r) => ({ ...r, timestamp: Date.now() })));
        setCheckpoints(walk.checkpoints || []);
        setDistance(walk.distance_km);
        setStartTime(new Date(walk.start_time).getTime());
        setSelectedBookingId(walk.booking_id);

        if (walk.status === 'u_tijeku') {
          setWalkState('active');
          startTimer(new Date(walk.start_time).getTime());
          startLocationTracking();
          subscribeToWalkUpdates(walk.id);
        } else {
          setWalkState('finished');
          if (walk.end_time) {
            const finalElapsed = Math.round(
              (new Date(walk.end_time).getTime() - new Date(walk.start_time).getTime()) / 1000
            );
            setElapsed(finalElapsed);
          }
        }
      }
    } catch (err) {
      console.error('Error loading walk:', err);
    } finally {
      setLoading(false);
    }
  };

  // Timer
  const startTimer = (start: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Location tracking
  const startLocationTracking = async () => {
    try {
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // 5 sekundi
          distanceInterval: 10, // 10 metara
        },
        handleLocationUpdate
      );
    } catch (err) {
      console.error('Error starting location tracking:', err);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  };

  const handleLocationUpdate = (location: Location.LocationObject) => {
    const point: RoutePoint = {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      timestamp: Date.now(),
    };

    setCurrentLocation({ lat: point.lat, lng: point.lng });

    setRoutePoints((prev) => {
      const newPoints = [...prev, point];
      // Izračunaj udaljenost od zadnje točke
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const d = calculateDistance(last.lat, last.lng, point.lat, point.lng);
        setDistance((prevDist) => prevDist + d);
      }
      return newPoints;
    });
  };

  // Subscribe na walk updates (realtime)
  const subscribeToWalkUpdates = (id: string) => {
    walkSubscriptionRef.current = subscribeToWalk(id, (updatedWalk) => {
      if (updatedWalk.route) {
        setRoutePoints(
          updatedWalk.route.map((r) => ({ ...r, timestamp: Date.now() }))
        );
      }
      if (updatedWalk.checkpoints) {
        setCheckpoints(updatedWalk.checkpoints);
      }
      if (updatedWalk.distance_km !== undefined) {
        setDistance(updatedWalk.distance_km);
      }
    });
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopTimer();
      stopLocationTracking();
      if (walkSubscriptionRef.current) {
        unsubscribeFromWalk(walkSubscriptionRef.current);
      }
    };
  }, []);

  // Započni šetnju
  const startWalk = async () => {
    if (!locationPermission) {
      Alert.alert('Lokacija potrebna', 'Omogućite pristup lokaciji za praćenje šetnje.');
      return;
    }

    if (!selectedBookingId) {
      Alert.alert('Odaberite rezervaciju', 'Izaberite ljubimca za šetnju.');
      return;
    }

    const booking = availableBookings.find((b) => b.id === selectedBookingId);
    if (!booking) return;

    const now = Date.now();
    const point: RoutePoint = {
      lat: currentLocation?.lat || 45.815,
      lng: currentLocation?.lng || 15.982,
      timestamp: now,
    };

    setRoutePoints([point]);
    setStartTime(now);
    setWalkState('active');
    setDistance(0);
    setElapsed(0);
    setCheckpoints([]);

    // Kreiraj walk u bazi
    const walk = await createWalk({
      sitter_id: user!.id,
      pet_id: booking.pet_id,
      booking_id: selectedBookingId,
      start_time: new Date(now).toISOString(),
      end_time: null,
      status: 'u_tijeku',
      distance_km: 0,
      route: [{ lat: point.lat, lng: point.lng }],
      checkpoints: [],
    });

    if (!walk) {
      setWalkState('idle');
      setRoutePoints([]);
      setStartTime(null);
      Alert.alert('Greška', 'Šetnja nije spremljena. Pokušajte ponovo.');
      return;
    }

    setCurrentWalkId(walk.id);
    startTimer(now);
    startLocationTracking();
    subscribeToWalkUpdates(walk.id);
  };

  // Pauziraj šetnju
  const pauseWalk = () => {
    stopLocationTracking();
    setWalkState('paused');
  };

  // Nastavi šetnju
  const resumeWalk = async () => {
    setWalkState('active');
    startLocationTracking();
  };

  // Dodaj checkpoint
  const addCheckpoint = async (emoji: string, label: string) => {
    if (!currentWalkId || !currentLocation) return;

    const checkpoint: WalkCheckpoint = {
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      time: new Date().toISOString(),
      emoji,
      label,
    };

    const newCheckpoints = [...checkpoints, checkpoint];
    setCheckpoints(newCheckpoints);

    // Spremi u bazu
    await updateWalk(currentWalkId, { checkpoints: newCheckpoints });
    setShowCheckpointModal(false);
  };

  // Završi šetnju
  const endWalkHandler = async (note: string) => {
    if (!currentWalkId) return;

    stopTimer();
    stopLocationTracking();
    setWalkState('finished');
    setShowEndModal(false);

    const success = await endWalk(currentWalkId, {
      end_time: new Date().toISOString(),
      distance_km: Number(distance.toFixed(2)),
      route: routePoints.map((p) => ({ lat: p.lat, lng: p.lng })),
      checkpoints,
    });

    if (success) {
      Alert.alert(
        'Šetnja završena! 🎉',
        `Trajanje: ${formatWalkDuration(elapsed)}, ${distance.toFixed(2)} km`,
        [{ text: 'OK', onPress: () => router.push('/walk') }]
      );
    } else {
      Alert.alert('Greška', 'Nije moguće završiti šetnju.');
    }
  };

  // Sync svakih 30 sekundi
  useEffect(() => {
    if (walkState !== 'active' || !currentWalkId) return;

    const syncInterval = setInterval(() => {
      updateWalk(currentWalkId, {
        distance_km: Number(distance.toFixed(2)),
        route: routePoints.map((p) => ({ lat: p.lat, lng: p.lng })),
        checkpoints,
      });
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [walkState, currentWalkId, distance, routePoints, checkpoints]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const avgSpeed = calculateAverageSpeed(distance, elapsed);
  const selectedBooking = availableBookings.find((b) => b.id === selectedBookingId);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: walkState === 'idle' ? 'Nova šetnja' : 'Šetnja u tijeku',
          headerLeft: () =>
            walkState !== 'active' ? (
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.text} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Status Badge */}
        {walkState !== 'idle' && (
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                walkState === 'active' && styles.statusBadgeActive,
                walkState === 'paused' && styles.statusBadgePaused,
                walkState === 'finished' && styles.statusBadgeFinished,
              ]}
            >
              <View
                style={[
                  styles.statusIndicator,
                  walkState === 'active' && styles.indicatorActive,
                  walkState === 'paused' && styles.indicatorPaused,
                  walkState === 'finished' && styles.indicatorFinished,
                ]}
              />
              <Text style={styles.statusText}>
                {walkState === 'active'
                  ? 'U tijeku'
                  : walkState === 'paused'
                  ? 'Pauzirana'
                  : 'Završena'}
              </Text>
            </View>
            {selectedBooking && (
              <Text style={styles.petName}>
                {selectedBooking.pet?.species === 'dog'
                  ? '🐕'
                  : selectedBooking.pet?.species === 'cat'
                  ? '🐈'
                  : '🐾'}{' '}
                {selectedBooking.pet?.name}
              </Text>
            )}
          </View>
        )}

        {/* Stats - veliki za easy reading */}
        {walkState !== 'idle' && (
          <View style={styles.statsContainer}>
            <StatCard
              icon="time"
              value={formatWalkDuration(elapsed)}
              label="Trajanje"
              color="#3B82F6"
            />
            <StatCard
              icon="location"
              value={`${distance.toFixed(2)} km`}
              label="Udaljenost"
              color={Colors.primary}
            />
            <StatCard
              icon="speedometer"
              value={`${avgSpeed} km/h`}
              label="Prosj. brzina"
              color="#10B981"
            />
          </View>
        )}

        {/* Booking selektor (samo kad je idle) */}
        {walkState === 'idle' && (
          <>
            {availableBookings.length === 0 ? (
              <View style={styles.noBookingsContainer}>
                <Ionicons name="paw" size={64} color={Colors.muted} />
                <Text style={styles.noBookingsTitle}>Nemate aktivnih rezervacija</Text>
                <Text style={styles.noBookingsText}>
                  Prihvatite rezervaciju da biste mogli započeti šetnju.
                </Text>
              </View>
            ) : (
              <BookingSelector
                bookings={availableBookings}
                selectedId={selectedBookingId}
                onSelect={setSelectedBookingId}
              />
            )}
          </>
        )}

        {/* Mapa */}
        {walkState !== 'idle' && (
          <SimpleMap
            routePoints={routePoints}
            checkpoints={checkpoints}
            currentLocation={currentLocation}
          />
        )}

        {/* Checkpointi */}
        {checkpoints.length > 0 && (
          <View style={styles.checkpointsSection}>
            <Text style={styles.checkpointsTitle}>
              Checkpointi ({checkpoints.length})
            </Text>
            <View style={styles.checkpointsList}>
              {checkpoints.map((cp, i) => (
                <View key={i} style={styles.checkpointTag}>
                  <Text style={styles.checkpointTagEmoji}>{cp.emoji}</Text>
                  <Text style={styles.checkpointTagLabel}>{cp.label}</Text>
                  <Text style={styles.checkpointTagTime}>
                    {new Date(cp.time).toLocaleTimeString('hr-HR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Kontrole */}
        {walkState === 'idle' && availableBookings.length > 0 && (
          <TouchableOpacity style={styles.startButton} onPress={startWalk}>
            <Ionicons name="play" size={24} color={Colors.white} />
            <Text style={styles.startButtonText}>Započni šetnju</Text>
          </TouchableOpacity>
        )}

        {walkState !== 'idle' && walkState !== 'finished' && (
          <View style={styles.controlsContainer}>
            {walkState === 'active' ? (
              <TouchableOpacity style={styles.controlButton} onPress={pauseWalk}>
                <Ionicons name="pause" size={24} color={Colors.text} />
                <Text style={styles.controlButtonText}>Pauziraj</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.controlButton, styles.controlButtonGreen]}
                onPress={resumeWalk}
              >
                <Ionicons name="play" size={24} color={Colors.white} />
                <Text style={[styles.controlButtonText, styles.controlButtonTextWhite]}>
                  Nastavi
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.controlButton, styles.controlButtonBlue]}
              onPress={() => setShowCheckpointModal(true)}
            >
              <Ionicons name="flag" size={24} color={Colors.white} />
              <Text style={[styles.controlButtonText, styles.controlButtonTextWhite]}>
                Checkpoint
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.controlButtonRed]}
              onPress={() => setShowEndModal(true)}
            >
              <Ionicons name="stop" size={24} color={Colors.white} />
              <Text style={[styles.controlButtonText, styles.controlButtonTextWhite]}>
                Završi
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Finished summary */}
        {walkState === 'finished' && (
          <View style={styles.finishedCard}>
            <Text style={styles.finishedEmoji}>🎉</Text>
            <Text style={styles.finishedTitle}>Šetnja završena!</Text>
            <View style={styles.finishedStats}>
              <View style={styles.finishedStat}>
                <Text style={styles.finishedValue}>{formatWalkDuration(elapsed)}</Text>
                <Text style={styles.finishedLabel}>Trajanje</Text>
              </View>
              <View style={styles.finishedStat}>
                <Text style={styles.finishedValue}>{distance.toFixed(2)} km</Text>
                <Text style={styles.finishedLabel}>Udaljenost</Text>
              </View>
              <View style={styles.finishedStat}>
                <Text style={styles.finishedValue}>{avgSpeed} km/h</Text>
                <Text style={styles.finishedLabel}>Brzina</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.backToListButton}
              onPress={() => router.push('/walk')}
            >
              <Ionicons name="list" size={20} color={Colors.white} />
              <Text style={styles.backToListText}>Povijest šetnji</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <CheckpointModal
        visible={showCheckpointModal}
        onClose={() => setShowCheckpointModal(false)}
        onSelect={addCheckpoint}
      />

      <EndWalkModal
        visible={showEndModal}
        onClose={() => setShowEndModal(false)}
        onEnd={endWalkHandler}
        duration={elapsed}
        distance={distance}
      />
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
  backButton: {
    padding: 8,
  },

  // Loading
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

  // Status
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.card,
  },
  statusBadgeActive: {
    backgroundColor: Colors.success + '20',
  },
  statusBadgePaused: {
    backgroundColor: '#FBBF24' + '20',
  },
  statusBadgeFinished: {
    backgroundColor: Colors.muted + '20',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    backgroundColor: Colors.muted,
  },
  indicatorActive: {
    backgroundColor: Colors.success,
  },
  indicatorPaused: {
    backgroundColor: '#FBBF24',
  },
  indicatorFinished: {
    backgroundColor: Colors.muted,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
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
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Booking Selector
  selectorContainer: {
    padding: 16,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  bookingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bookingOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingDates: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // No bookings
  noBookingsContainer: {
    alignItems: 'center',
    padding: 48,
  },
  noBookingsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noBookingsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Map
  mapContainer: {
    padding: 16,
    paddingTop: 8,
  },
  mapPlaceholder: {
    height: 280,
    backgroundColor: Colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  mapStats: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  checkpointList: {
    marginTop: 16,
    alignItems: 'center',
  },
  checkpointTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  checkpointRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkpointItem: {
    fontSize: 24,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.success + '15',
    borderRadius: 12,
  },
  locationText: {
    fontSize: 12,
    color: Colors.success,
    marginLeft: 4,
    fontFamily: 'monospace',
  },

  // Checkpoints section
  checkpointsSection: {
    padding: 16,
    paddingTop: 8,
  },
  checkpointsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  checkpointsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkpointTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  checkpointTagEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  checkpointTagLabel: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
    marginRight: 6,
  },
  checkpointTagTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  // Controls
  controlsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  controlButtonGreen: {
    backgroundColor: Colors.success,
  },
  controlButtonBlue: {
    backgroundColor: '#3B82F6',
  },
  controlButtonRed: {
    backgroundColor: Colors.error,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  controlButtonTextWhite: {
    color: Colors.white,
  },

  // Start button
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },

  // Finished card
  finishedCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    alignItems: 'center',
  },
  finishedEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  finishedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 16,
  },
  finishedStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  finishedStat: {
    alignItems: 'center',
  },
  finishedValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#15803D',
  },
  finishedLabel: {
    fontSize: 12,
    color: '#22C55E',
  },
  backToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  backToListText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  checkpointGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkpointButton: {
    width: '30%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkpointEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  checkpointLabel: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  endButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
