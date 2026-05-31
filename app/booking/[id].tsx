import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { useAuth } from '../../lib/auth-context';
import type { Booking, BookingStatus } from '../../lib/booking-types';
import {
  SERVICE_LABELS,
  SERVICE_EMOJI,
  STATUS_LABELS,
  STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  canCancelBooking,
  canPayBooking,
  SPECIES_LABELS,
} from '../../lib/booking-types';
import {
  getBookingByIdWithSitterDetails,
  cancelBooking,
} from '../../lib/booking-db';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const data = await getBookingByIdWithSitterDetails(id!);
      setBooking(data);
    } catch (err) {
      console.error('Error loading booking:', err);
      Alert.alert('Greška', 'Nije moguće učitati detalje rezervacije');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Otkazivanje rezervacije',
      'Jeste li sigurni da želite otkazati ovu rezervaciju?',
      [
        { text: 'Ne', style: 'cancel' },
        {
          text: 'Da, otkaži',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              const success = await cancelBooking(id!);
              if (success) {
                Alert.alert('Uspjeh', 'Rezervacija je otkazana');
                loadBooking();
              } else {
                Alert.alert('Greška', 'Nije moguće otkazati rezervaciju');
              }
            } catch (err) {
              Alert.alert('Greška', 'Došlo je do greške');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleMessage = () => {
    if (booking?.sitter_id) {
      router.push({
        pathname: '/dashboard/owner/messages',
        params: { partnerId: booking.sitter_id },
      });
    }
  };

  const handlePay = () => {
    if (booking) {
      router.push(`/payments/checkout?bookingId=${booking.id}`);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'accepted':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'completed':
        return 'star';
      case 'cancelled':
        return 'ban';
      default:
        return 'help-circle';
    }
  };

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

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>Rezervacija nije pronađena</Text>
          <Text style={styles.errorText}>
            Rezervacija koju tražite ne postoji ili nemate pristup
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Natrag</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = STATUS_COLORS[booking.status];
  const showCancelButton = canCancelBooking(booking.status);
  const showPayButton = canPayBooking(booking.status, booking.payment_status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalji rezervacije</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusColors.bg }]}>
          <View style={styles.statusRow}>
            <Ionicons
              name={getStatusIcon(booking.status)}
              size={24}
              color={statusColors.text}
            />
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusLabel, { color: statusColors.text }]}>
                Status rezervacije
              </Text>
              <Text style={[styles.statusValue, { color: statusColors.text }]}>
                {STATUS_LABELS[booking.status]}
              </Text>
            </View>
          </View>
          {booking.payment_status && (
            <View style={[styles.paymentBadge, { backgroundColor: statusColors.border }]}>
              <Text style={[styles.paymentText, { color: statusColors.text }]}>
                {PAYMENT_STATUS_LABELS[booking.payment_status]}
              </Text>
            </View>
          )}
        </View>

        {/* Sitter Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Čuvar</Text>
          <View style={styles.sitterCard}>
            <View style={styles.sitterAvatar}>
              {booking.sitter?.avatar_url ? (
                <Image source={{ uri: booking.sitter.avatar_url }} style={styles.sitterAvatarImage} />
              ) : (
                <Ionicons name="person" size={32} color={Colors.primary} />
              )}
            </View>
            <View style={styles.sitterInfo}>
              <Text style={styles.sitterName}>{booking.sitter?.name || 'Nepoznato'}</Text>
              <View style={styles.sitterLocation}>
                <Ionicons name="location" size={14} color={Colors.textSecondary} />
                <Text style={styles.sitterCity}>{booking.sitter?.city || 'Nepoznato'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
              <Ionicons name="chatbubble" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usluga</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailEmoji}>{SERVICE_EMOJI[booking.service_type]}</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Vrsta usluge</Text>
                <Text style={styles.detailValue}>{SERVICE_LABELS[booking.service_type]}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datumi</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Datum početka</Text>
                <Text style={styles.detailValue}>{formatDate(booking.start_date)}</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={22} color={Colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Datum završetka</Text>
                <Text style={styles.detailValue}>{formatDate(booking.end_date)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ljubimac</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.petAvatar}>
                <Ionicons
                  name={booking.pet?.species === 'cat' ? 'logo-octocat' : 'paw'}
                  size={24}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Ime</Text>
                <Text style={styles.detailValue}>
                  {booking.pet?.name || 'Nepoznato'}
                  {booking.pet?.species && ` (${SPECIES_LABELS[booking.pet.species]})`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Note */}
        {booking.note && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Napomene</Text>
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>{booking.note}</Text>
            </View>
          </View>
        )}

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cijena</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Osnovna cijena</Text>
              <Text style={styles.priceValue}>{booking.total_price.toFixed(2)}€</Text>
            </View>
            {booking.platform_fee && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Naknada platforme (10%)</Text>
                <Text style={styles.priceValue}>{booking.platform_fee.toFixed(2)}€</Text>
              </View>
            )}
            <View style={styles.priceDivider} />
            <View style={styles.priceRowTotal}>
              <Text style={styles.priceTotalLabel}>UKUPNO</Text>
              <Text style={styles.priceTotalValue}>{booking.total_price.toFixed(2)}€</Text>
            </View>
          </View>
        </View>

        {/* Booking ID */}
        <View style={styles.bookingIdContainer}>
          <Text style={styles.bookingIdLabel}>Broj rezervacije</Text>
          <Text style={styles.bookingId}>#{booking.id.slice(-8).toUpperCase()}</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {showPayButton && (
          <TouchableOpacity style={styles.payButton} onPress={handlePay}>
            <Ionicons name="card" size={20} color="#FFFFFF" />
            <Text style={styles.payButtonText}>Plati rezervaciju</Text>
          </TouchableOpacity>
        )}
        {showCancelButton && (
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.buttonDisabled]}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color={Colors.error} />
            ) : (
              <>
                <Ionicons name="close-circle" size={20} color={Colors.error} />
                <Text style={styles.cancelButtonText}>Otkaži rezervaciju</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  statusBanner: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTextContainer: {
    gap: 2,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  sitterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  sitterAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sitterAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  sitterInfo: {
    flex: 1,
  },
  sitterName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  sitterLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sitterCity: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  detailEmoji: {
    fontSize: 24,
    width: 24,
    textAlign: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  petAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  noteText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  priceCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  priceDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  priceRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  priceTotalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  bookingIdContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  bookingIdLabel: {
    fontSize: 12,
    color: Colors.muted,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actionContainer: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  payButton: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
