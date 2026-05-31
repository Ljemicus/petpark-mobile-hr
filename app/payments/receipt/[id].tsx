// Payment Receipt Screen
// app/payments/receipt/[id].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '../../../lib/colors';
import {
  getPaymentReceipt,
  formatCurrency,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  type PaymentReceipt,
} from '../../../lib/payments';
import { SERVICE_LABELS } from '../../../lib/booking-types';
import PetParkLogo from '../../../components/PetParkLogo';

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadReceipt();
    }
  }, [id]);

  async function loadReceipt() {
    try {
      setLoading(true);
      const data = await getPaymentReceipt(id);
      if (data) {
        setReceipt(data);
      } else {
        setError('Potvrda nije pronađena');
      }
    } catch (err) {
      setError('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!receipt) return;

    const message = `
PetPark - Potvrda plaćanja
─────────────────────
Usluga: ${SERVICE_LABELS[receipt.service_type as keyof typeof SERVICE_LABELS] || receipt.service_type}
Iznos: ${formatCurrency(receipt.total_paid)}
Datum: ${new Date(receipt.paid_at).toLocaleDateString('hr-HR')}
ID: ${receipt.payment_id.slice(0, 8)}
─────────────────────
Hvala na korištenju PetPark!
    `.trim();

    try {
      await Share.share({
        message,
        title: 'Potvrda plaćanja - PetPark',
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Potvrda' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !receipt) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Potvrda' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Potvrda nije pronađena'}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Natrag</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Potvrda plaćanja' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Header */}
          <View style={styles.header}>
            <PetParkLogo width={160} style={styles.logoImage} />
            <Text style={styles.receiptTitle}>POTVRDA PLAĆANJA</Text>
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>PLAĆENO</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalji transakcije</Text>

            <View style={styles.row}>
              <Text style={styles.label}>ID transakcije</Text>
              <Text style={styles.value}>{receipt.payment_id.slice(0, 12)}...</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Datum</Text>
              <Text style={styles.value}>
                {new Date(receipt.paid_at).toLocaleDateString('hr-HR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Vrijeme</Text>
              <Text style={styles.value}>
                {new Date(receipt.paid_at).toLocaleTimeString('hr-HR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Service Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usluga</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Tip usluge</Text>
              <Text style={styles.value}>
                {SERVICE_LABELS[receipt.service_type as keyof typeof SERVICE_LABELS] ||
                  receipt.service_type}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Čuvar</Text>
              <Text style={styles.value}>{receipt.sitter_name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Vlasnik</Text>
              <Text style={styles.value}>{receipt.owner_name}</Text>
            </View>

            {receipt.pet_name && (
              <View style={styles.row}>
                <Text style={styles.label}>Ljubimac</Text>
                <Text style={styles.value}>{receipt.pet_name}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Payment Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalji plaćanja</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Osnovni iznos</Text>
              <Text style={styles.value}>{formatCurrency(receipt.amount)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Naknada platforme (10%)</Text>
              <Text style={styles.value}>{formatCurrency(receipt.platform_fee)}</Text>
            </View>

            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>UKUPNO PLAĆENO</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(receipt.total_paid)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Hvala na korištenju PetPark! 🐾</Text>
            <Text style={styles.footerSubtext}>
              Za pitanja kontaktirajte nas: info@petpark.hr
            </Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 Podijeli potvrdu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Natrag na povijest</Text>
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
    padding: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  receiptCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoImage: {
    marginBottom: 8,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 12,
  },
  paidBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paidText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 4,
  },
  shareButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
