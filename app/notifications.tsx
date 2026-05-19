import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../lib/colors';
import { useAuth } from '../lib/auth-context';
import {
  bookingRequestIdFromTargetPath,
  getInAppNotifications,
  markNotificationRead,
  roleHintFromTargetPath,
  type BookingRequestNotificationSummary,
} from '../lib/api/notifications';
import { BookingRequestScreenShell } from '../components/booking-requests/BookingRequestMobile';
import { PetParkButton, PetParkEmptyState, PetParkInfoCallout, PetParkListCard, PetParkBadge } from '../components/petpark/PetParkDesign';

export default function NotificationsScreen() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<BookingRequestNotificationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setNotifications(await getInAppNotifications());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Obavijesti trenutno nije moguće učitati.');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  async function openNotification(notification: BookingRequestNotificationSummary) {
    if (!notification.readAt) {
      try {
        await markNotificationRead(notification.id);
        setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item));
      } catch {
        // Own-only backend check decides; opening still continues if target exists.
      }
    }
    const id = bookingRequestIdFromTargetPath(notification.targetPath);
    const role = roleHintFromTargetPath(notification.targetPath) || 'owner';
    if (id) router.push({ pathname: '/booking-requests/[id]', params: { id, role } } as any);
    else load();
  }

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function contextFor(notification: BookingRequestNotificationSummary) {
    const role = roleHintFromTargetPath(notification.targetPath);
    if (notification.type === 'booking_request_message') return role === 'provider' ? 'Nova poruka za upit za tvoju uslugu' : 'Nova poruka za tvoj upit';
    if (notification.type === 'booking_request_created') return 'Novi upit za uslugu';
    if (notification.type === 'booking_request_contacted') return 'Pružatelj je označio upit kao kontaktiran';
    if (notification.type === 'booking_request_closed') return 'Upit je zatvoren';
    if (notification.type === 'booking_request_withdrawn') return 'Vlasnik je povukao upit';
    return 'PetPark obavijest';
  }

  if (authLoading || loading) return <BookingRequestScreenShell title="Obavijesti"><ActivityIndicator color={Colors.orangePrimary} /></BookingRequestScreenShell>;

  if (!isLoggedIn) {
    return (
      <BookingRequestScreenShell title="Obavijesti">
        <PetParkEmptyState title="Prijava je potrebna" body="Prijavi se za pregled svojih PetPark obavijesti." actionLabel="Prijava" onAction={() => router.push('/login')} />
      </BookingRequestScreenShell>
    );
  }

  return (
    <BookingRequestScreenShell title="Obavijesti">
      <PetParkInfoCallout body="Ovo su samo in-app obavijesti. PetPark ovdje ne šalje SMS, WhatsApp, e-mail ni push poruke." tone="sage" />
      {error ? <PetParkInfoCallout title="Greška" body={error} tone="danger" /> : null}
      {!notifications.length ? <PetParkEmptyState title="Nema obavijesti" body="Kad se pojavi novi upit ili poruka, vidjet ćeš ih ovdje." onAction={load} actionLabel="Osvježi" /> : null}
      <View style={styles.list}>
        {notifications.map((notification) => (
          <PetParkListCard
            key={notification.id}
            title={notification.title}
            subtitle={notification.body}
            meta={`${contextFor(notification)} · ${notification.createdAtLabel}`}
            badge={notification.readAt ? <PetParkBadge label="Pročitano" tone="muted" /> : <PetParkBadge label="Novo" tone="teal" />}
            onPress={() => openNotification(notification)}
          />
        ))}
      </View>
      <PetParkButton title="Osvježi" variant="outline" onPress={refresh} loading={refreshing} />
    </BookingRequestScreenShell>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
});
