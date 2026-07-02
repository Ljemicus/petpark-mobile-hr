// Owner Dashboard - Glavni screen
// Prikazuje pregled: statistika, brze akcije, ljubimci, rezervacije

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import InlineErrorState from '../../../components/shared/InlineErrorState';
import type { Pet, Booking } from '../../../lib/owner-dashboard-types';
import { SERVICE_LABELS, STATUS_LABELS, STATUS_COLORS, SPECIES_LABELS } from '../../../lib/owner-dashboard-types';
import {
  getPetsByOwner,
  getOwnerBookings,
  getUnreadMessagesCount,
  getOwnerDashboardLastError,
  clearOwnerDashboardLastError,
} from '../../../lib/owner-dashboard-db';

const { width } = Dimensions.get('window');

// Stat card komponenta
function StatCard({
  icon,
  label,
  value,
  color,
  delay = 0,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  delay?: number;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

// Quick action button
function QuickActionButton({
  icon,
  label,
  onPress,
  color = Colors.primary,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// Pet card komponenta
function PetCard({ pet, onPress }: { pet: Pet; onPress: () => void }) {
  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'dog':
        return 'paw';
      case 'cat':
        return 'logo-octocat';
      default:
        return 'paw-outline';
    }
  };

  const getSpeciesGradient = (species: string) => {
    switch (species) {
      case 'dog':
        return ['#F97316', '#FB923C'];
      case 'cat':
        return ['#14B8A6', '#2DD4BF'];
      default:
        return ['#8B5CF6', '#A78BFA'];
    }
  };

  return (
    <TouchableOpacity style={styles.petCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.petCardContent}>
        {pet.photo_url ? (
          <Image source={{ uri: pet.photo_url }} style={styles.petImage} />
        ) : (
          <View
            style={[
              styles.petPlaceholder,
              { backgroundColor: getSpeciesGradient(pet.species)[0] },
            ]}
          >
            <Ionicons name={getSpeciesIcon(pet.species) as any} size={28} color="#FFF" />
          </View>
        )}
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>
            {SPECIES_LABELS[pet.species]}
            {pet.breed ? ` · ${pet.breed}` : ''}
          </Text>
          {(pet.age || pet.weight) && (
            <View style={styles.petMeta}>
              {pet.age && (
                <View style={styles.petMetaBadge}>
                  <Text style={styles.petMetaText}>{pet.age} god.</Text>
                </View>
              )}
              {pet.weight && (
                <View style={styles.petMetaBadge}>
                  <Text style={styles.petMetaText}>{pet.weight} kg</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
      {pet.special_needs && (
        <View style={styles.specialNeedsBanner}>
          <Ionicons name="alert-circle" size={14} color="#92400E" />
          <Text style={styles.specialNeedsText}>{pet.special_needs}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Booking card komponenta
function BookingCard({
  booking,
  onPress,
}: {
  booking: Booking;
  onPress: () => void;
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
    <TouchableOpacity style={styles.bookingCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingSitterInfo}>
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
              {SERVICE_LABELS[booking.service_type]} · {booking.pet?.name}
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
      <View style={styles.bookingFooter}>
        <Text style={styles.bookingDates}>
          {formatDate(booking.start_date)} — {formatDate(booking.end_date)}
        </Text>
        <Text style={styles.bookingPrice}>{booking.total_price}€</Text>
      </View>
    </TouchableOpacity>
  );
}

// Glavni komponent
export default function OwnerDashboardScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const userId = session?.user?.id;
  const userName = user?.name?.split(' ')[0] || 'Korisnik';

  // Dohvati podatke
  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      clearOwnerDashboardLastError();
      setLoadError(null);
      const [petsData, bookingsData, unreadData] = await Promise.all([
        getPetsByOwner(userId),
        getOwnerBookings(userId),
        getUnreadMessagesCount(userId),
      ]);

      setPets(petsData);
      setBookings(bookingsData);
      setUnreadCount(unreadData);
      const ownerError = getOwnerDashboardLastError();
      if (ownerError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Izračunaj statistiku
  const activeBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'accepted'
  );
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalSpent = completedBookings.reduce((sum, b) => sum + b.total_price, 0);

  // Prikaži samo prvih 3 ljubimca i rezervacija na dashboardu
  const displayedPets = pets.slice(0, 3);
  const displayedBookings = bookings.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bok, {userName}!</Text>
            <Text style={styles.subtitle}>
              Upravljaj svojim ljubimcima i rezervacijama
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/messages')}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {loadError ? <InlineErrorState message={loadError} onRetry={fetchData} /> : null}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="paw"
            label="Ljubimaca"
            value={pets.length}
            color="#F97316"
          />
          <StatCard
            icon="time-outline"
            label="Aktivne rez."
            value={activeBookings.length}
            color="#3B82F6"
          />
          <StatCard
            icon="calendar-outline"
            label="Završene rez."
            value={completedBookings.length}
            color="#10B981"
          />
          <StatCard
            icon="star-outline"
            label="Potrošeno"
            value={`${totalSpent}€`}
            color="#8B5CF6"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brze akcije</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionButton
              icon="add-circle"
              label="Dodaj ljubimca"
              onPress={() => router.push('/dashboard/owner/pets?action=add')}
              color="#F97316"
            />
            <QuickActionButton
              icon="search"
              label="Pretraži sittere"
              onPress={() => router.push('/(tabs)/search')}
              color="#3B82F6"
            />
            <QuickActionButton
              icon="calendar"
              label="Rezervacije"
              onPress={() => router.push('/dashboard/owner/bookings')}
              color="#10B981"
            />
            <QuickActionButton
              icon="heart"
              label="Udomljavanje"
              onPress={() => router.push('/lost-pets')}
              color="#EC4899"
            />
            <QuickActionButton
              icon="id-card"
              label="Pet Passport"
              onPress={() => router.push('/pet-passport')}
              color="#8B5CF6"
            />
            <QuickActionButton
              icon="walk"
              label="Šetnje"
              onPress={() => router.push('/walk')}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* My Pets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Moji ljubimci</Text>
            <TouchableOpacity onPress={() => router.push('/dashboard/owner/pets')}>
              <Text style={styles.seeAllText}>Pogledaj sve</Text>
            </TouchableOpacity>
          </View>

          {pets.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="paw-outline" size={40} color={Colors.muted} />
              </View>
              <Text style={styles.emptyStateTitle}>Nemate dodanih ljubimaca</Text>
              <Text style={styles.emptyStateSubtitle}>
                Dodajte svog prvog ljubimca da biste mogli napraviti rezervaciju
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/dashboard/owner/pets?action=add')}
              >
                <Text style={styles.emptyStateButtonText}>Dodaj ljubimca</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.petsContainer}>
              {displayedPets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onPress={() => router.push(`/pet-passport/${pet.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bookings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rezervacije</Text>
            <TouchableOpacity onPress={() => router.push('/dashboard/owner/bookings')}>
              <Text style={styles.seeAllText}>Pogledaj sve</Text>
            </TouchableOpacity>
          </View>

          {bookings.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="calendar-outline" size={40} color={Colors.muted} />
              </View>
              <Text style={styles.emptyStateTitle}>Nemate rezervacija</Text>
              <Text style={styles.emptyStateSubtitle}>
                Pretražite sittere i napravite svoju prvu rezervaciju
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Text style={styles.emptyStateButtonText}>Pretraži sittere</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bookingsContainer}>
              {displayedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onPress={() => router.push(`/dashboard/owner/bookings?id=${booking.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Messages Section Preview */}
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.messagesBanner}
            onPress={() => router.push('/dashboard/owner/messages')}
            activeOpacity={0.9}
          >
            <View style={styles.messagesBannerContent}>
              <View style={styles.messagesIconContainer}>
                <Ionicons name="chatbubble" size={24} color="#FFF" />
              </View>
              <View style={styles.messagesTextContainer}>
                <Text style={styles.messagesTitle}>Imate {unreadCount} nepročitanih poruka</Text>
                <Text style={styles.messagesSubtitle}>Dotaknite za pregled</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Bottom padding */}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    width: (width - 40) / 2,
    borderLeftWidth: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    marginLeft: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    alignItems: 'center',
    width: (width - 56) / 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  petsContainer: {
    gap: 12,
  },
  petCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  petCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  petPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petInfo: {
    flex: 1,
    marginLeft: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  petBreed: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  petMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  petMetaBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  petMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  specialNeedsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  specialNeedsText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 6,
    flex: 1,
  },
  bookingsContainer: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
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
  },
  bookingSitterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sitterAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  sitterAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sitterAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  sitterName: {
    fontSize: 15,
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
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookingDates: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.card,
    borderRadius: 16,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 24,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  emptyStateButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  messagesBanner: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
  },
  messagesBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  messagesTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  messagesSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
});
