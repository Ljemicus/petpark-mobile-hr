// Breeder Dashboard - Glavni screen
// Prikazuje pregled: statistika, brze akcije, legla, upiti, recenzije

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import type {
  BreederProfile,
  Litter,
  Application,
  BreederReview,
  BreederStats,
} from '../../../lib/breeder-dashboard-types';
import {
  LITTER_STATUS_LABELS,
  APPLICATION_STATUS_LABELS,
  LITTER_STATUS_COLORS,
  APPLICATION_STATUS_COLORS,
} from '../../../lib/breeder-dashboard-types';
import {
  getBreederProfile,
  getBreederLitters,
  getBreederApplications,
  getBreederReviews,
  getBreederStats,
  getUnreadMessagesCount,
} from '../../../lib/breeder-dashboard-db';

const { width } = Dimensions.get('window');

// Stat card komponenta
function StatCard({
  icon,
  label,
  value,
  color,
  subValue,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  subValue?: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
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

// Litter card komponenta
function LitterCard({
  litter,
  onPress,
}: {
  litter: Litter;
  onPress: () => void;
}) {
  const statusStyle = LITTER_STATUS_COLORS[litter.status];

  return (
    <TouchableOpacity style={styles.litterCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.litterHeader}>
        <View>
          <Text style={styles.litterBreed}>{litter.breed}</Text>
          <Text style={styles.litterDate}>
            {litter.birth_date
              ? `Rođeni: ${new Date(litter.birth_date).toLocaleDateString('hr-HR')}`
              : litter.expected_date
              ? `Očekivano: ${new Date(litter.expected_date).toLocaleDateString('hr-HR')}`
              : 'Datum još nije poznat'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {LITTER_STATUS_LABELS[litter.status]}
          </Text>
        </View>
      </View>
      <View style={styles.litterFooter}>
        <View style={styles.litterStats}>
          <View style={styles.litterStat}>
            <Ionicons name="paw" size={16} color={Colors.textSecondary} />
            <Text style={styles.litterStatText}>{litter.total_puppies} štenca</Text>
          </View>
          <View style={styles.litterStat}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.litterStatText}>{litter.available_count} dostupno</Text>
          </View>
        </View>
        <Text style={styles.litterPrice}>
          {litter.price_from}€ - {litter.price_to}€
        </Text>
      </View>
      {litter.fci_registered && (
        <View style={styles.fciBadge}>
          <Ionicons name="shield-checkmark" size={12} color={Colors.primary} />
          <Text style={styles.fciText}>FCI registrirano</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Application card komponenta
function ApplicationCard({
  application,
  onPress,
}: {
  application: Application;
  onPress: () => void;
}) {
  const statusStyle = APPLICATION_STATUS_COLORS[application.status];
  const initials = application.from_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <TouchableOpacity style={styles.applicationCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.applicationHeader}>
        <View style={styles.applicationUser}>
          <View style={styles.applicationAvatar}>
            <Text style={styles.applicationAvatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.applicationName}>{application.from_name}</Text>
            <Text style={styles.applicationBreed}>{application.breed_interest}</Text>
          </View>
        </View>
        {application.status === 'new' && (
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {APPLICATION_STATUS_LABELS[application.status]}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.applicationMessage}>
        <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.applicationMessageText} numberOfLines={2}>
          "{application.message}"
        </Text>
      </View>
      <Text style={styles.applicationDate}>
        {new Date(application.created_at).toLocaleDateString('hr-HR')}
      </Text>
    </TouchableOpacity>
  );
}

// Review card komponenta
function ReviewCard({
  review,
}: {
  review: BreederReview;
}) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>
            {review.reviewer_name.charAt(0)}
          </Text>
        </View>
        <View>
          <Text style={styles.reviewName}>{review.reviewer_name}</Text>
          <View style={styles.reviewStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= review.rating ? 'star' : 'star-outline'}
                size={12}
                color={Colors.star}
              />
            ))}
          </View>
        </View>
      </View>
      {review.comment && (
        <Text style={styles.reviewComment} numberOfLines={2}>
          "{review.comment}"
        </Text>
      )}
    </View>
  );
}

