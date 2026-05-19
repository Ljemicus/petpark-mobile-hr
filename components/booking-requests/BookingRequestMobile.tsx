import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../lib/colors';
import {
  getBookingRequestMessages,
  sendBookingRequestMessage,
  updateBookingRequestStatus,
  withdrawBookingRequest,
  type BookingRequestEventSummary,
  type BookingRequestMessage,
  type BookingRequestStatus,
  type OwnerBookingRequestSummary,
  type ProviderBookingRequestSummary,
} from '../../lib/api/booking-requests';
import { PetParkBadge, PetParkButton, PetParkCard, PetParkEmptyState, PetParkInfoCallout, PetParkListCard, PetParkStatusChip } from '../petpark/PetParkDesign';

type Role = 'owner' | 'provider';
type RequestSummary = OwnerBookingRequestSummary | ProviderBookingRequestSummary;

const statusCopy: Record<BookingRequestStatus, { owner: string; provider: string }> = {
  pending: {
    owner: 'Upit je poslan. Pružatelj ga može pregledati i odgovoriti.',
    provider: 'Novi upit čeka tvoj odgovor. Možeš ga označiti kontaktiranim ili zatvoriti bez potvrde rezervacije.',
  },
  contacted: {
    owner: 'Pružatelj je označio da je kontaktirao vlasnika.',
    provider: 'Owner je označen kao kontaktiran. Sljedeći korak je ručni dogovor ili zatvaranje upita.',
  },
  closed: {
    owner: 'Upit je zatvoren. Za novi termin pošalji novi upit.',
    provider: 'Upit je zatvoren. U ovom MVP-u ga ne otvaramo ponovno i ne stvara rezervaciju.',
  },
  withdrawn: {
    owner: 'Povučen upit više nije aktivan.',
    provider: 'Vlasnik je povukao upit. Nema akcije, rezervacije ni zaključavanja termina.',
  },
};

function normalizeStatus(status: string): BookingRequestStatus {
  if (status === 'contacted' || status === 'closed' || status === 'withdrawn') return status;
  return 'pending';
}

function isProviderRequest(request: RequestSummary): request is ProviderBookingRequestSummary {
  return 'requesterEmail' in request;
}

function unreadBadge(count: number) {
  if (!count) return null;
  return <PetParkBadge label={`${count} novo`} tone="teal" />;
}

function listTitleFor(request: RequestSummary, role: Role) {
  if (role === 'owner' && 'providerName' in request) return request.providerName;
  if (isProviderRequest(request)) return request.requesterName ? `${request.requesterName} · ${request.serviceLabel}` : request.serviceLabel;
  return request.serviceLabel;
}

export function BookingRequestList({ requests, role, onRefresh }: { requests: RequestSummary[]; role: Role; onRefresh?: () => void }) {
  const router = useRouter();
  if (!requests.length) {
    return (
      <PetParkEmptyState
        title="Još nema upita"
        body={role === 'owner' ? 'Kad pošalješ upit pružatelju, pojavit će se ovdje.' : 'Novi upiti za tvoje usluge pojavit će se ovdje.'}
        actionLabel={onRefresh ? 'Osvježi' : undefined}
        onAction={onRefresh}
      />
    );
  }

  return (
    <View style={styles.list}>
      {requests.map((request) => (
        <PetParkListCard
          key={request.id}
          title={listTitleFor(request, role)}
          subtitle={`${request.serviceLabel} · ${request.petName} (${request.petType})`}
          meta={`${request.dateRange} · ${request.submittedAt}`}
          badge={unreadBadge(request.unreadNotificationCount) || <PetParkStatusChip status={request.status} />}
          onPress={() => router.push({ pathname: '/booking-requests/[id]', params: { id: request.id, role } } as any)}
        >
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText} numberOfLines={2}>{request.notes || 'Bez dodatne napomene.'}</Text>
            <Text style={styles.cardActionText}>Otvori detalje</Text>
          </View>
        </PetParkListCard>
      ))}
    </View>
  );
}

