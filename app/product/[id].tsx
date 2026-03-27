import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { products } from '../../lib/mock-data';
import { useCart } from '../../lib/cart-context';
import Button from '../../components/Button';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Proizvod nije pronađen</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.categoryRow}>
          <Text style={styles.category}>{product.category}</Text>
        </View>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={18} color={Colors.star} />
          <Text style={styles.rating}>{product.rating}</Text>
        </View>
        <Text style={styles.price}>{product.price.toFixed(2)}€</Text>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opis</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalji</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Kategorija</Text>
            <Text style={styles.detailValue}>{product.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dostupnost</Text>
            <Text style={[styles.detailValue, { color: Colors.success }]}>Na zalihi</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dostava</Text>
            <Text style={styles.detailValue}>2-4 radna dana</Text>
          </View>
        </View>

        {/* Add to cart */}
        <Button
          title="Dodaj u košaricu"
          onPress={() => addToCart(product)}
          size="large"
          style={{ width: '100%', marginTop: 24 }}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: 250,
  },
  info: {
    padding: 20,
  },
  categoryRow: {
    marginBottom: 8,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.muted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
