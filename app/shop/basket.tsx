import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Colors } from '../../lib/colors';
import { createShopCheckout, formatPrice } from '../../lib/shop';
import { useShopCart } from '../../lib/shop-context';
import { useAuth } from '../../lib/auth-context';

export default function CartScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { items, loading, clearCart, removeFromCart, updateQuantity, getSubtotal } = useShopCart();
  const [paying, setPaying] = useState(false);

  const subtotal = getSubtotal();
  const vat = subtotal * 0.25;
  const total = subtotal + vat;

  async function handleCheckout() {
    if (!items.length) return;
    setPaying(true);
    try {
      const result = await createShopCheckout(items, session?.access_token);
      if (result?.url) {
        await Linking.openURL(result.url);
        return;
      }
      router.push('/payments/checkout' as never);
    } catch (error) {
      Alert.alert('Checkout nije dostupan', error instanceof Error ? error.message : 'Pokušaj ponovno kasnije.');
    } finally {
      setPaying(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ title: 'Košarica' }} />
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : !items.length ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Košarica je prazna</Text>
          <Text style={styles.emptyText}>Dodaj proizvode iz shopa i vrati se ovdje.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/shop' as never)}>
            <Text style={styles.primaryButtonText}>Idi u shop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            {items.map((item) => (
              <Swipeable
                key={`${item.product.id}-${item.selectedVariant ?? 'default'}`}
                renderRightActions={() => (
                  <TouchableOpacity style={styles.deleteAction} onPress={() => removeFromCart(item.product.id, item.selectedVariant)}>
                    <Ionicons name="trash-outline" size={22} color={Colors.white} />
                  </TouchableOpacity>
                )}
              >
                <View style={styles.itemCard}>
                  <View style={styles.itemEmojiWrap}><Text style={styles.itemEmoji}>{item.product.emoji}</Text></View>
                  <View style={styles.itemBody}>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.itemMeta}>{item.product.brand}{item.selectedVariant ? ` · ${item.selectedVariant}` : ''}</Text>
                    <View style={styles.itemFooter}>
                      <View style={styles.qtyRow}>
                        <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedVariant)}><Ionicons name="remove" size={16} color={Colors.text} /></TouchableOpacity>
                        <Text style={styles.qtyValue}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariant)}><Ionicons name="add" size={16} color={Colors.text} /></TouchableOpacity>
                      </View>
                      <Text style={styles.itemPrice}>{formatPrice(item.product.price * item.quantity)}</Text>
                    </View>
                  </View>
                </View>
              </Swipeable>
            ))}

            <TouchableOpacity onPress={clearCart} style={styles.clearButton}><Text style={styles.clearButtonText}>Isprazni košaricu</Text></TouchableOpacity>
          </ScrollView>

          <View style={styles.summary}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Međuzbroj</Text><Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>PDV (25%)</Text><Text style={styles.summaryValue}>{formatPrice(vat)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Dostava</Text><Text style={[styles.summaryValue, { color: Colors.success }]}>Besplatna</Text></View>
            <View style={styles.summaryRow}><Text style={styles.totalLabel}>Ukupno</Text><Text style={styles.totalValue}>{formatPrice(total)}</Text></View>
            <TouchableOpacity style={[styles.primaryButton, paying && { opacity: 0.6 }]} disabled={paying} onPress={() => void handleCheckout()}>
              <Text style={styles.primaryButtonText}>{paying ? 'Otvaram checkout...' : 'Nastavi na plaćanje'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { padding: 16, paddingBottom: 220, gap: 12 },
  itemCard: { flexDirection: 'row', gap: 12, backgroundColor: Colors.white, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#FED7AA' },
  itemEmojiWrap: { width: 72, height: 72, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF7ED' },
  itemEmoji: { fontSize: 34 },
  itemBody: { flex: 1, justifyContent: 'space-between' },
  itemName: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  itemMeta: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyButton: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  qtyValue: { color: Colors.text, fontWeight: '700' },
  itemPrice: { color: Colors.primary, fontWeight: '800' },
  summary: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, gap: 10, borderTopWidth: 1, borderColor: Colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: Colors.textSecondary },
  summaryValue: { color: Colors.text, fontWeight: '600' },
  totalLabel: { color: Colors.text, fontWeight: '800', fontSize: 18 },
  totalValue: { color: Colors.primary, fontWeight: '800', fontSize: 20 },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 6 },
  primaryButtonText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', marginTop: 8 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 16 },
  deleteAction: { backgroundColor: Colors.error, width: 72, alignItems: 'center', justifyContent: 'center', borderRadius: 20, marginBottom: 12 },
  clearButton: { alignSelf: 'flex-end', marginTop: 4 },
  clearButtonText: { color: Colors.error, fontWeight: '700' },
});
