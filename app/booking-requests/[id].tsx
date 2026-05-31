import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../lib/colors';
import { useAuth } from '../../lib/auth-context';
import {
  getOwnerBookingRequests,
  getProviderBookingRequests,
  type OwnerBookingRequestSummary,
  type ProviderBookingRequestSummary,
} from '../../lib/api/booking-requests';
import { BookingRequestDetail, BookingRequestScreenShell } from '../../components/booking-requests/BookingRequestMobile';
import { PetParkEmptyState, PetParkInfoCallout } from '../../components/petpark/PetParkDesign';

type Role = 'owner' | 'provider';

export default function BookingRequestDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; role?: Role }>();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [ownerRequests, setOwnerRequests] = useState<OwnerBookingRequestSummary[]>([]);
  const [providerRequests, setProviderRequests] = useState<ProviderBookingRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role: Role = params.role === 'provider' ? 'provider' : 'owner';
  const requestId = String(params.id || '');

  const load = useCallback(async () => {
    if (!isLoggedIn || !requestId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (role === 'provider') setProviderRequests(await getProviderBookingRequests());
      else setOwnerRequests(await getOwnerBookingRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upit trenutno nije moguće učitati.');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, requestId, role]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const request = useMemo(() => {
    return role === 'provider'
      ? providerRequests.find((item) => item.id === requestId)
      : ownerRequests.find((item) => item.id === requestId);
  }, [ownerRequests, providerRequests, requestId, role]);

  if (authLoading || loading) {
    return <BookingRequestScreenShell title="Detalji upita"><ActivityIndicator color={Colors.orangePrimary} /></BookingRequestScreenShell>;
  }

  if (!isLoggedIn) {
    return (
      <BookingRequestScreenShell title="Detalji upita">
        <PetParkEmptyState title="Prijava je potrebna" body="Prijavi se za pregled detalja upita." actionLabel="Prijava" onAction={() => router.push('/login')} />
      </BookingRequestScreenShell>
    );
  }

  if (error) {
    return <BookingRequestScreenShell title="Detalji upita"><PetParkInfoCallout title="Greška" body={error} tone="danger" /></BookingRequestScreenShell>;
  }

  if (!request) {
    return <BookingRequestScreenShell title="Detalji upita"><PetParkEmptyState title="Upit nije pronađen" body="Upit nije dostupan za ovaj račun ili je uklonjen." /></BookingRequestScreenShell>;
  }

  return <BookingRequestScreenShell title="Detalji upita"><BookingRequestDetail request={request} role={role} onChanged={load} /></BookingRequestScreenShell>;
}
