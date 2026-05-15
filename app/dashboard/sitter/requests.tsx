import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import { getProviderBookingRequests, type ProviderBookingRequestSummary } from '../../../lib/api/booking-requests';
import { BookingRequestList, BookingRequestScreenShell } from '../../../components/booking-requests/BookingRequestMobile';
import { PetParkEmptyState, PetParkInfoCallout } from '../../../components/petpark/PetParkDesign';

export default function SitterRequestsScreen() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<ProviderBookingRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isLoggedIn) return;
    setError(null);
    try {
      setRequests(await getProviderBookingRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upite trenutno nije moguće učitati.');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  if (authLoading || loading) {
    return <BookingRequestScreenShell title="Upiti za usluge"><ActivityIndicator color={Colors.orangePrimary} /></BookingRequestScreenShell>;
  }

  if (!isLoggedIn) {
    return (
      <BookingRequestScreenShell title="Upiti za usluge">
        <PetParkEmptyState title="Prijava je potrebna" body="Prijavi se za pregled upita vezanih uz tvoje usluge." actionLabel="Prijava" onAction={() => router.push('/login')} />
      </BookingRequestScreenShell>
    );
  }

  return (
    <BookingRequestScreenShell title="Upiti za usluge">
      <PetParkInfoCallout body="Kontakt vlasnika prikazuje se samo za upite vezane uz tvoje usluge. Akcije ne stvaraju rezervaciju, ne zaključavaju kalendar i ne pokreću plaćanje." tone="sage" />
      {error ? <PetParkInfoCallout title="Greška" body={error} tone="danger" /> : null}
      <BookingRequestList requests={requests} role="provider" onRefresh={load} />
    </BookingRequestScreenShell>
  );
}
