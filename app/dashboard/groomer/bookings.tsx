// Groomer Bookings Screen
// Prikazuje i upravlja terminima

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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import type { GroomerBooking, GroomerProfile } from '../../../lib/groomer-dashboard-types';
import {
  GROOMING_SERVICE_LABELS,
  GROOMER_BOOKING_STATUS_LABELS,
  STATUS_COLORS,
} from '../../../lib/groomer-dashboard-types';
import {
  getGroomerProfile,
  getGroomerBookings,
  updateGroomerBookingStatus,
} from '../../../lib/groomer-dashboard-db';

export default function GroomerBookingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useAuth();
  const [profile, setProfile] = useState<GroomerProfile | null>(null);
  const [bookings, setBookings] = useState<GroomerBooking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const userId = session?.user?.id;

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      const profileData = await getGroomerProfile(userId);
      if (profileData) {
        setProfile(profileData);
        const bookingsData = await getGroomerBookings(profileData.id);
        setBookings(bookingsData);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
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

  const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'rejected' | 'completed') => {
    setUpdatingId(bookingId);
    try {
      const success = await updateGroomerBookingStatus(bookingId, status);
      if (success) {
        await fetchData();
      } else {
        Alert.alert('Greška', 'Nije moguće ažurirati status termina');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      Alert.alert('Greška', 'Došlo je do pogreške');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'all') return true;
    return b.status === activeFilter;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status as keyof typeof STATUS_COLORS];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Termini</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(['all', 'pending', 'confirmed', 'completed'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter === 'all' && 'Svi'}
                {filter === 'pending' && 'Na čekanju'}
                {filter === 'confirmed' && 'Potvrđeni'}
                {filter === 'completed' && 'Završeni'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={Colors.muted} />
            <Text style={styles.emptyTitle}>Nema termina</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'Nemate nijedan termin u sustavu'
                : 'Nema termina s odabranim statusom'}
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => {
            const statusColor = getStatusColor(booking.status);
            return (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View style={styles.clientInfo}>
                    {booking.client?.avatar_url ? (
                      <Image source={{ uri: booking.client.avatar_url }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {booking.client?.name?.charAt(0) || 'K'}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.clientName}>{booking.client?.name || 'Klijent'}</Text>
                      <Text style={styles.clientEmail}>{booking.client?.email}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {GROOMER_BOOKING_STATUS_LABELS[booking.status]}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="cut-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>
                      {GROOMING_SERVICE_LABELS[booking.service]}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>
                      {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                    </Text>
                  </View>
                  {booking.pet_name && (
                    <View style={styles.detailRow}>
                      <Ionicons name="paw-outline" size={18} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>
                        {booking.pet_name} ({booking.pet_type === 'macka' ? 'Mačka' : 'Pas'})
                      </Text>
                    </View>
                  )}
                  {booking.note && (
                    <View style={styles.noteRow}>
                      <Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} />
                      <Text style={styles.noteText}>{booking.note}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Cijena:</Text>
                  <Text style={styles.price}>{booking.price}€</Text>
                </View>

                {booking.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleStatusUpdate(booking.id, 'rejected')}
                      disabled={updatingId === booking.id}
                    >
                      {updatingId === booking.id ? (
                        <Ionicons name="refresh" size={20} color={Colors.error} />
                      ) : (
                        <>
                          <Ionicons name="close-circle" size={20} color={Colors.error} />
                          <Text style={styles.rejectButtonText}>Odbij</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.confirmButton]}
                      onPress={() => handleStatusUpdate(booking.id, 'confirmed')}
                      disabled={updatingId === booking.id}
                    >
                      {updatingId === booking.id ? (
                        <Ionicons name="refresh" size={20} color="#FFF" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                          <Text style={styles.confirmButtonText}>Potvrdi</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {booking.status === 'confirmed' && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleStatusUpdate(booking.id, 'completed')}
                    disabled={updatingId === booking.id}
                  >
                    <Ionicons name="checkmark-done-circle" size={20} color={Colors.primary} />
                    <Text style={styles.completeButtonText}>Označi kao završeno</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
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
  filterContainer: {
    paddingVertical: 8,
  },
  filterScroll: {
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
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
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
  },
  bookingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  clientEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    gap: 10,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noteText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    fontStyle: 'italic',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  rejectButtonText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  completeButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  bottomPadding: {
    height: 40,
  },
});
