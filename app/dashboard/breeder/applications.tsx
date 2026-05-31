// Breeder Applications Screen
// Prikazuje upite od potencijalnih kupaca

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import type { Application } from '../../../lib/breeder-dashboard-types';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '../../../lib/breeder-dashboard-types';
import {
  getBreederApplications,
  updateApplicationStatus,
  getBreederProfile,
} from '../../../lib/breeder-dashboard-db';

export default function BreederApplicationsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');

  const userId = session?.user?.id;

  const fetchApplications = useCallback(async () => {
    if (!userId) return;

    try {
      const profile = await getBreederProfile(userId);
      if (!profile) {
        setLoading(false);
        return;
      }

      const data = await getBreederApplications(profile.id);
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  }, [fetchApplications]);

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    const success = await updateApplicationStatus(applicationId, newStatus);
    if (success) {
      setApplications(applications.map(a => 
        a.id === applicationId ? { ...a, status: newStatus } : a
      ));
    }
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const renderApplicationCard = (application: Application) => {
    const statusStyle = APPLICATION_STATUS_COLORS[application.status];
    const initials = application.from_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2);

    return (
      <View key={application.id} style={styles.applicationCard}>
        <View style={styles.applicationHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{application.from_name}</Text>
              <Text style={styles.breedInterest}>{application.breed_interest}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {APPLICATION_STATUS_LABELS[application.status]}
            </Text>
          </View>
        </View>

        <View style={styles.messageContainer}>
          <Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.messageText}>{application.message}</Text>
        </View>

        <View style={styles.contactRow}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleEmail(application.from_email)}
          >
            <Ionicons name="mail-outline" size={18} color={Colors.primary} />
            <Text style={styles.contactText}>{application.from_email}</Text>
          </TouchableOpacity>
          {application.from_phone && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handlePhone(application.from_phone!)}
            >
              <Ionicons name="call-outline" size={18} color={Colors.success} />
              <Text style={styles.contactText}>{application.from_phone}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.dateText}>
          Primljeno: {new Date(application.created_at).toLocaleDateString('hr-HR')}
        </Text>

        <View style={styles.actionsRow}>
          {application.status === 'new' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.replyButton]}
                onPress={() => handleStatusChange(application.id, 'replied')}
              >
                <Ionicons name="checkmark" size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Označi kao odgovoreno</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.archiveButton]}
                onPress={() => handleStatusChange(application.id, 'archived')}
              >
                <Ionicons name="archive-outline" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </>
          )}
          {application.status === 'replied' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.archiveButton, { flex: 1 }]}
              onPress={() => handleStatusChange(application.id, 'archived')}
            >
              <Ionicons name="archive-outline" size={18} color={Colors.textSecondary} />
              <Text style={[styles.actionButtonText, { color: Colors.textSecondary }]}>
                Arhiviraj
              </Text>
            </TouchableOpacity>
          )}
          {application.status === 'archived' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.replyButton, { flex: 1 }]}
              onPress={() => handleStatusChange(application.id, 'new')}
            >
              <Ionicons name="refresh" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Vrati u nove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Upiti</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Svi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'new' && styles.filterButtonActive]}
          onPress={() => setFilter('new')}
        >
          <Text style={[styles.filterText, filter === 'new' && styles.filterTextActive]}>
            Novi
          </Text>
          {applications.filter(a => a.status === 'new').length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {applications.filter(a => a.status === 'new').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'replied' && styles.filterButtonActive]}
          onPress={() => setFilter('replied')}
        >
          <Text style={[styles.filterText, filter === 'replied' && styles.filterTextActive]}>
            Odgovoreni
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredApplications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="mail-outline" size={48} color={Colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'Još nemate upita' : 'Nema upita u ovoj kategoriji'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all'
                ? 'Kada kupci pošalju upit, vidjet ćete ga ovdje'
                : 'Pokušajte s drugom kategorijom'}
            </Text>
          </View>
        ) : (
          <View style={styles.applicationsList}>
            {filteredApplications.map(renderApplicationCard)}
          </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFF',
  },
  filterBadge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  applicationsList: {
    gap: 16,
  },
  applicationCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  breedInterest: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  contactRow: {
    gap: 8,
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  replyButton: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  archiveButton: {
    backgroundColor: '#F3F4F6',
    width: 44,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  bottomPadding: {
    height: 40,
  },
});