export function BookingRequestDetail({ request, role, onChanged }: { request: RequestSummary; role: Role; onChanged?: () => void }) {
  const status = normalizeStatus(request.status);
  return (
    <View style={styles.detailWrap}>
      <PetParkCard>
        <View style={styles.detailHeader}>
          <View style={styles.flexOne}>
            <Text style={styles.detailEyebrow}>{role === 'owner' ? 'Moj upit' : 'Upit za moju uslugu'}</Text>
            <Text style={styles.detailTitle}>{request.serviceLabel}</Text>
            <Text style={styles.detailMeta}>{request.petName} · {request.petType} · {request.dateRange}</Text>
          </View>
          <PetParkStatusChip status={status} />
        </View>
        <PetParkInfoCallout title="Što ovaj status znači" body={statusCopy[status][role]} tone={status === 'withdrawn' ? 'danger' : status === 'contacted' ? 'teal' : 'sage'} style={styles.block} />
        <PetParkInfoCallout title="Važno" body="Ovo je upit, ne potvrđena rezervacija. Nema plaćanja ni zaključavanja termina." tone="orange" style={styles.block} />
      </PetParkCard>

      <PetParkCard>
        <Text style={styles.sectionTitle}>Detalji</Text>
        <InfoRow label="Cijena" value={request.priceSnapshot} />
        <InfoRow label="Odgovor" value={request.responseTimeSnapshot} />
        <InfoRow label="Napomena" value={request.notes || 'Bez napomene.'} />
      </PetParkCard>

      <ContactCard request={request} role={role} />
      <ActivityTimeline events={request.events} />
      <RequestConversation requestId={request.id} enabled={request.conversationEnabled} />
      {role === 'owner' ? <OwnerWithdrawAction requestId={request.id} status={status} onChanged={onChanged} /> : <ProviderStatusActions requestId={request.id} status={status} onChanged={onChanged} />}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ContactCard({ request, role }: { request: RequestSummary; role: Role }) {
  if (role === 'owner' && !isProviderRequest(request)) {
    return (
      <PetParkCard>
        <Text style={styles.sectionTitle}>Kontakt koji si poslao/la</Text>
        <InfoRow label="E-mail" value={request.contactMethod.email || 'Nije upisan'} />
        <InfoRow label="Telefon" value={request.contactMethod.phone || 'Nije upisan'} />
        <PetParkInfoCallout body="Na owner strani kontakt je maskiran. Pružatelj ga vidi samo za upit koji si mu poslao/la." tone="sage" style={styles.block} />
      </PetParkCard>
    );
  }

  const providerRequest = request as ProviderBookingRequestSummary;
  return (
    <PetParkCard>
      <Text style={styles.sectionTitle}>Kontakt vlasnika</Text>
      <InfoRow label="Ime" value={providerRequest.requesterName || 'Vlasnik'} />
      <InfoRow label="E-mail" value={providerRequest.requesterEmail || 'Nije upisan'} />
      <InfoRow label="Telefon" value={providerRequest.requesterPhone || 'Nije upisan'} />
      <PetParkInfoCallout body="Kontakt je prikazan samo za upite vezane uz tvoje usluge." tone="sage" style={styles.block} />
    </PetParkCard>
  );
}

function ActivityTimeline({ events }: { events: BookingRequestEventSummary[] }) {
  return (
    <PetParkCard>
      <Text style={styles.sectionTitle}>Aktivnost</Text>
      {events.length ? events.map((event) => (
        <View key={event.id} style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          <View style={styles.flexOne}>
            <Text style={styles.timelineSummary}>{event.summary}</Text>
            <Text style={styles.timelineDate}>{event.createdAtLabel}</Text>
          </View>
        </View>
      )) : <Text style={styles.mutedText}>Još nema dodatne aktivnosti.</Text>}
    </PetParkCard>
  );
}

function RequestConversation({ requestId, enabled }: { requestId: string; enabled: boolean }) {
  const [messages, setMessages] = useState<BookingRequestMessage[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(enabled);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getBookingRequestMessages(requestId);
      setMessages(response.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Razgovor trenutno nije dostupan.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [requestId, enabled]);

  async function send() {
    const trimmed = body.trim();
    if (trimmed.length < 1 || trimmed.length > 2000) {
      setError('Poruka mora imati 1 do 2000 znakova.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const message = await sendBookingRequestMessage(requestId, trimmed);
      setMessages((current) => [...current, message]);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Slanje poruke nije uspjelo.');
    } finally {
      setSending(false);
    }
  }

  if (!enabled) {
    return <PetParkInfoCallout title="Razgovor nije dostupan" body="In-app razgovor je dostupan samo za upite poslane s prijavljenim PetPark računom." tone="muted" />;
  }

  return (
    <PetParkCard>
      <Text style={styles.sectionTitle}>Razgovor o upitu</Text>
      <Text style={styles.mutedText}>Razgovor je vezan samo uz ovaj upit. Ne stvara rezervaciju niti plaćanje, niti šalje poruke izvan PetParka.</Text>
      {loading ? <ActivityIndicator color={Colors.orangePrimary} style={styles.loader} /> : null}
      {messages.map((message) => (
        <View key={message.id} style={[styles.bubble, message.isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
          <Text style={styles.bubbleMeta}>{message.senderLabel} · {message.createdAtLabel}</Text>
          <Text style={styles.bubbleText}>{message.body}</Text>
        </View>
      ))}
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Napiši kratku poruku..."
        placeholderTextColor={Colors.muted}
        multiline
        maxLength={2000}
        style={styles.messageInput}
      />
      <Text style={styles.charCounter}>{body.length}/2000</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <PetParkButton title="Pošalji" onPress={send} loading={sending} disabled={sending || !body.trim()} />
    </PetParkCard>
  );
}

function OwnerWithdrawAction({ requestId, status, onChanged }: { requestId: string; status: BookingRequestStatus; onChanged?: () => void }) {
  const [loading, setLoading] = useState(false);
  const canWithdraw = status === 'pending' || status === 'contacted';
  if (!canWithdraw) {
    return <PetParkInfoCallout title="Nema dostupne akcije" body={status === 'closed' ? 'Upit je zatvoren i više ga nije moguće povući. Za novi termin pošalji novi upit.' : 'Povučen upit više nije aktivan. Pružatelj ga vidi kao povučen, ali se zapis ne briše.'} tone="muted" />;
  }

  async function run() {
    setLoading(true);
    try {
      await withdrawBookingRequest(requestId);
      Alert.alert('Upit je povučen', 'Osvježavam prikaz.');
      onChanged?.();
    } catch (err) {
      Alert.alert('Greška', err instanceof Error ? err.message : 'Upit trenutno nije moguće povući.');
    } finally {
      setLoading(false);
    }
  }

  return <PetParkButton title="Povuci upit" variant="outline" onPress={run} loading={loading} />;
}

function ProviderStatusActions({ requestId, status, onChanged }: { requestId: string; status: BookingRequestStatus; onChanged?: () => void }) {
  const [loading, setLoading] = useState<BookingRequestStatus | null>(null);
  if (status === 'withdrawn') return <PetParkInfoCallout title="Nema akcije" body="Vlasnik je povukao ovaj upit. Nema rezervacije ni zaključavanja termina." tone="muted" />;
  if (status === 'closed') return <PetParkInfoCallout title="Zatvoreno" body="Zatvoreni upiti se u ovom MVP-u ne otvaraju ponovno i ne stvaraju potvrđenu rezervaciju." tone="muted" />;

  async function run(nextStatus: 'contacted' | 'closed') {
    setLoading(nextStatus);
    try {
      await updateBookingRequestStatus(requestId, nextStatus);
      Alert.alert('Status ažuriran', 'Osvježavam prikaz.');
      onChanged?.();
    } catch (err) {
      Alert.alert('Greška', err instanceof Error ? err.message : 'Status trenutno nije moguće promijeniti.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <PetParkCard>
      <Text style={styles.sectionTitle}>Akcije</Text>
      <Text style={styles.mutedText}>Zatvaranje samo završava ručni follow-up — bez rezervacije, kalendara ili plaćanja.</Text>
      <View style={styles.actionStack}>
        {status === 'pending' ? <PetParkButton title="Označi kontaktirano" onPress={() => run('contacted')} loading={loading === 'contacted'} style={styles.flexOne} /> : null}
        <PetParkButton title="Zatvori" variant="outline" onPress={() => run('closed')} loading={loading === 'closed'} style={styles.flexOne} />
      </View>
    </PetParkCard>
  );
}

export function BookingRequestScreenShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>{title}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 20, gap: 16, paddingBottom: 44 },
  screenTitle: { color: Colors.forest, fontSize: 28, fontWeight: '900', lineHeight: 34 },
  list: { gap: 14 },
  cardFooter: { gap: 8 },
  cardFooterText: { color: Colors.mutedText, fontSize: 13, fontWeight: '700', lineHeight: 19 },
  cardActionText: { color: Colors.orangePrimary, fontSize: 13, fontWeight: '900', marginTop: 2 },
  detailWrap: { gap: 14 },
  detailHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  flexOne: { flex: 1 },
  detailEyebrow: { color: Colors.orangePrimary, fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  detailTitle: { color: Colors.forest, fontSize: 21, fontWeight: '900', lineHeight: 27, marginTop: 3 },
  detailMeta: { color: Colors.mutedText, fontSize: 13, fontWeight: '700', lineHeight: 19, marginTop: 5 },
  block: { marginTop: 12 },
  sectionTitle: { color: Colors.forest, fontSize: 18, fontWeight: '900', marginBottom: 10 },
  infoRow: { borderTopWidth: 1, borderTopColor: Colors.warmBorder, paddingVertical: 10, gap: 4 },
  infoLabel: { color: Colors.orangePrimary, fontSize: 11, fontWeight: '900', letterSpacing: 0.7, textTransform: 'uppercase' },
  infoValue: { color: Colors.text, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  timelineItem: { flexDirection: 'row', gap: 10, paddingVertical: 9 },
  timelineDot: { width: 9, height: 9, borderRadius: 999, backgroundColor: Colors.orangePrimary, marginTop: 5 },
  timelineSummary: { color: Colors.text, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  timelineDate: { color: Colors.mutedText, fontSize: 12, fontWeight: '700', marginTop: 2 },
  mutedText: { color: Colors.mutedText, fontSize: 13, fontWeight: '700', lineHeight: 20 },
  loader: { marginVertical: 12 },
  bubble: { borderRadius: 18, padding: 12, marginTop: 10, maxWidth: '88%' },
  ownBubble: { alignSelf: 'flex-end', backgroundColor: Colors.orangeSoft },
  otherBubble: { alignSelf: 'flex-start', backgroundColor: Colors.sageSurface },
  bubbleMeta: { color: Colors.mutedText, fontSize: 11, fontWeight: '800', marginBottom: 5 },
  bubbleText: { color: Colors.text, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  messageInput: { minHeight: 86, borderWidth: 1, borderColor: Colors.warmBorder, backgroundColor: Colors.white, color: Colors.text, borderRadius: 18, padding: 12, marginTop: 14, textAlignVertical: 'top', fontWeight: '700' },
  charCounter: { alignSelf: 'flex-end', color: Colors.mutedText, fontSize: 11, fontWeight: '800', marginTop: 6 },
  errorText: { color: Colors.error, fontSize: 12, fontWeight: '800', marginTop: 8 },
  actionStack: { gap: 10, marginTop: 14 },
});
