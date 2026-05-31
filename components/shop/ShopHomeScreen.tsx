import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../../lib/colors';
import SearchBar from '../SearchBar';
import { PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORY_EMOJI, formatPrice, getProducts, type Product, type ProductCategory } from '../../lib/shop';
import { useShopCart } from '../../lib/shop-context';

function ShopItemCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useShopCart();

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => router.push(`/shop/${product.slug}` as never)}>
      <View style={styles.cardMedia}>
        <Text style={styles.cardEmoji}>{product.emoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={Colors.star} />
          <Text style={styles.ratingText}>{product.rating.toFixed(1)} ({product.reviewCount})</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.cardBrand}>{product.brand}</Text>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.cardPrice}>{formatPrice(product.price)}</Text>
            {product.originalPrice ? <Text style={styles.oldPrice}>{formatPrice(product.originalPrice)}</Text> : null}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => addToCart(product)}>
            <Ionicons name="cart-outline" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ShopHomeScreen() {
  const router = useRouter();
  const { getItemCount } = useShopCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  const load = useCallback(async () => {
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(() => (Object.keys(PRODUCT_CATEGORY_LABELS) as ProductCategory[]).map((category) => ({
    category,
    label: PRODUCT_CATEGORY_LABELS[category],
    emoji: PRODUCT_CATEGORY_EMOJI[category],
    count: products.filter((product) => product.category === category).length,
  })), [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchesSearch = q
        ? [product.name, product.brand, product.description].some((field) => field.toLowerCase().includes(q))
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [products, search, selectedCategory]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Shop',
          headerRight: () => (
            <TouchableOpacity style={styles.cartHeaderButton} onPress={() => router.push('/shop/basket' as never)}>
              <Ionicons name="cart-outline" size={22} color={Colors.text} />
              {getItemCount() > 0 ? (
                <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{getItemCount()}</Text></View>
              ) : null}
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={Colors.primary} />}
        ListHeaderComponent={(
          <View>
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>PetPark Shop 🛍️</Text>
              <Text style={styles.heroSubtitle}>Hrana, igračke i oprema za vašeg ljubimca.</Text>
              <SearchBar placeholder="Pretraži proizvode..." value={search} onChangeText={setSearch} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow} style={styles.categoriesWrap}>
              <TouchableOpacity style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]} onPress={() => setSelectedCategory(null)}>
                <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>Sve</Text>
              </TouchableOpacity>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item.category}
                  style={[styles.categoryChip, selectedCategory === item.category && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(selectedCategory === item.category ? null : item.category)}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === item.category && styles.categoryChipTextActive]}>{item.emoji} {item.label} ({item.count})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.resultsText}>{filteredProducts.length} proizvoda</Text>
          </View>
        )}
        ListEmptyComponent={loading ? (
          <View style={styles.emptyState}><ActivityIndicator color={Colors.primary} /><Text style={styles.emptyText}>Učitavanje shopa...</Text></View>
        ) : (
          <View style={styles.emptyState}><Text style={styles.emptyEmoji}>🐾</Text><Text style={styles.emptyTitle}>Nema rezultata</Text><Text style={styles.emptyText}>Probaj drugi pojam ili makni filter.</Text></View>
        )}
        renderItem={({ item }) => <ShopItemCard product={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  listContent: { paddingBottom: 24, paddingHorizontal: 16 },
  hero: { backgroundColor: '#FFF7ED', paddingTop: 8, paddingBottom: 16, gap: 12 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.text },
  heroSubtitle: { color: Colors.textSecondary, fontSize: 15 },
  categoriesWrap: { marginBottom: 12 },
  categoriesRow: { gap: 8, paddingRight: 16 },
  categoryChip: { backgroundColor: Colors.white, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#FED7AA' },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { color: Colors.text, fontWeight: '600', fontSize: 13 },
  categoryChipTextActive: { color: Colors.white },
  resultsText: { marginBottom: 12, color: Colors.textSecondary, fontWeight: '600' },
  gridRow: { gap: 12 },
  card: { flex: 1, backgroundColor: Colors.white, borderRadius: 18, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: '#FFEDD5' },
  cardMedia: { aspectRatio: 1, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 52 },
  cardBody: { padding: 12, gap: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: Colors.textSecondary, fontSize: 11 },
  cardTitle: { color: Colors.text, fontWeight: '700', fontSize: 14, minHeight: 36 },
  cardBrand: { color: Colors.muted, fontSize: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  cardPrice: { color: Colors.primary, fontWeight: '800', fontSize: 15 },
  oldPrice: { color: Colors.muted, textDecorationLine: 'line-through', fontSize: 11 },
  addButton: { backgroundColor: Colors.primary, borderRadius: 12, padding: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 10 },
  emptyEmoji: { fontSize: 42 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyText: { color: Colors.textSecondary, textAlign: 'center' },
  cartHeaderButton: { padding: 4 },
  cartBadge: { position: 'absolute', right: -4, top: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
});
