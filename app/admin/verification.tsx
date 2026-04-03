import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import {
  getPendingSitters,
  setSitterVerification,
  PendingSitter,
} from '../../lib/db';

export default function AdminVerificationScreen() {
  const [sitters, setSitters] = useState<PendingSitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    const data = await getPendingSitters();
    setSitters(data);
  }, []);

  useEffect(() => {
    fetchQueue().finally(() => setLoading(false));
  }, [fetchQueue]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQueue();
    setRefreshing(false);
  }, [fetchQueue]);

  const handleDecision = (sitter: PendingSitter, approved: boolean) => {
    const label = approved ? 'odobriti' : 'odbiti';
    Alert.alert(
      `${approved ? 'Odobri' : 'Odbij'} sitter-a`,
      `Jeste li sigurni da želite ${label} verifikaciju za ${sitter.name}?`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: approved ? 'Odobri' : 'Odbij',
          style: approved ? 'default' : 'destructive',
          onPress: () => executeDecision(sitter.id, approved),
        },
      ],
    );
  };

  const executeDecision = async (id: string, approved: boolean) => {
    setProcessingId(id);
    const notes = rejectNotes[id];
    const ok = await setSitterVerification(id, approved, notes);
    if (ok) {
      setSitters((prev) => prev.filter((s) => s.id !== id));
      Alert.alert('Gotovo', approved ? 'Sitter je odobren.' : 'Sitter je odbijen.');
    } else {
      Alert.alert('Greška', 'Nije uspjelo. Pokušajte ponovno.');
    }
    setProcessingId(null);
  };

  const renderDocument = (url: string, index: number) => {
    const isPdf = url.toLowerCase().endsWith('.pdf');
    return (
      <TouchableOpacity
        key={index}
        style={styles.docChip}
        onPress={() => Linking.openURL(url)}
      >
        <Ionicons
          name={isPdf ? 'document-text' : 'image'}
          size={16}
          color={Colors.primary}
        />
        <Text style={styles.docChipText} numberOfLines={1}>
          Dokument {index + 1}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSitter = ({ item }: { item: PendingSitter }) => {
    const isExpanded = expandedId === item.id;
    const isProcessing = processingId === item.id;

    return (
      <View style={styles.card}>
        {/* Header */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          activeOpacity={0.7}
        >
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={24} color={Colors.muted} />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.city}>
              <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />{' '}
              {item.city}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="time-outline" size={14} color="#2563EB" />
            <Text style={styles.statusText}>Na čekanju</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.muted}
          />
        </TouchableOpacity>

        {/* Expanded content */}
        {isExpanded && (
          <View style={styles.cardBody}>
            {/* Verification notes from sitter */}
            {item.verificationNotes ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Napomena sittera:</Text>
                <Text style={styles.sectionText}>{item.verificationNotes}</Text>
              </View>
            ) : null}

            {/* Documents */}
            {item.verificationDocuments.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  Dokumenti ({item.verificationDocuments.length}):
                </Text>
                <View style={styles.docsRow}>
                  {item.verificationDocuments.map(renderDocument)}
                </View>
              </View>
            )}

            {/* Admin notes input (for rejection reason) */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Admin napomena (opcionalno):</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Razlog odbijanja ili dodatne napomene..."
                placeholderTextColor={Colors.muted}
                multiline
                value={rejectNotes[item.id] ?? ''}
                onChangeText={(t) =>
                  setRejectNotes((prev) => ({ ...prev, [item.id]: t }))
                }
              />
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnReject]}
                onPress={() => handleDecision(item, false)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={Colors.error} />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={18} color={Colors.error} />
                    <Text style={styles.btnRejectText}>Odbij</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnApprove]}
                onPress={() => handleDecision(item, true)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    <Text style={styles.btnApproveText}>Odobri</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Učitavanje zahtjeva...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Disclaimer banner */}
      <View style={styles.banner}>
        <Ionicons name="shield-checkmark" size={18} color="#92400E" />
        <Text style={styles.bannerText}>
          Interni admin prikaz — bez autentifikacije. Samo za ovlaštene osobe.
        </Text>
      </View>

      {sitters.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="checkmark-done-circle" size={64} color={Colors.success} />
          <Text style={styles.emptyTitle}>Nema zahtjeva na čekanju</Text>
          <Text style={styles.emptySubtitle}>Svi zahtjevi su obrađeni.</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh" size={18} color={Colors.primary} />
            <Text style={styles.refreshBtnText}>Osvježi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sitters}
          keyExtractor={(item) => item.id}
          renderItem={renderSitter}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <Text style={styles.queueCount}>
              {sitters.length} zahtjev{sitters.length !== 1 ? 'a' : ''} na čekanju
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 15 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  bannerText: { flex: 1, fontSize: 13, color: '#92400E', fontWeight: '500' },

  list: { padding: 16, paddingBottom: 40 },
  queueCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text },
  city: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },

  cardBody: { paddingHorizontal: 14, paddingBottom: 14 },
  section: { marginTop: 10 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  sectionText: { fontSize: 14, color: Colors.text, lineHeight: 20 },

  docsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  docChipText: { fontSize: 13, color: Colors.text, maxWidth: 120 },

  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnReject: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  btnRejectText: { fontSize: 15, fontWeight: '600', color: Colors.error },
  btnApprove: { backgroundColor: Colors.success },
  btnApproveText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  refreshBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
});
