// Sitter Dashboard - Bookings Screen
// Prikazuje sve rezervacije s mogućnošću upravljanja statusom

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
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import type { Booking, PetUpdate } from '../../../lib/sitter-dashboard-types';
import { SERVICE_LABELS, STATUS_LABELS, STATUS_COLORS } from '../../../lib/sitter-dashboard-types';
import {
  getSitterBookings,
  updateBookingStatus,
  createPetUpdate,
} from '../../../lib/sitter-dashboard-db';

type BookingFilter = 'all' | 'pending' | 'accepted' | 'completed';

// Booking card s akcijama
function BookingCard({
  booking,
  onUpdateStatus,
  onSendUpdate,
  isPending = false,
}: {
  booking: Booking;
  onUpdateStatus: (id: string, status: 'accepted' | 'rejected') => void;
  onSendUpdate: (id: string) => void;
  isPending?: boolean;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const statusStyle = STATUS_COLORS[booking.status];
  const isUpcoming =
    booking.status === 'accepted' && new Date(booking.start_date) >= new Date();

  return (
    <View style={[styles.bookingCard, isPending && styles.pendingCard]}>
      {/* Header s vlasnikom i statusom */}
      <View style={styles.bookingHeader}>
        <View style={styles.ownerInfo}>
          {booking.owner?.avatar_url ? (
            <Image source={{ uri: booking.owner.avatar_url }} style={styles.ownerAvatar} />
          ) : (
            <View style={styles.ownerAvatarPlaceholder}>
              <Text style={styles.ownerAvatarText}>
                {booking.owner?.name?.charAt(0) || 'V'}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.ownerName}>{booking.owner?.name || 'Vlasnik'}</Text>
            <Text style={styles.ownerEmail}>{booking.owner?.email}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {STATUS_LABELS[booking.status]}
          </Text>
        </View>
      </View>

      {/* Detalji rezervacije */}
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="paw" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Ljubimac: </Text>
            {booking.pet?.name} ({booking.pet?.species === 'dog' ? 'Pas' : booking.pet?.species === 'cat' ? 'Mačka' : 'Ostalo'})
            {booking.pet?.breed && ` · ${booking.pet.breed}`}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="briefcase" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Usluga: </Text>
            {SERVICE_LABELS[booking.service_type]}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Termin: </Text>
            {formatDate(booking.start_date)} — {formatDateShort(booking.end_date)}
          </Text>
        </View>

        {booking.address && (
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              <Text style={styles.detailLabel}>Adresa: </Text>
              {booking.address}
            </Text>
          </View>
        )}

        {booking.pet?.special_needs && (
          <View style={[styles.detailRow, styles.specialNeedsRow]}>
            <Ionicons name="alert-circle" size={16} color="#92400E" />
            <Text style={styles.specialNeedsText}>
              <Text style={styles.detailLabel}>Posebne potrebe: </Text>
              {booking.pet.special_needs}
            </Text>
          </View>
        )}

        {booking.note && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Napomena vlasnika:</Text>
            <Text style={styles.noteText}>"{booking.note}"</Text>
          </View>
        )}

        {booking.message && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Poruka:</Text>
            <Text style={styles.noteText}>"{booking.message}"</Text>
          </View>
        )}
      </View>

      {/* Cijena */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Ukupno:</Text>
        <Text style={styles.priceValue}>{booking.total_price}€</Text>
      </View>

      {/* Akcije */}
      {isPending && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => onUpdateStatus(booking.id, 'accepted')}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Prihvati</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => onUpdateStatus(booking.id, 'rejected')}
          >
            <Ionicons name="close-circle" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Odbij</Text>
          </TouchableOpacity>
        </View>
      )}

      {isUpcoming && (
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => onSendUpdate(booking.id)}
        >
          <Ionicons name="camera" size={18} color={Colors.primary} />
          <Text style={styles.updateButtonText}>Pošalji ažuriranje</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Glavni komponent
export default function SitterBookingsScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const params = useLocalSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [updateCaption, setUpdateCaption] = useState('');
  const [updateEmoji, setUpdateEmoji] = useState('🐾');
  const [sendingUpdate, setSendingUpdate] = useState(false);

  const userId = session?.user?.id;

  // Emoji opcije
  const emojiOptions = ['😊', '🐾', '🐶', '🐱', '❤️', '🏃‍♂️', '😴', '🍽️', '☀️', '🌧️'];

  // Dohvati rezervacije
  const fetchBookings = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await getSitterBookings(userId);
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

  // Provjeri parametre za otvaranje specifične rezervacije
  useEffect(() => {
    if (params.id) {
      // Scroll to or highlight specific booking
      console.log('Opening booking:', params.id);
    }
  }, [params.id]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [fetchBookings]);

  // Ažuriraj status rezervacije
  const handleUpdateStatus = async (bookingId: string, status: 'accepted' | 'rejected') => {
    const action = status === 'accepted' ? 'prihvatiti' : 'odbiti';
    
    Alert.alert(
      'Potvrda',
      `Jeste li sigurni da želite ${action} ovu rezervaciju?`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Potvrdi',
          style: status === 'accepted' ? 'default' : 'destructive',
          onPress: async () => {
            const success = await updateBookingStatus(bookingId, status);
            if (success) {
              Alert.alert('Uspjeh', `Rezervacija je ${status === 'accepted' ? 'prihvaćena' : 'odbijena'}`);
              fetchBookings();
            } else {
              Alert.alert('Greška', 'Došlo je do greške pri ažuriranju statusa');
            }
          },
        },
      ]
    );
  };

  // Otvori modal za slanje ažuriranja
  const handleOpenUpdateModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setUpdateCaption('');
    setUpdateEmoji('🐾');
    setUpdateModalVisible(true);
  };

  // Pošalji ažuriranje
  const handleSendUpdate = async () => {
    if (!updateCaption.trim()) {
      Alert.alert('Greška', 'Unesite opis ažuriranja');
      return;
    }

    setSendingUpdate(true);
    const update = await createPetUpdate({
      booking_id: selectedBookingId,
      sitter_id: userId!,
      type: 'text',
      emoji: updateEmoji,
      caption: updateCaption,
      photo_url: null,
    });

    setSendingUpdate(false);
    if (update) {
      Alert.alert('Uspjeh', 'Ažuriranje poslano! Vlasnik će biti obaviješten.');
      setUpdateModalVisible(false);
    } else {
      Alert.alert('Greška', 'Došlo je do greške pri slanju ažuriranja');
    }
  };

  // Filtriraj rezervacije
  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  // Grupiraj rezervacije
  const pendingBookings = filteredBookings.filter((b) => b.status === 'pending');
  const upcomingBookings = filteredBookings.filter(
    (b) => b.status === 'accepted' && new Date(b.start_date) >= new Date()
  );
  const pastBookings = filteredBookings.filter(
    (b) => b.status === 'completed' || b.status === 'rejected' || b.status === 'cancelled'
  );

  // Broj rezervacija po filteru
  const getFilterCount = (f: BookingFilter) => {
    if (f === 'all') return bookings.length;
    return bookings.filter((b) => b.status === f).length;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'pending', 'accepted', 'completed'] as BookingFilter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === f && styles.filterButtonTextActive,
                ]}
              >
                {f === 'all' && `Sve (${getFilterCount('all')})`}
                {f === 'pending' && `Na čekanju (${getFilterCount('pending')})`}
                {f === 'accepted' && `Prihvaćene (${getFilterCount('accepted')})`}
                {f === 'completed' && `Završene (${getFilterCount('completed')})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings list */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="calendar-outline" size={60} color={Colors.muted} />
            </View>
            <Text style={styles.emptyStateTitle}>Nema rezervacija</Text>
            <Text style={styles.emptyStateSubtitle}>
              {filter === 'all'
                ? 'Kada vlasnici rezerviraju vaše usluge, vidjet ćete ih ovdje'
                : 'Nema rezervacija s odabranim filtrom'}
            </Text>
          </View>
        ) : (
          <>
            {/* Pending bookings */}
            {filter !== 'completed' && pendingBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <View style={styles.pulseDot} />
                  Novi zahtjevi ({pendingBookings.length})
                </Text>
                {pendingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onUpdateStatus={handleUpdateStatus}
                    onSendUpdate={handleOpenUpdateModal}
                    isPending={true}
                  />
                ))}
              </View>
            )}

            {/* Upcoming bookings */}
            {filter !== 'completed' && upcomingBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                  Nadolazeće rezervacije ({upcomingBookings.length})
                </Text>
                {upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onUpdateStatus={handleUpdateStatus}
                    onSendUpdate={handleOpenUpdateModal}
                  />
                ))}
              </View>
            )}

            {/* Past/Other bookings */}
            {pastBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Povijest rezervacija</Text>
                {pastBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onUpdateStatus={handleUpdateStatus}
                    onSendUpdate={handleOpenUpdateModal}
                  />
                ))}
              </View>
            )}

            {/* Ostale rezervacije koje ne ulaze u gornje kategorije */}
            {filteredBookings
              .filter(
                (b) =>
                  !pendingBookings.includes(b) &&
                  !upcomingBookings.includes(b) &&
                  !pastBookings.includes(b)
              )
              .map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onUpdateStatus={handleUpdateStatus}
                  onSendUpdate={handleOpenUpdateModal}
                />
              ))}
          </>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={updateModalVisible}
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pošalji ažuriranje</Text>
              <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Emoji:</Text>
            <View style={styles.emojiContainer}>
              {emojiOptions.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiButton,
                    updateEmoji === emoji && styles.emojiButtonActive,
                  ]}
                  onPress={() => setUpdateEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Poruka:</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Npr. Max se odlično zabavlja na šetnji! 🐕"
              value={updateCaption}
              onChangeText={setUpdateCaption}
            />

            <TouchableOpacity
              style={[styles.sendButton, sendingUpdate && styles.sendButtonDisabled]}
              onPress={handleSendUpdate}
              disabled={sendingUpdate}
            >
              <Text style={styles.sendButtonText}>
                {sendingUpdate ? 'Slanje...' : 'Pošalji ažuriranje'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#F3F4F6',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
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
  pendingCard: {
    borderWidth: 2,
    borderColor: '#FEF3C7',
    backgroundColor: '#FFFBEB',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  ownerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  ownerEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 12,
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
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  detailLabel: {
    fontWeight: '600',
  },
  specialNeedsRow: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
  },
  specialNeedsText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
  },
  noteContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: Colors.text,
    fontStyle: 'italic',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
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
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  updateButtonText: {
    color: Colors.primary,
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
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  bottomPadding: {
    height: 40,
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
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiButtonActive: {
    backgroundColor: Colors.primary,
  },
  emojiText: {
    fontSize: 24,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.card,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