// Glavni komponent
export default function BreederDashboardScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<BreederProfile | null>(null);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reviews, setReviews] = useState<BreederReview[]>([]);
  const [stats, setStats] = useState<BreederStats | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;
  const userName = user?.name?.split(' ')[0] || 'Uzgajivač';

  // Provjeri je li breeder nov (nepotpuni profil)
  const isNewBreeder = !profile || !profile.bio || profile.breeds.length === 0;

  // Dohvati podatke
  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      // Get breeder profile first
      const profileData = await getBreederProfile(userId);
      
      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch all other data in parallel using breeder id
      const [littersData, applicationsData, reviewsData, statsData, unreadData] = await Promise.all([
        getBreederLitters(profileData.id),
        getBreederApplications(profileData.id),
        getBreederReviews(profileData.id),
        getBreederStats(profileData.id),
        getUnreadMessagesCount(userId),
      ]);

      setLitters(littersData);
      setApplications(applicationsData);
      setReviews(reviewsData);
      setStats(statsData);
      setUnreadCount(unreadData);
    } catch (err) {
      console.error('Error fetching breeder dashboard data:', err);
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

  // Izračunaj prosječnu ocjenu
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  // Filtriraj aktivna legla i nove upite
  const activeLitters = litters.filter((l) => l.status === 'available');
  const newApplications = applications.filter((a) => a.status === 'new');

  // Prikaži samo prvih 2 legla i 3 upita na dashboardu
  const displayedLitters = litters.slice(0, 2);
  const displayedApplications = applications.slice(0, 3);
  const displayedReviews = reviews.slice(0, 3);

  // Ako breeder nema profil
  if (!loading && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.noProfileContainer}>
          <View style={styles.noProfileIcon}>
            <Ionicons name="paw" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.noProfileTitle}>Postanite uzgajivač</Text>
          <Text style={styles.noProfileSubtitle}>
            Još nemate profil uzgajivača. Kreirajte ga da biste mogli upravljati
            svojim leglima i primati upite od potencijalnih kupaca.
          </Text>
          <TouchableOpacity style={styles.noProfileButton}>
            <Text style={styles.noProfileButtonText}>Kreiraj profil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
              Upravljaj svojom uzgajivačnicom i leglima
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/dashboard/breeder/messages')}
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

        {/* New Breeder Banner */}
        {isNewBreeder && (
          <View style={styles.newBreederBanner}>
            <View style={styles.newBreederIcon}>
              <Ionicons name="star" size={24} color="#FFF" />
            </View>
            <View style={styles.newBreederContent}>
              <Text style={styles.newBreederTitle}>Dovršite svoj profil</Text>
              <Text style={styles.newBreederSubtitle}>
                Dodajte opis, pasmine i iskustvo da biste privukli više kupaca
              </Text>
            </View>
            <TouchableOpacity style={styles.newBreederButton}>
              <Text style={styles.newBreederButtonText}>Uredi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="paw"
            label="Aktivna legla"
            value={stats?.activeLitters || 0}
            color="#F97316"
          />
          <StatCard
            icon="checkmark-circle"
            label="Dostupni štenci"
            value={stats?.availablePuppies || 0}
            color="#10B981"
          />
          <StatCard
            icon="mail"
            label="Novi upiti"
            value={stats?.newApplications || 0}
            color="#3B82F6"
          />
          <StatCard
            icon="star"
            label="Ocjena"
            value={avgRating}
            color="#F59E0B"
            subValue={`${reviews.length} recenzija`}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brze akcije</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionButton
              icon="add-circle"
              label="Dodaj leglo"
              onPress={() => router.push('/dashboard/breeder/litters?action=add')}
              color="#F97316"
            />
            <QuickActionButton
              icon="paw"
              label="Moja legla"
              onPress={() => router.push('/dashboard/breeder/litters')}
              color="#3B82F6"
            />
            <QuickActionButton
              icon="mail"
              label="Upiti"
              onPress={() => router.push('/dashboard/breeder/applications')}
              color="#10B981"
            />
            <QuickActionButton
              icon="document-text"
              label="Dokumenti"
              onPress={() => router.push('/dashboard/breeder/documents')}
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Profile Status Card */}
        {profile && (
          <View style={styles.profileStatusCard}>
            <View style={styles.profileStatusHeader}>
              <View style={styles.verificationBadge}>
                <View
                  style={[
                    styles.verificationDot,
                    {
                      backgroundColor:
                        profile.verification_status === 'verified'
                          ? Colors.success
                          : profile.verification_status === 'pending'
                          ? '#F59E0B'
                          : Colors.error,
                    },
                  ]}
                />
                <Text style={styles.verificationText}>
                  {profile.verification_status === 'verified'
                    ? 'Verificiran profil'
                    : profile.verification_status === 'pending'
                    ? 'Na čekanju verifikacije'
                    : 'Profil nije verificiran'}
                </Text>
              </View>
            </View>
            <View style={styles.completenessRow}>
              <Text style={styles.completenessLabel}>Kompletnost profila</Text>
              <Text style={styles.completenessValue}>
                {profile.profile_completeness_pct || 0}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${profile.profile_completeness_pct || 0}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* New Applications Section */}
        {newApplications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Novi upiti ({newApplications.length})
              </Text>
            </View>
            <View style={styles.applicationsContainer}>
              {newApplications.slice(0, 2).map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onPress={() => router.push(`/dashboard/breeder/applications?id=${application.id}`)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Litters Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Moja legla</Text>
            <TouchableOpacity onPress={() => router.push('/dashboard/breeder/litters')}>
              <Text style={styles.seeAllText}>Pogledaj sve</Text>
            </TouchableOpacity>
          </View>

          {litters.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="paw-outline" size={40} color={Colors.muted} />
              </View>
              <Text style={styles.emptyStateTitle}>Još nemate legla</Text>
              <Text style={styles.emptyStateSubtitle}>
                Dodajte svoje prvo leglo da biste ga prikazali potencijalnim kupcima
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/dashboard/breeder/litters?action=add')}
              >
                <Text style={styles.emptyStateButtonText}>Dodaj leglo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.littersContainer}>
              {displayedLitters.map((litter) => (
                <LitterCard
                  key={litter.id}
                  litter={litter}
                  onPress={() => router.push(`/dashboard/breeder/litters?id=${litter.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Applications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nedavni upiti</Text>
            <TouchableOpacity onPress={() => router.push('/dashboard/breeder/applications')}>
              <Text style={styles.seeAllText}>Pogledaj sve</Text>
            </TouchableOpacity>
          </View>

          {applications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="mail-outline" size={40} color={Colors.muted} />
              </View>
              <Text style={styles.emptyStateTitle}>Još nemate upita</Text>
              <Text style={styles.emptyStateSubtitle}>
                Kada kupci pošalju upit, vidjet ćete ga ovdje
              </Text>
            </View>
          ) : (
            <View style={styles.applicationsContainer}>
              {displayedApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onPress={() => router.push(`/dashboard/breeder/applications?id=${application.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recenzije</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reviewsScroll}
            >
              {displayedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Savjeti za uspjeh</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Ionicons name="camera" size={20} color={Colors.primary} />
              <Text style={styles.tipText}>
                Dodajte što više fotografija vašeg legla
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="time" size={20} color={Colors.primary} />
              <Text style={styles.tipText}>
                Odgovarajte na upite u roku 24 sata
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="refresh" size={20} color={Colors.primary} />
              <Text style={styles.tipText}>
                Ažurirajte dostupnost štenca redovito
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="star" size={20} color={Colors.primary} />
              <Text style={styles.tipText}>
                Zatražite recenzije od zadovoljnih kupaca
              </Text>
            </View>
          </View>
        </View>

        {/* Messages Section Preview */}
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.messagesBanner}
            onPress={() => router.push('/dashboard/breeder/messages')}
            activeOpacity={0.9}
          >
            <View style={styles.messagesBannerContent}>
              <View style={styles.messagesIconContainer}>
                <Ionicons name="chatbubble" size={24} color="#FFF" />
              </View>
              <View style={styles.messagesTextContainer}>
                <Text style={styles.messagesTitle}>
                  Imate {unreadCount} nepročitanih poruka
                </Text>
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
  newBreederBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  newBreederIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBreederContent: {
    flex: 1,
    marginLeft: 14,
  },
  newBreederTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  newBreederSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  newBreederButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newBreederButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
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
  statSubValue: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
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
  profileStatusCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
  },
  profileStatusHeader: {
    marginBottom: 12,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  completenessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  completenessLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  completenessValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  littersContainer: {
    gap: 12,
  },
  litterCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  litterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  litterBreed: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  litterDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  litterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  litterStats: {
    flexDirection: 'row',
    gap: 16,
  },
  litterStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  litterStatText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  litterPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  fciBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  fciText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  applicationsContainer: {
    gap: 12,
  },
  applicationCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  applicationUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  applicationAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicationAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  applicationName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  applicationBreed: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 12,
    marginTop: 2,
  },
  applicationMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    gap: 8,
  },
  applicationMessageText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    fontStyle: 'italic',
  },
  applicationDate: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 10,
    textAlign: 'right',
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
  reviewsScroll: {
    paddingRight: 16,
    gap: 12,
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    width: 250,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 10,
    fontStyle: 'italic',
  },
  tipsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
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
  noProfileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noProfileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  noProfileTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  noProfileSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  noProfileButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  noProfileButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
