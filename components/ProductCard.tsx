import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../lib/colors';
import { Product } from '../lib/mock-data';

interface ProductCardProps {
  product: Product;
  horizontal?: boolean;
}

export default function ProductCard({ product, horizontal }: ProductCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.card, horizontal && styles.horizontalCard]}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
      </View>
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={12} color={Colors.star} />
        <Text style={styles.rating}>{product.rating}</Text>
      </View>
      <Text style={styles.price}>{product.price.toFixed(2)}€</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginRight: 12,
  },
  horizontalCard: {
    marginBottom: 0,
  },
  imageContainer: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 80,
    borderRadius: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: Colors.muted,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});
