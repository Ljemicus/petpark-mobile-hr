import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { products, shopCategories } from '../../lib/mock-data';
import ProductCard from '../../components/ProductCard';
import CategoryCard from '../../components/CategoryCard';
import { useCart } from '../../lib/cart-context';

export default function ShopScreen() {
  const router = useRouter();
  const { getItemCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cart button */}
      <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
        <Ionicons name="cart-outline" size={24} color={Colors.primary} />
        {getItemCount() > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{getItemCount()}</Text>
          </View>
        )}
        <Text style={styles.cartText}>Košarica</Text>
      </TouchableOpacity>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kategorije</Text>
        <View style={styles.categoriesGrid}>
          {shopCategories.map((cat) => (
            <View key={cat.id} style={styles.categoryItem}>
              <CategoryCard
                emoji={cat.emoji}
                name={cat.name}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? selectedCategory : 'Svi proizvodi'}
          </Text>
          {selectedCategory && (
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Text style={styles.clearFilter}>Očisti filter</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          horizontal
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
          scrollEnabled={true}
        />
      </View>

      {/* All products vertical */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popularno</Text>
        <View style={styles.productsGrid}>
          {filteredProducts.slice(0, 6).map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard product={product} />
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 8,
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  cartBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  cartText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  clearFilter: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '22%',
  },
  productsList: {
    paddingRight: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
  },
});
