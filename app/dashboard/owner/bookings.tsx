// Owner Dashboard - Bookings Screen
// Prikazuje sve rezervacije s detaljima i akcijama

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import InlineErrorState from '../../../components/shared/InlineErrorState';
import type { Booking, BookingStatus } from '../../../lib/owner-dashboard-types';
import { SERVICE_LABELS, STATUS_LABELS, STATUS_COLORS } from '../../../lib/owner-dashboard-types';
import {
  getOwnerBookings,
  cancelBooking,
  getReviewedBookingIds,
  createReview,
  getOwnerDashboardLastError,
  clearOwnerDashboardLastError,
} from '../../../lib/owner-dashboard-db';

// Booking Card komponenta
function BookingCard({
  booking,
  onCancel,
  onReview,
  onMessage,
  onPress,
}: {
  booking: Booking;
  onCancel: (bookingId: string) => void;
  onReview: (booking: Booking) => void;
  onMessage: (booking: Booking) => void;
  onPress: (bookingId: string) => void;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const statusStyle = STATUS_COLORS[booking.status];
  const canCancel = booking.status === 'pending' || booking.status === 'accepted';
  const canReview = booking.status === 'completed';

  return (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => onPress(booking.id)}
      activeOpacity={0.9}
    >
      {/* Header */}
      <View style={styles.bookingHeader}>
        <View style={styles.sitterInfo}>
          {booking.sitter?.avatar_url ? (
            <Image source={{ uri: booking.sitter.avatar_url }} style={styles.sitterAvatar} />
          ) : (
            <View style={styles.sitterAvatarPlaceholder}>
              <Text style={styles.sitterAvatarText}>
                {booking.sitter?.name?.charAt(0) || 'S'}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.sitterName}>{booking.sitter?.name || 'Sitter'}</Text>
            <Text style={styles.serviceType}>
              {SERVICE_LABELS[booking.service_type]}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {STATUS_LABELS[booking.status]}
          </Text>
        </View>
      </View>

      {/* Pet info */}
      <View style={styles.petInfoRow}>
        <Ionicons name="paw-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.petInfoText}>Ljubimac: {booking.pet?.name || 'Nepoznato'}</Text>
      </View>

      {/* Dates */}
      <View style={styles.datesContainer}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.dateText}>Početak: {formatDate(booking.start_date)}</Text>
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
          <Text style={styles.dateText}>Kraj: {formatDate(booking.end_date)}</Text>
        </View>
      </View>

      {/* Note */}
      {booking.note && (
        <View style={styles.noteContainer}>
          <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.noteText}>{booking.note}</Text>
        </View>
      )}

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Ukupno:</Text>
        <Text style={styles.priceValue}>{booking.total_price}€</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => onMessage(booking)}
        >
          <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
          <Text style={[styles.actionText, { color: Colors.primary }]}>Poruka</Text>
        </TouchableOpacity>

        {canCancel && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onCancel(booking.id)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Otkaži</Text>
          </TouchableOpacity>
        )}

        {canReview && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => onReview(booking)}
          >
            <Ionicons name="star" size={18} color="#FBBF24" />
            <Text style={[styles.actionText, { color: '#FBBF24' }]}>Recenzija</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Review Modal
function ReviewModal({
  visible,
  onClose,
  onSubmit,
  booking,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  booking: Booking | null;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (visible) {
      setRating(5);
      setComment('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!comment.trim()) {
      Alert.alert('Greška', 'Unesite komentar');
      return;
    }
    onSubmit(rating, comment.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ostavi recenziju</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.reviewSubtitle}>
            {booking?.sitter?.name || 'Sitter'} - {booking?.pet?.name || 'Ljubimac'}
          </Text>

          {/* Star Rating */}
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color="#FBBF24"
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Komentar</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={comment}
            onChangeText={setComment}
            placeholder="Kako je protekla usluga?"
            placeholderTextColor={Colors.muted}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Pošalji recenziju</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Glavni komponent
export default function BookingsScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const params = useLocalSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const userId = session?.user?.id;

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      clearOwnerDashboardLastError();
      setLoadError(null);
      const [bookingsData, reviewedData] = await Promise.all([
        getOwnerBookings(userId),
        getReviewedBookingIds(userId),
      ]);
      setBookings(bookingsData);
      setReviewedIds(reviewedData);
      const ownerError = getOwnerDashboardLastError();
      if (ownerError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } finally {
      setLoading(false);
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

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Potvrda otkazivanja',
      'Jeste li sigurni da želite otkazati ovu rezervaciju?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Otkaži',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelBooking(bookingId);
            if (success) {
              Alert.alert('Uspjeh', 'Rezervacija otkazana');
              fetchData();
            } else {
              Alert.alert('Greška', 'Otkazivanje nije uspjelo');
            }
          },
        },
      ]
    );
  };

  const handleReview = (booking: Booking) => {
    if (reviewedIds.includes(booking.id)) {
      Alert.alert('Info', 'Već ste ostavili recenziju za ovu rezervaciju');
      return;
    }
    setSelectedBooking(booking);
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!userId || !selectedBooking) return;

    const success = await createReview({
      booking_id: selectedBooking.id,
      owner_id: userId,
      sitter_id: selectedBooking.sitter_id,
      rating,
      comment,
    });

    if (success) {
      setReviewModalVisible(false);
      setReviewedIds([...reviewedIds, selectedBooking.id]);
      Alert.alert('Uspjeh', 'Recenzija poslana!');
    } else {
      Alert.alert('Greška', 'Slanje recenzije nije uspjelo');
    }
  };

  const handleMessage = (booking: Booking) => {
    router.push({
      pathname: '/dashboard/owner/messages',
      params: { partnerId: booking.sitter_id, bookingId: booking.id },
    });
  };

  const handleBookingPress = (bookingId: string) => {
    router.push({
      pathname: '/booking/[id]',
      params: { id: bookingId },
    });
  };

  // Filtriraj rezervacije
  const filteredBookings =
    filter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === filter);

  // Status filteri
  const filters: { value: BookingStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Sve' },
    { value: 'pending', label: 'Na čekanju' },
    { value: 'accepted', label: 'Prihvaćene' },
    { value: 'completed', label: 'Završene' },
    { value: 'cancelled', label: 'Otkazane' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moje rezervacije</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterButton,
              filter === f.value && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f.value && styles.filterButtonTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loadError ? <InlineErrorState message={loadError} onRetry={fetchData} /> : null}
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="calendar-outline" size={60} color={Colors.muted} />
            </View>
            <Text style={styles.emptyStateTitle}>Nema rezervacija</Text>
            <Text style={styles.emptyStateSubtitle}>
              {filter === 'all'
                ? 'Pretražite sittere i napravite svoju prvu rezervaciju'
                : 'Nema rezervacija s odabranim filtrom'}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Text style={styles.emptyStateButtonText}>Pretraži sittere</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                onReview={handleReview}
                onMessage={handleMessage}
                onPress={handleBookingPress}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
        booking={selectedBooking}
      />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  filterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  scrollContent: {
    padding: 16,
  },
  bookingsList: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sitterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sitterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sitterAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sitterAvatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  sitterName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  serviceType: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  petInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  petInfoText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  datesContainer: {
    gap: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  noteText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  messageButton: {
    backgroundColor: '#FFF7ED',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
  },
  reviewButton: {
    backgroundColor: '#FEF9C3',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyStateButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
