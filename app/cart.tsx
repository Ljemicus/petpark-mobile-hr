import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';
import { useCart } from '../lib/cart-context';
import Button from '../components/Button';

export default function CartScreen() {
  const router = useRouter();
  const { items, addToCart, removeFromCart, getTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Košarica je prazna</Text>
        <Text style={styles.emptySubtitle}>Dodajte proizvode iz shopa</Text>
        <Button title="Idi u shop" onPress={() => router.back()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemEmoji}>
              <Text style={styles.emoji}>{item.product.emoji}</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>{item.product.price.toFixed(2)}€</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity style={styles.qtyButton} onPress={() => removeFromCart(item.product.id)}>
                <Ionicons name="remove" size={18} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qtyButton} onPress={() => addToCart(item.product)}>
                <Ionicons name="add" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Ukupno:</Text>
          <Text style={styles.totalValue}>{getTotal().toFixed(2)}€</Text>
        </View>
        <Button title="Naruči" onPress={() => {}} size="large" style={{ width: '100%' }} />
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Text style={styles.clearText}>Isprazni košaricu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.muted,
    marginTop: 4,
  },
  list: {
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemEmoji: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  clearButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  clearText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
});
