import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../lib/colors';
import { formatPrice, getProductBySlug, getProductReviews, getRelatedProducts, type Product, type ProductReview } from '../../lib/shop';
import { useShopCart } from '../../lib/shop-context';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { addToCart, getItemCount } = useShopCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!slug) return;
      const found = await getProductBySlug(slug);
      if (!found) {
        if (!cancelled) setLoading(false);
        return;
      }
      const [loadedReviews, loadedRelated] = await Promise.all([
        getProductReviews(found.id),
        getRelatedProducts(found.id),
      ]);
      if (!cancelled) {
        setProduct(found);
        setSelectedVariant(found.variants[0]?.value);
        setReviews(loadedReviews);
        setRelated(loadedRelated);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const images = useMemo(() => product?.images?.length ? product.images : product ? [product.emoji, product.emoji, product.emoji] : [], [product]);

  if (loading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator color={Colors.primary} /><Text style={styles.helper}>Učitavanje proizvoda...</Text></SafeAreaView>;
  }

  if (!product) {
    return <SafeAreaView style={styles.center}><Text style={styles.title}>Proizvod nije pronađen</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: product.name,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/shop/basket' as never)}>
              <Ionicons name="cart-outline" size={22} color={Colors.text} />
              {getItemCount() > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{getItemCount()}</Text></View> : null}
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.galleryCard}>
          <Text style={styles.mainImage}>{images[activeImage]}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
            {images.map((image, index) => (
              <TouchableOpacity key={`${image}-${index}`} style={[styles.thumb, index === activeImage && styles.thumbActive]} onPress={() => setActiveImage(index)}>
                <Text style={styles.thumbText}>{image}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.brand}>{product.brand}</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color={Colors.star} />
          <Text style={styles.helper}>{product.rating.toFixed(1)} ({product.reviewCount} recenzija)</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {product.originalPrice ? <Text style={styles.oldPrice}>{formatPrice(product.originalPrice)}</Text> : null}
        </View>

        <Text style={styles.description}>{product.description}</Text>

        {product.variants.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{product.variants[0]?.label}</Text>
            <View style={styles.variantRow}>
              {product.variants.map((variant) => (
                <TouchableOpacity
                  key={variant.value}
                  style={[styles.variantChip, selectedVariant === variant.value && styles.variantChipActive]}
                  onPress={() => setSelectedVariant(variant.value)}
                >
                  <Text style={[styles.variantText, selectedVariant === variant.value && styles.variantTextActive]}>{variant.value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Količina</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity((value) => Math.max(1, value - 1))}><Ionicons name="remove" size={18} color={Colors.text} /></TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity((value) => value + 1)}><Ionicons name="add" size={18} color={Colors.text} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Specifikacije</Text>
          {Object.entries(product.specs).map(([label, value]) => (
            <View key={label} style={styles.specRow}><Text style={styles.specLabel}>{label}</Text><Text style={styles.specValue}>{value}</Text></View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recenzije</Text>
          {reviews.length ? reviews.map((review) => (
            <View key={review.id} style={styles.reviewRow}>
              <View style={styles.reviewHeader}><Text style={styles.reviewAuthor}>{review.authorName}</Text><Text style={styles.helper}>{review.createdAt}</Text></View>
              <Text style={styles.helper}>⭐ {review.rating}/5</Text>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          )) : <Text style={styles.helper}>Još nema recenzija.</Text>}
        </View>

        {related.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Povezani proizvodi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRow}>
              {related.map((item) => (
                <TouchableOpacity key={item.id} style={styles.relatedCard} onPress={() => router.replace(`/shop/${item.slug}` as never)}>
                  <Text style={styles.relatedEmoji}>{item.emoji}</Text>
                  <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.relatedPrice}>{formatPrice(item.price)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => {
            addToCart(product, quantity, selectedVariant);
            Alert.alert('Dodano u košaricu', `${product.name} je dodan u košaricu.`);
          }}
        >
          <Ionicons name="cart-outline" size={18} color={Colors.white} />
          <Text style={styles.footerButtonText}>Dodaj u košaricu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  content: { padding: 16, paddingBottom: 120, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF7ED' },
  galleryCard: { backgroundColor: Colors.white, borderRadius: 24, padding: 16, alignItems: 'center' },
  mainImage: { fontSize: 120, textAlign: 'center' },
  thumbRow: { gap: 10, paddingTop: 12 },
  thumb: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FED7AA' },
  thumbActive: { borderColor: Colors.primary, backgroundColor: '#FFEDD5' },
  thumbText: { fontSize: 28 },
  category: { color: Colors.primary, fontWeight: '700', textTransform: 'capitalize' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text },
  brand: { color: Colors.textSecondary, fontSize: 15 },
  helper: { color: Colors.textSecondary },
  ratingRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { color: Colors.primary, fontSize: 30, fontWeight: '800' },
  oldPrice: { color: Colors.muted, textDecorationLine: 'line-through' },
  description: { color: Colors.text, lineHeight: 22 },
  section: { gap: 10 },
  sectionCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: Colors.white, borderWidth: 1, borderColor: '#FED7AA' },
  variantChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  variantText: { color: Colors.text, fontWeight: '600' },
  variantTextActive: { color: Colors.white },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  quantityButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FED7AA' },
  quantityValue: { fontSize: 20, fontWeight: '700', color: Colors.text },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  specLabel: { color: Colors.textSecondary, flex: 1 },
  specValue: { color: Colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  reviewRow: { gap: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  reviewAuthor: { color: Colors.text, fontWeight: '700' },
  reviewComment: { color: Colors.text },
  relatedRow: { gap: 12 },
  relatedCard: { width: 130, backgroundColor: Colors.white, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: '#FED7AA' },
  relatedEmoji: { fontSize: 42, textAlign: 'center', marginBottom: 8 },
  relatedName: { color: Colors.text, fontWeight: '700', fontSize: 13, minHeight: 34 },
  relatedPrice: { color: Colors.primary, fontWeight: '800', marginTop: 8 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  footerButton: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  footerButtonText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  badge: { position: 'absolute', right: -8, top: -6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
});
