// Wallet / Balance Screen - for sitters/groomers
// app/payments/wallet.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';
import {
  getWalletBalance,
  getPayoutHistory,
  requestPayout,
  formatCurrency,
  PAYOUT_STATUS_COLORS,
  PAYOUT_STATUS_LABELS,
  type WalletBalance,
  type Payout,
} from '../../lib/payments';

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [balance, setBalance] = useState<WalletBalance>({
    available: 0,
    pending: 0,
    currency: 'EUR',
  });
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!user?.id) return;
    const [bal, hist] = await Promise.all([
      getWalletBalance(user.id),
      getPayoutHistory(user.id),
    ]);
    setBalance(bal);
    setPayouts(hist);
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleRequestPayout() {
    if (!user?.id || balance.available <= 0) return;

    Alert.alert(
      'Zatraži isplatu',
      `Želite li zatražiti isplatu od ${formatCurrency(balance.available)}?`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Zatraži',
          onPress: async () => {
            setRequesting(true);
            const result = await requestPayout(user.id, balance.available);
            if (result) {
              Alert.alert('Uspjeh', 'Zahtjev za isplatu je poslan');
              await loadData();
            } else {
              Alert.alert('Greška', 'Nije moguće poslati zahtjev za isplatu');
            }
            setRequesting(false);
          },
        },
      ]
    );
  }

  function getStatusColor(status: string): string {
    return PAYOUT_STATUS_COLORS[status as keyof typeof PAYOUT_STATUS_COLORS] || Colors.muted;
  }

  function getStatusLabel(status: string): string {
    return PAYOUT_STATUS_LABELS[status as keyof typeof PAYOUT_STATUS_LABELS] || status;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Novčanik' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Novčanik' }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Dostupno za isplatu</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance.available)}</Text>

          {balance.pending > 0 && (
            <View style={styles.pendingRow}>
              <Text style={styles.pendingLabel}>U obradi:</Text>
              <Text style={styles.pendingAmount}>{formatCurrency(balance.pending)}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.payoutButton,
              (balance.available <= 0 || requesting) && styles.payoutButtonDisabled,
            ]}
            onPress={handleRequestPayout}
            disabled={balance.available <= 0 || requesting}
          >
            {requesting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.payoutButtonText}>
                {balance.available > 0 ? 'Zatraži isplatu' : 'Nema dostupnih sredstava'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💰</Text>
            <Text style={styles.infoTitle}>Zarada</Text>
            <Text style={styles.infoDesc}>Primajte 90% od svake rezervacije</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🏦</Text>
            <Text style={styles.infoTitle}>Isplata</Text>
            <Text style={styles.infoDesc}>Isplate na bankovni račun unutar 3-5 radnih dana</Text>
          </View>
        </View>

        {/* Payout History */}
        <Text style={styles.sectionTitle}>Povijest isplata</Text>

        {payouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Nema isplata</Text>
            <Text style={styles.emptyText}>Još nemate zaprimljenih isplata.</Text>
          </View>
        ) : (
          <View style={styles.payoutsList}>
            {payouts.map((payout) => (
              <View key={payout.id} style={styles.payoutCard}>
                <View style={styles.payoutHeader}>
                  <View>
                    <Text style={styles.payoutAmount}>
                      {formatCurrency(payout.amount)}
                    </Text>
                    <Text style={styles.payoutDate}>
                      {new Date(payout.created_at).toLocaleDateString('hr-HR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(payout.status) + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(payout.status) }]}>
                      {getStatusLabel(payout.status)}
                    </Text>
                  </View>
                </View>

                {payout.stripe_payout_id && (
                  <Text style={styles.payoutId}>
                    ID: {payout.stripe_payout_id.slice(0, 12)}...
                  </Text>
                )}

                {payout.processed_at && (
                  <Text style={styles.processedDate}>
                    Obrađeno: {new Date(payout.processed_at).toLocaleDateString('hr-HR')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Connect Stripe CTA */}
        <TouchableOpacity
          style={styles.connectCard}
          onPress={() => router.push('/dashboard/sitter/settings')}
        >
          <Text style={styles.connectTitle}>⚙️ Postavke plaćanja</Text>
          <Text style={styles.connectText}>
            Upravljajte svojim Stripe računom i bankovnim podacima
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    color: Colors.white,
    opacity: 0.9,
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pendingLabel: {
    color: Colors.white,
    opacity: 0.8,
    fontSize: 13,
    marginRight: 4,
  },
  pendingAmount: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
  },
  payoutButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  payoutButtonDisabled: {
    opacity: 0.6,
  },
  payoutButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  payoutsList: {
    gap: 12,
  },
  payoutCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  payoutDate: {
    fontSize: 13,
    color: Colors.muted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  payoutId: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 4,
  },
  processedDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  connectCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  connectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  connectText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
