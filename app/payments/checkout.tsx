// Checkout Screen - Payment for bookings
// app/payments/checkout.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../lib/colors';
import {
  formatCurrency,
  calculatePlatformFee,
  calculateSitterPayout,
  createCheckoutSession,
} from '../../lib/payments';
import { PAYMENT_DISABLED_MESSAGE, PAYMENT_DISABLED_TITLE, PAYMENTS_ENABLED } from '../../lib/payments/config';
import type { Booking } from '../../lib/booking-types';
import { SERVICE_LABELS } from '../../lib/booking-types';

export default function CheckoutScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { session } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerReady, setProviderReady] = useState<boolean | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  async function fetchBooking() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          sitter:users!sitter_id(id, name, avatar_url),
          pet:pets(id, name, species)
        `)
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Rezervacija nije pronađena');

      setBooking(data as Booking);

      // Check provider Stripe status
      const { data: sitterProfile } = await supabase
        .from('sitter_profiles')
        .select('stripe_account_id, stripe_onboarding_complete')
        .eq('user_id', data.sitter_id)
        .single();

      setProviderReady(
        !!(sitterProfile?.stripe_account_id && sitterProfile?.stripe_onboarding_complete)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  }

  async function handlePay() {
    if (!PAYMENTS_ENABLED) {
      Alert.alert(PAYMENT_DISABLED_TITLE, PAYMENT_DISABLED_MESSAGE);
      return;
    }

    if (!booking || !session?.access_token) {
      Alert.alert('Greška', 'Niste prijavljeni');
      return;
    }

    if (!providerReady) {
      Alert.alert(
        'Plaćanje nije dostupno',
        'Čuvar još nije povezao Stripe račun. Kontaktirajte ga da poveže plaćanja.'
      );
      return;
    }

    setPaying(true);
    try {
      const result = await createCheckoutSession(booking.id, session.access_token);
      if (result?.url) {
        // Open Stripe checkout in browser
        const canOpen = await Linking.canOpenURL(result.url);
        if (canOpen) {
          await Linking.openURL(result.url);
          // Note: User will be redirected back to app via deep linking
        } else {
          throw new Error('Cannot open payment URL');
        }
      }
    } catch (err) {
      Alert.alert(
        'Greška pri plaćanju',
        err instanceof Error ? err.message : 'Pokušajte ponovo'
      );
    } finally {
      setPaying(false);
    }
  }

  function getStatusMessage() {
    if (!booking) return null;

    if (!PAYMENTS_ENABLED) {
      return { type: 'warning', message: PAYMENT_DISABLED_MESSAGE };
    }
    if (booking.payment_status === 'paid') {
      return { type: 'success', message: 'Rezervacija je već plaćena' };
    }
    if (booking.status !== 'accepted') {
      return {
        type: 'warning',
        message: `Rezervacija mora biti prihvaćena prije plaćanja. Status: ${booking.status}`,
      };
    }
    if (providerReady === false) {
      return {
        type: 'warning',
        message: 'Čuvar još nije povezao plaćanja. Online naplata trenutno nije dostupna.',
      };
    }
    return null;
  }

  const statusMessage = getStatusMessage();
  const totalAmount = booking?.total_price || 0;
  const platformFee = calculatePlatformFee(totalAmount);
  const sitterPayout = calculateSitterPayout(totalAmount);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Plaćanje' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Plaćanje' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Rezervacija nije pronađena'}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Natrag</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Plaćanje' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Plaćanje</Text>

        {/* Status Banner */}
        {statusMessage && (
          <View
            style={[
              styles.statusBanner,
              statusMessage.type === 'success' && styles.successBanner,
              statusMessage.type === 'warning' && styles.warningBanner,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                statusMessage.type === 'success' && styles.successText,
                statusMessage.type === 'warning' && styles.warningText,
              ]}
            >
              {statusMessage.message}
            </Text>
          </View>
        )}

        {/* Booking Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalji rezervacije</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Usluga</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {SERVICE_LABELS[booking.service_type] || booking.service_type}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Datum</Text>
            <Text style={styles.detailValue}>
              {new Date(booking.start_date).toLocaleDateString('hr-HR')} –{' '}
              {new Date(booking.end_date).toLocaleDateString('hr-HR')}
            </Text>
          </View>

          {booking.sitter?.name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Čuvar</Text>
              <Text style={styles.detailValue}>{booking.sitter.name}</Text>
            </View>
          )}

          {booking.pet?.name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ljubimac</Text>
              <Text style={styles.detailValue}>{booking.pet.name}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ukupno</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.feeLabel}>Naknada platforme (10%)</Text>
            <Text style={styles.feeValue}>{formatCurrency(platformFee)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.feeLabel}>Čuvar prima (90%)</Text>
            <Text style={styles.feeValue}>{formatCurrency(sitterPayout)}</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{PAYMENTS_ENABLED ? 'Što slijedi nakon plaćanja?' : 'Plaćanje uskoro'}</Text>
          <Text style={styles.infoText}>{PAYMENTS_ENABLED ? '1. Otvara se siguran Stripe checkout' : 'Upit i dogovor s pružateljem usluge rade normalno.'}</Text>
          <Text style={styles.infoText}>{PAYMENTS_ENABLED ? '2. Nakon uspješnog plaćanja rezervacija je potvrđena' : 'Online naplata ostaje isključena dok plaćanja ne odobrimo.'}</Text>
          <Text style={styles.infoText}>{PAYMENTS_ENABLED ? '3. Potvrdu možete vidjeti na svom dashboardu' : 'Ne pokreću se live ni sandbox transakcije.'}</Text>
        </View>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Text style={styles.securityText}>{PAYMENTS_ENABLED ? '🔒 Sigurno plaćanje putem Stripe-a' : '🔒 Plaćanje je trenutno isključeno'}</Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            (paying ||
              !PAYMENTS_ENABLED ||
              booking.payment_status === 'paid' ||
              booking.status !== 'accepted' ||
              providerReady === false) &&
              styles.payButtonDisabled,
          ]}
          onPress={handlePay}
          disabled={
            paying ||
            !PAYMENTS_ENABLED ||
            booking.payment_status === 'paid' ||
            booking.status !== 'accepted' ||
            providerReady === false
          }
        >
          {paying ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.payButtonText}>
              {!PAYMENTS_ENABLED
                ? 'Plaćanje uskoro'
                : booking.payment_status === 'paid'
                ? 'Plaćeno'
                : providerReady === false
                ? 'Plaćanje trenutno nije dostupno'
                : `Plati ${formatCurrency(totalAmount)}`}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Odustani</Text>
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
  scrollContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  statusBanner: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
  },
  warningBanner: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#065F46',
  },
  warningText: {
    color: '#92400E',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  detailValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  feeLabel: {
    color: Colors.muted,
    fontSize: 13,
  },
  feeValue: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  infoBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  securityBadge: {
    alignItems: 'center',
    marginBottom: 16,
  },
  securityText: {
    color: Colors.success,
    fontSize: 13,
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonDisabled: {
    backgroundColor: Colors.muted,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});
