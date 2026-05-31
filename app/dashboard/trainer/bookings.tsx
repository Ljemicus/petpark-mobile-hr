// Trainer Bookings Screen
// Prikazuje sve rezervacije s filterima i akcijama

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import type { TrainerBooking } from '../../../lib/trainer-dashboard-types';
import { STATUS_COLORS, STATUS_LABELS } from '../../../lib/trainer-dashboard-types';
import {
  getTrainerBookings,
  updateTrainerBookingStatus,
} from '../../../lib/trainer-dashboard-db';

type BookingFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Booking card komponenta
function BookingCard({
  booking,
  onStatusChange,
  updating,
}: {
  booking: TrainerBooking;
  onStatusChange: (id: string, status: 'confirmed' | 'rejected' | 'completed' | 'cancelled') => void;
  updating: boolean;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const statusStyle = STATUS_COLORS[booking.status];

  const handleConfirm = () => {
    Alert.alert(
      'Potvrdi rezervaciju',
      'Jeste li sigurni da želite potvrditi ovu rezervaciju?',
      [
        { text: 'Odustani', style: 'cancel' },
        { text: 'Potvrdi', onPress: () => onStatusChange(booking.id, 'confirmed') },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Odbij rezervaciju',
      'Jeste li sigurni da želite odbiti ovu rezervaciju?',
      [
        { text: 'Odustani', style: 'cancel' },
        { text: 'Odbij', style: 'destructive', onPress: () => onStatusChange(booking.id, 'rejected') },
      ]
    );
  };

  const handleComplete = () => {
    Alert.alert(
      'Označi kao završeno',
      'Jeste li sigurni da želite označiti ovu rezervaciju kao završenu?',
      [
        { text: 'Odustani', style: 'cancel' },
        { text: 'Završi', onPress: () => onStatusChange(booking.id, 'completed') },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Otkaži rezervaciju',
      'Jeste li sigurni da želite otkazati ovu rezervaciju?',
      [
        { text: 'Odustani', style: 'cancel' },
        { text: 'Otkaži', style: 'destructive', onPress: () => onStatusChange(booking.id, 'cancelled') },
      ]
    );
  };

  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingClientInfo}>
          {booking.client?.avatar_url ? (
            <Image source={{ uri: booking.client.avatar_url }} style={styles.clientAvatar} />
          ) : (
            <View style={styles.clientAvatarPlaceholder}>
              <Text style={styles.clientAvatarText}>
                {booking.client?.name?.charAt(0) || 'K'}
              </Text>
            </View>
          )}
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{booking.client?.name || 'Klijent'}</Text>
            <Text style={styles.clientEmail}>{booking.client?.email}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {STATUS_LABELS[booking.status]}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="school-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {booking.program?.name || 'Trening'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {booking.start_time?.slice(0, 5)} — {booking.end_time?.slice(0, 5)}
          </Text>
        </View>
        {booking.pet_name && (
          <View style={styles.detailRow}>
            <Ionicons name="paw-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Ljubimac: {booking.pet_name}</Text>
          </View>
        )}
        {booking.note && (
          <View style={styles.noteContainer}>
            <Ionicons name="document-text-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.noteText}>{booking.note}</Text>
          </View>
        )}
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.bookingPrice}>{booking.program?.price || 0}€</Text>
        
        {/* Action buttons based on status */}
        <View style={styles.actionButtons}>
          {booking.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={handleConfirm}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#FFF" />
                    <Text style={styles.actionButtonText}>Potvrdi</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleReject}
                disabled={updating}
              >
                <Ionicons name="close" size={18} color="#EF4444" />
                <Text style={styles.rejectButtonText}>Odbij</Text>
              </TouchableOpacity>
            </>
          )}
          {booking.status === 'confirmed' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleComplete}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={18} color="#FFF" />
                    <Text style={styles.actionButtonText}>Završi</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={updating}
              >
                <Ionicons name="ban" size={18} color="#6B7280" />
                <Text style={styles.cancelButtonText}>Otkaži</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

// Filter button komponenta
function FilterButton({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );
}

export default function TrainerBookingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useAuth();
  const [bookings, setBookings] = useState<TrainerBooking[]>([]);
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const userId = session?.user?.id;

  // Dohvati rezervacije
  const fetchBookings = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await getTrainerBookings(userId);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [fetchBookings]);

  // Update booking status
  const handleStatusChange = async (
    bookingId: string,
    status: 'confirmed' | 'rejected' | 'completed' | 'cancelled'
  ) => {
    setUpdatingId(bookingId);
    try {
      const success = await updateTrainerBookingStatus(bookingId, status);
      if (success) {
        await fetchBookings();
      } else {
        Alert.alert('Greška', 'Nije moguće ažurirati status rezervacije');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      Alert.alert('Greška', 'Došlo je do pogreške');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  // Count by status
  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rezervacije</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterButton
            label="Sve"
            count={counts.all}
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterButton
            label="Na čekanju"
            count={counts.pending}
            active={filter === 'pending'}
            onPress={() => setFilter('pending')}
          />
          <FilterButton
            label="Potvrđene"
            count={counts.confirmed}
            active={filter === 'confirmed'}
            onPress={() => setFilter('confirmed')}
          />
          <FilterButton
            label="Završene"
            count={counts.completed}
            active={filter === 'completed'}
            onPress={() => setFilter('completed')}
          />
          <FilterButton
            label="Otkazane"
            count={counts.cancelled}
            active={filter === 'cancelled'}
            onPress={() => setFilter('cancelled')}
          />
        </ScrollView>
      </View>

      {/* Bookings list */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="calendar-outline" size={48} color={Colors.muted} />
            </View>
            <Text style={styles.emptyStateTitle}>
              {filter === 'all' ? 'Nema rezervacija' : 'Nema rezervacija u ovom statusu'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {filter === 'all'
                ? 'Postavite svoj raspored dostupnosti kako bi klijenti mogli rezervirati termine'
                : 'Pokušajte odabrati drugi filter'}
            </Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onStatusChange={handleStatusChange}
                updating={updatingId === booking.id}
              />
            ))}
          </View>
        )}
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filters: {
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
    color: '#FFF',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    paddingVertical: 60,
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
    marginBottom: 16,
  },
  bookingClientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  clientAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  clientInfo: {
    marginLeft: 12,
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  clientEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
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
  bookingDetails: {
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
  },
  noteText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookingPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  completeButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
