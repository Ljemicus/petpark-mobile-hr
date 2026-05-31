import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { useAuth } from '../../lib/auth-context';
import { getOwnerBookings } from '../../lib/owner-dashboard-db';
import type { Booking, BookingStatus } from '../../lib/owner-dashboard-types';
import {
  SERVICE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../../lib/owner-dashboard-types';

// Booking Card komponenta
function BookingCard({
  booking,
  onPress,
}: {
  booking: Booking;
  onPress: (bookingId: string) => void;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const statusStyle = STATUS_COLORS[booking.status];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(booking.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.sitterInfo}>
          <View style={styles.sitterAvatar}>
            {booking.sitter?.avatar_url ? (
              <Text style={styles.avatarText}>👤</Text>
            ) : (
              <Ionicons name="person" size={20} color={Colors.primary} />
            )}
          </View>
          <View>
            <Text style={styles.sitterName}>{booking.sitter?.name || 'Sitter'}</Text>
            <Text style={styles.serviceType}>{SERVICE_LABELS[booking.service_type]}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {STATUS_LABELS[booking.status]}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.dateText}>
            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
          </Text>
        </View>
        <View style={styles.petRow}>
          <Ionicons name="paw-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.petText}>{booking.pet?.name || 'Ljubimac'}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.priceLabel}>Ukupno:</Text>
        <Text style={styles.priceValue}>{booking.total_price.toFixed(2)}€</Text>
      </View>
    </TouchableOpacity>
  );
}

// Filter chips
const FILTERS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'Sve', value: 'all' },
  { label: 'Aktivne', value: 'pending' },
  { label: 'Prihvaćene', value: 'accepted' },
  { label: 'Završene', value: 'completed' },
];

export default function MyBookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'all'>('all');

  const loadBookings = useCallback(async (showLoading = true) => {
    if (!user) return;
    
    try {
      if (showLoading) setLoading(true);
      const data = await getOwnerBookings(user.id);
      setBookings(data);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings(false);
    setRefreshing(false);
  }, [loadBookings]);

  React.useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = bookings.filter((booking) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return booking.status === 'pending' || booking.status === 'accepted';
    return booking.status === activeFilter;
  });

  const handleBookingPress = (bookingId: string) => {
    router.push({
      pathname: '/booking/[id]',
      params: { id: bookingId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moje rezervacije</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                activeFilter === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter.value && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeFilter === 'all'
                ? 'Nemate rezervacija'
                : 'Nema rezervacija u ovoj kategoriji'}
            </Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'all'
                ? 'Kada rezervirate čuvara, ovdje će se pojaviti vaše rezervacije'
                : 'Pokušajte odabrati drugu kategoriju'}
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.browseButtonText}>Pretraži sittere</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={handleBookingPress}
              />
            ))}
            <View style={{ height: 20 }} />
          </>
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
    backgroundColor: Colors.card,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    backgroundColor: Colors.card,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sitterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sitterAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  sitterName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  serviceType: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: 16,
    gap: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petText: {
    fontSize: 14,
    color: Colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
