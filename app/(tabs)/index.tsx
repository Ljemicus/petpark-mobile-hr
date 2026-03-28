import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { Sitter, products, quickActions } from '../../lib/mock-data';
import { getSitters } from '../../lib/db';
import SearchBar from '../../components/SearchBar';
import SitterCard from '../../components/SitterCard';
import ProductCard from '../../components/ProductCard';

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [featuredSitters, setFeaturedSitters] = useState<Sitter[]>([]);
  const [loadingSitters, setLoadingSitters] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getSitters();
      setFeaturedSitters(data.slice(0, 6));
      setLoadingSitters(false);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.logo}>🐾 Šapica</Text>
          <Text style={styles.heroTitle}>Pronađi savršenog{'\n'}sittera za ljubimca</Text>
          <Text style={styles.heroSubtitle}>Marketplace za pet sitting u Hrvatskoj</Text>
          <View style={styles.searchContainer}>
            <SearchBar
              placeholder="Pretraži sittere, proizvode..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                onPress={() => router.push(action.route as any)}
              >
                <View style={styles.quickActionIcon}>
                  <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
                </View>
                <Text style={styles.quickActionText}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Sitters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popularni sitteri</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAll}>Vidi sve</Text>
            </TouchableOpacity>
          </View>
          {loadingSitters ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <FlatList
              horizontal
              data={featuredSitters}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <SitterCard sitter={item} horizontal />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              scrollEnabled={true}
            />
          )}
        </View>

        {/* New in Shop */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Novo u shopu</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/shop')}>
              <Text style={styles.seeAll}>Vidi sve</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={products.slice(0, 8)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard product={item} horizontal />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            scrollEnabled={true}
          />
        </View>

        {/* Grooming */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✂️ Grooming</Text>
            <TouchableOpacity onPress={() => router.push('/grooming' as any)}>
              <Text style={styles.seeAll}>Vidi sve</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {[
              { id: 'g1', name: 'Salon Tessa', city: 'Rijeka', rating: 4.8, price: '20€', emoji: '✂️' },
              { id: 'g2', name: 'Mambo', city: 'Zagreb', rating: 4.9, price: '30€', emoji: '👑' },
              { id: 'g3', name: 'La Bestia', city: 'Zagreb', rating: 4.8, price: '28€', emoji: '🏆' },
              { id: 'g4', name: 'DOG BAR', city: 'Rijeka', rating: 4.6, price: '22€', emoji: '🛁' },
            ].map((g) => (
              <TouchableOpacity key={g.id} style={styles.miniCard} onPress={() => router.push('/grooming' as any)}>
                <View style={[styles.miniCardIcon, { backgroundColor: '#fff7ed' }]}>
                  <Text style={{ fontSize: 24 }}>{g.emoji}</Text>
                </View>
                <Text style={styles.miniCardName} numberOfLines={1}>{g.name}</Text>
                <Text style={styles.miniCardCity}>{g.city}</Text>
                <View style={styles.miniCardFooter}>
                  <Text style={styles.miniCardRating}>⭐ {g.rating}</Text>
                  <Text style={styles.miniCardPrice}>od {g.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Dresura */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎓 Dresura</Text>
            <TouchableOpacity onPress={() => router.push('/training' as any)}>
              <Text style={styles.seeAll}>Vidi sve</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {[
              { id: 't1', name: 'Centar Kliker', city: 'Zagreb', rating: 4.9, price: '30€', emoji: '🎯' },
              { id: 't2', name: 'Kala K9', city: 'Zagreb', rating: 4.8, price: '35€', emoji: '🏋️' },
              { id: 't3', name: 'K9 Team', city: 'Zagreb', rating: 4.7, price: '25€', emoji: '🛡️' },
              { id: 't4', name: 'NannyDog', city: 'Split', rating: 4.7, price: '22€', emoji: '🎓' },
            ].map((t) => (
              <TouchableOpacity key={t.id} style={styles.miniCard} onPress={() => router.push('/training' as any)}>
                <View style={[styles.miniCardIcon, { backgroundColor: '#f5f3ff' }]}>
                  <Text style={{ fontSize: 24 }}>{t.emoji}</Text>
                </View>
                <Text style={styles.miniCardName} numberOfLines={1}>{t.name}</Text>
                <Text style={styles.miniCardCity}>{t.city}</Text>
                <View style={styles.miniCardFooter}>
                  <Text style={styles.miniCardRating}>⭐ {t.rating}</Text>
                  <Text style={styles.miniCardPrice}>od {t.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Text style={styles.ctaEmoji}>🐕</Text>
          <Text style={styles.ctaTitle}>Postani sitter</Text>
          <Text style={styles.ctaText}>Zarađuj čuvajući ljubimce u svom gradu</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/register')}>
            <Text style={styles.ctaButtonText}>Registriraj se</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 16,
  },
  searchContainer: {
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  quickActions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickAction: {
    alignItems: 'center',
    width: 72,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionEmoji: {
    fontSize: 28,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  cta: {
    margin: 20,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  ctaEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  ctaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  miniCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    width: 140,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  miniCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  miniCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  miniCardCity: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  miniCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniCardRating: {
    fontSize: 11,
    color: '#666',
  },
  miniCardPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
