import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../lib/colors';
import InlineErrorState from '../../components/shared/InlineErrorState';
import {
  getBookingByIdWithSitterDetails,
  getBookingDbLastError,
  clearBookingDbLastError,
} from '../../lib/booking-db';
import type { Booking } from '../../lib/booking-types';
import { SERVICE_LABELS, SERVICE_EMOJI } from '../../lib/booking-types';

const AnimatedCircle = Animated.createAnimatedComponent(View);
const AnimatedIcon = Animated.createAnimatedComponent(View);

export default function BookingConfirmationScreen() {
  const { bookingId, status } = useLocalSearchParams<{
    bookingId: string;
    status: string;
  }>();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Animation values
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    loadBooking();
    startAnimations();
  }, [bookingId]);

  const startAnimations = () => {
    // Circle animation
    circleScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    circleOpacity.value = withTiming(1, { duration: 300 });

    // Icon animation
    iconScale.value = withDelay(
      200,
      withSpring(1, { damping: 10, stiffness: 150 })
    );

    // Content animation
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    contentTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));
  };

  const loadBooking = async () => {
    try {
      clearBookingDbLastError();
      setLoadError(null);
      const data = await getBookingByIdWithSitterDetails(bookingId!);
      setBooking(data);
      const bookingError = getBookingDbLastError();
      if (bookingError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } catch (err) {
      console.error('Error loading booking:', err);
      setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } finally {
      setLoading(false);
    }
  };

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isSuccess = status === 'success';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {loadError ? <InlineErrorState message={loadError} onRetry={loadBooking} /> : null}

        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <AnimatedCircle
            style={[
              styles.successCircle,
              circleAnimatedStyle,
              !isSuccess && styles.errorCircle,
            ]}
          >
            <AnimatedIcon style={iconAnimatedStyle}>
              <Ionicons
                name={isSuccess ? 'checkmark' : 'close'}
                size={60}
                color="#FFFFFF"
              />
            </AnimatedIcon>
          </AnimatedCircle>
        </View>

        <Animated.View style={[styles.textContent, contentAnimatedStyle]}>
          <Text style={styles.title}>
            {isSuccess ? 'Upit poslan!' : 'Došlo je do greške'}
          </Text>
          <Text style={styles.subtitle}>
            {isSuccess
              ? 'Vaš upit za rezervaciju uspješno je poslan čuvaru.'
              : 'Nismo uspjeli obraditi vašu rezervaciju. Pokušajte ponovno.'}
          </Text>

          {booking && isSuccess && (
            <View style={styles.bookingSummary}>
              <View style={styles.summaryRow}>
                <Ionicons name="person" size={18} color={Colors.primary} />
                <Text style={styles.summaryText}>
                  Čuvar: <Text style={styles.summaryValue}>{booking.sitter?.name}</Text>
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryEmoji}>{SERVICE_EMOJI[booking.service_type]}</Text>
                <Text style={styles.summaryText}>
                  Usluga: <Text style={styles.summaryValue}>{SERVICE_LABELS[booking.service_type]}</Text>
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="calendar" size={18} color={Colors.textSecondary} />
                <Text style={styles.summaryText}>
                  Od: <Text style={styles.summaryValue}>{formatDate(booking.start_date)}</Text>
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.summaryText}>
                  Do: <Text style={styles.summaryValue}>{formatDate(booking.end_date)}</Text>
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="cash" size={18} color={Colors.success} />
                <Text style={styles.summaryText}>
                  Ukupno: <Text style={styles.summaryPrice}>{booking.total_price.toFixed(2)}€</Text>
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={22} color={Colors.primary} />
            <Text style={styles.infoText}>
              {isSuccess
                ? 'Čuvar će pregledati vaš upit i odgovoriti u najkraćem mogućem roku. Pratite status rezervacije na svom dashboardu.'
                : 'Ako se problem nastavi, kontaktirajte našu podršku.'}
            </Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.buttonContainer, contentAnimatedStyle]}>
        {isSuccess ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/dashboard/owner/bookings')}
            >
              <Ionicons name="list" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Pogledaj rezervacije</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.secondaryButtonText}>Nastavi pretraživati</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Pokušaj ponovno</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.secondaryButtonText}>Početna</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  animationContainer: {
    marginBottom: 32,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  errorCircle: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
  },
  textContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  bookingSummary: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  summaryValue: {
    color: Colors.text,
    fontWeight: '600',
  },
  summaryPrice: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  summaryEmoji: {
    fontSize: 18,
    width: 18,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
