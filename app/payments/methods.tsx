// Payment Methods Screen
// app/payments/methods.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { Colors } from '../../lib/colors';
import {
  getPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  type PaymentMethod,
} from '../../lib/payments';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadMethods();
  }, []);

  async function loadMethods() {
    if (!user?.id) return;
    setLoading(true);
    const data = await getPaymentMethods(user.id);
    setMethods(data);
    setLoading(false);
  }

  function getCardIcon(brand?: string): string {
    const icons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      default: '💳',
    };
    return icons[brand?.toLowerCase() || ''] || icons.default;
  }

  async function handleSetDefault(id: string) {
    if (!user?.id || processing) return;
    setProcessing(id);
    const success = await setDefaultPaymentMethod(user.id, id);
    if (success) {
      await loadMethods();
    } else {
      Alert.alert('Greška', 'Nije moguće postaviti kao zadano');
    }
    setProcessing(null);
  }

  async function handleDelete(id: string) {
    if (!user?.id || processing) return;

    Alert.alert(
      'Ukloni karticu',
      'Jeste li sigurni da želite ukloniti ovu karticu?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Ukloni',
          style: 'destructive',
          onPress: async () => {
            setProcessing(id);
            const success = await deletePaymentMethod(user.id, id);
            if (success) {
              await loadMethods();
            } else {
              Alert.alert('Greška', 'Nije moguće ukloniti karticu');
            }
            setProcessing(null);
          },
        },
      ]
    );
  }

  function handleAddCard() {
    // For now, show info that cards are added during checkout
    // In future, could implement Stripe SetupIntent for adding cards directly
    Alert.alert(
      'Dodaj karticu',
      'Kartice se dodaju automatski tijekom prvog plaćanja. Nakon uspješnog plaćanja, možete je koristiti za buduće transakcije.',
      [{ text: 'OK' }]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Načini plaćanja' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Načini plaćanja' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Spremne kartice</Text>
        <Text style={styles.subtitle}>Upravljajte svojim karticama za brže plaćanje</Text>

        {methods.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>Nema spremljenih kartica</Text>
            <Text style={styles.emptyText}>
              Kartice se dodaju automatski nakon prvog uspješnog plaćanja putem Stripe-a.
            </Text>
          </View>
        ) : (
          <View style={styles.methodsList}>
            {methods.map((method) => (
              <View key={method.id} style={styles.methodCard}>
                <View style={styles.methodHeader}>
                  <Text style={styles.cardIcon}>{getCardIcon(method.card_brand)}</Text>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardBrand}>
                      {method.card_brand?.toUpperCase() || 'Kartica'}
                    </Text>
                    <Text style={styles.cardNumber}>•••• {method.card_last4}</Text>
                  </View>
                  {method.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Zadano</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.expiry}>
                  Istječe: {method.card_exp_month?.toString().padStart(2, '0')}/
                  {method.card_exp_year}
                </Text>

                <View style={styles.actions}>
                  {!method.is_default && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.defaultButton]}
                      onPress={() => handleSetDefault(method.id)}
                      disabled={processing === method.id}
                    >
                      {processing === method.id ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <Text style={styles.defaultButtonText}>Postavi kao zadano</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(method.id)}
                    disabled={processing === method.id}
                  >
                    {processing === method.id ? (
                      <ActivityIndicator size="small" color={Colors.error} />
                    ) : (
                      <Text style={styles.deleteButtonText}>Ukloni</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
          <Text style={styles.addButtonText}>+ Kako dodati karticu?</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔒 Sigurnost</Text>
          <Text style={styles.infoText}>
            Vaše kartične podatke ne spremamo direktno. Koristimo Stripe - svjetski
            standard za sigurna online plaćanja. Svi podaci su enkriptirani i sigurni.
          </Text>
        </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
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
    paddingHorizontal: 24,
  },
  methodsList: {
    gap: 12,
  },
  methodCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  cardNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  defaultBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  expiry: {
    fontSize: 13,
    color: Colors.muted,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  defaultButton: {
    backgroundColor: Colors.primaryLight + '20',
  },
  defaultButtonText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    color: Colors.error,
    fontWeight: '500',
  },
  addButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
