// Payment History Screen
// app/payments/history.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';
import {
  getPaymentHistory,
  formatCurrency,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  type Payment,
} from '../../lib/payments';
import { SERVICE_LABELS } from '../../lib/booking-types';

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'paid' | 'refunded'>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    if (!user?.id) return;
    const data = await getPaymentHistory(user.id);
    setPayments(data);
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  }

  const filteredPayments = payments.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  function getStatusColor(status: string): string {
    return PAYMENT_STATUS_COLORS[status as keyof typeof PAYMENT_STATUS_COLORS] || Colors.muted;
  }

  function getStatusLabel(status: string): string {
    return PAYMENT_STATUS_LABELS[status as keyof typeof PAYMENT_STATUS_LABELS] || status;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Povijest plaćanja' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Povijest plaćanja' }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Povijest plaćanja</Text>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'paid', 'refunded'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[styles.filterText, filter === f && styles.filterTextActive]}
              >
                {f === 'all' ? 'Sve' : f === 'paid' ? 'Plaćeno' : 'Vraćeno'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{payments.length}</Text>
            <Text style={styles.summaryLabel}>Ukupno transakcija</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {formatCurrency(
                payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
              )}
            </Text>
            <Text style={styles.summaryLabel}>Ukupno plaćeno</Text>
          </View>
        </View>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>Nema transakcija</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'Još nemate nijednu transakciju.'
                : 'Nema transakcija za odabrani filter.'}
            </Text>
          </View>
        ) : (
          <View style={styles.paymentsList}>
            {filteredPayments.map((payment) => (
              <TouchableOpacity
                key={payment.id}
                style={styles.paymentCard}
                onPress={() => router.push(`/payments/receipt/${payment.id}`)}
              >
                <View style={styles.paymentHeader}>
                  <View>
                    <Text style={styles.serviceType}>
                      {SERVICE_LABELS[payment.booking?.service_type as keyof typeof SERVICE_LABELS] ||
                        'Usluga'}
                    </Text>
                    <Text style={styles.paymentDate}>
                      {new Date(payment.created_at).toLocaleDateString('hr-HR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(payment.status) + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                      {getStatusLabel(payment.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.paymentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Iznos</Text>
                    <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Naknada platforme</Text>
                    <Text style={styles.fee}>{formatCurrency(payment.platform_fee)}</Text>
                  </View>
                  {payment.booking?.sitter?.name && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Čuvar</Text>
                      <Text style={styles.detailValue}>{payment.booking.sitter.name}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.receiptHint}>
                  <Text style={styles.receiptText}>Pogledaj detalje →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.white,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  paymentsList: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  paymentDate: {
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
  paymentDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  fee: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  receiptHint: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  receiptText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
});
