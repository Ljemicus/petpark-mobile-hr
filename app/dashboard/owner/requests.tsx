import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import { getOwnerBookingRequests, type OwnerBookingRequestSummary } from '../../../lib/api/booking-requests';
import { BookingRequestList, BookingRequestScreenShell } from '../../../components/booking-requests/BookingRequestMobile';
import { PetParkEmptyState, PetParkInfoCallout } from '../../../components/petpark/PetParkDesign';

export default function OwnerRequestsScreen() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<OwnerBookingRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      setRequests(await getOwnerBookingRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upite trenutno nije moguće učitati.');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (authLoading || loading) {
    return <BookingRequestScreenShell title="Moji upiti"><ActivityIndicator color={Colors.orangePrimary} /></BookingRequestScreenShell>;
  }

  if (!isLoggedIn) {
    return (
      <BookingRequestScreenShell title="Moji upiti">
        <PetParkEmptyState title="Prijava je potrebna" body="Prijavi se za pregled upita koje si poslao/la pružateljima." actionLabel="Prijava" onAction={() => router.push('/login')} />
      </BookingRequestScreenShell>
    );
  }

  return (
    <BookingRequestScreenShell title="Moji upiti">
      <PetParkInfoCallout body="Ovo su upiti, ne potvrđene rezervacije. Nema plaćanja ni zaključavanja termina." tone="orange" />
      {error ? <PetParkInfoCallout title="Greška" body={error} tone="danger" /> : null}
      <BookingRequestList requests={requests} role="owner" onRefresh={onRefresh} />
    </BookingRequestScreenShell>
  );
}
